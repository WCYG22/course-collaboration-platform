/**
 * Courses Routes
 * Course CRUD, enrollment, materials management
 */

import express, { Response } from 'express';
import { db, dbType } from '../config/database.js';
import { verifyToken, requireRole, AuthRequest } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all courses (with enrollment status for students)
router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    let courses: any[];
    
    if (dbType === 'postgres') {
      const result = await (db as any).query(`
        SELECT c.*, u.name as instructor_name,
        ARRAY_AGG(e.student_id) FILTER (WHERE e.student_id IS NOT NULL) as enrolled_students
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.id
        LEFT JOIN enrollments e ON c.id = e.course_id
        GROUP BY c.id, u.name
        ORDER BY c.created_at DESC
      `);
      courses = result.rows;
    } else {
      const allCourses = (db as any).prepare(`
        SELECT c.*, u.name as instructor_name
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.id
        ORDER BY c.created_at DESC
      `).all();

      courses = allCourses.map((course: any) => {
        const enrollments = (db as any).prepare(
          'SELECT student_id FROM enrollments WHERE course_id = ?'
        ).all(course.id);
        
        course.enrolled_students = enrollments.map((e: any) => e.student_id);
        return course;
      });
    }

    // Get weeks and materials for each course
    for (const course of courses) {
      let weeks: any[];
      
      if (dbType === 'postgres') {
        const weeksResult = await (db as any).query(
          'SELECT * FROM course_weeks WHERE course_id = $1 ORDER BY week_number',
          [course.id]
        );
        weeks = weeksResult.rows;
      } else {
        weeks = (db as any).prepare(
          'SELECT * FROM course_weeks WHERE course_id = ? ORDER BY week_number'
        ).all(course.id);
      }

      for (const week of weeks) {
        let materials: any[];
        
        if (dbType === 'postgres') {
          const materialsResult = await (db as any).query(
            'SELECT * FROM materials WHERE week_id = $1 ORDER BY created_at',
            [week.id]
          );
          materials = materialsResult.rows;
        } else {
          materials = (db as any).prepare(
            'SELECT * FROM materials WHERE week_id = ? ORDER BY created_at'
          ).all(week.id);
        }

        week.materials = materials;
      }

      course.weeks = weeks;
    }

    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get single course by ID
router.get('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    let course: any;
    
    if (dbType === 'postgres') {
      const result = await (db as any).query(
        'SELECT c.*, u.name as instructor_name FROM courses c LEFT JOIN users u ON c.instructor_id = u.id WHERE c.id = $1',
        [id]
      );
      course = result.rows[0];
    } else {
      course = (db as any).prepare(
        'SELECT c.*, u.name as instructor_name FROM courses c LEFT JOIN users u ON c.instructor_id = u.id WHERE c.id = ?'
      ).get(id);
    }

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Get enrolled students
    if (dbType === 'postgres') {
      const enrollmentsResult = await (db as any).query(
        'SELECT student_id FROM enrollments WHERE course_id = $1',
        [id]
      );
      course.enrolled_students = enrollmentsResult.rows.map((e: any) => e.student_id);
    } else {
      const enrollments = (db as any).prepare(
        'SELECT student_id FROM enrollments WHERE course_id = ?'
      ).all(id);
      course.enrolled_students = enrollments.map((e: any) => e.student_id);
    }

    // Get weeks and materials
    let weeks: any[];
    if (dbType === 'postgres') {
      const weeksResult = await (db as any).query(
        'SELECT * FROM course_weeks WHERE course_id = $1 ORDER BY week_number',
        [id]
      );
      weeks = weeksResult.rows;
    } else {
      weeks = (db as any).prepare(
        'SELECT * FROM course_weeks WHERE course_id = ? ORDER BY week_number'
      ).all(id);
    }

    for (const week of weeks) {
      if (dbType === 'postgres') {
        const materialsResult = await (db as any).query(
          'SELECT * FROM materials WHERE week_id = $1',
          [week.id]
        );
        week.materials = materialsResult.rows;
      } else {
        week.materials = (db as any).prepare(
          'SELECT * FROM materials WHERE week_id = ?'
        ).all(week.id);
      }
    }

    course.weeks = weeks;

    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Create new course (instructors only)
router.post('/', verifyToken, requireRole('instructor'), async (req: AuthRequest, res: Response) => {
  try {
    const { code, name, description } = req.body;

    if (!code || !name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }

    const courseId = uuidv4();

    if (dbType === 'postgres') {
      await (db as any).query(
        'INSERT INTO courses (id, code, name, description, instructor_id) VALUES ($1, $2, $3, $4, $5)',
        [courseId, code, name, description || '', req.user!.id]
      );
    } else {
      (db as any).prepare(
        'INSERT INTO courses (id, code, name, description, instructor_id) VALUES (?, ?, ?, ?, ?)'
      ).run(courseId, code, name, description || '', req.user!.id);
    }

    // Create default weeks
    const defaultWeeks = [
      { number: 1, title: 'Week 1: Foundations & Setup' },
      { number: 2, title: 'Week 2: Core Concepts' },
    ];

    for (const week of defaultWeeks) {
      const weekId = uuidv4();
      if (dbType === 'postgres') {
        await (db as any).query(
          'INSERT INTO course_weeks (id, course_id, week_number, title) VALUES ($1, $2, $3, $4)',
          [weekId, courseId, week.number, week.title]
        );
      } else {
        (db as any).prepare(
          'INSERT INTO course_weeks (id, course_id, week_number, title) VALUES (?, ?, ?, ?)'
        ).run(weekId, courseId, week.number, week.title);
      }
    }

    res.status(201).json({ 
      message: 'Course created successfully',
      courseId 
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Enroll in course (students only)
router.post('/:id/enroll', verifyToken, requireRole('student'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if already enrolled
    let existing;
    if (dbType === 'postgres') {
      const result = await (db as any).query(
        'SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2',
        [id, req.user!.id]
      );
      existing = result.rows[0];
    } else {
      existing = (db as any).prepare(
        'SELECT id FROM enrollments WHERE course_id = ? AND student_id = ?'
      ).get(id, req.user!.id);
    }

    if (existing) {
      return res.status(409).json({ error: 'Already enrolled in this course' });
    }

    const enrollmentId = uuidv4();

    if (dbType === 'postgres') {
      await (db as any).query(
        'INSERT INTO enrollments (id, course_id, student_id) VALUES ($1, $2, $3)',
        [enrollmentId, id, req.user!.id]
      );
    } else {
      (db as any).prepare(
        'INSERT INTO enrollments (id, course_id, student_id) VALUES (?, ?, ?)'
      ).run(enrollmentId, id, req.user!.id);
    }

    res.json({ message: 'Enrolled successfully' });
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({ error: 'Failed to enroll' });
  }
});

// Unenroll from course (students only)
router.delete('/:id/enroll', verifyToken, requireRole('student'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (dbType === 'postgres') {
      await (db as any).query(
        'DELETE FROM enrollments WHERE course_id = $1 AND student_id = $2',
        [id, req.user!.id]
      );
    } else {
      (db as any).prepare(
        'DELETE FROM enrollments WHERE course_id = ? AND student_id = ?'
      ).run(id, req.user!.id);
    }

    res.json({ message: 'Unenrolled successfully' });
  } catch (error) {
    console.error('Unenroll error:', error);
    res.status(500).json({ error: 'Failed to unenroll' });
  }
});

// Add week to course (instructors only)
router.post('/:id/weeks', verifyToken, requireRole('instructor'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { week_number, title } = req.body;

    if (!week_number || !title) {
      return res.status(400).json({ error: 'Week number and title are required' });
    }

    const weekId = uuidv4();

    if (dbType === 'postgres') {
      await (db as any).query(
        'INSERT INTO course_weeks (id, course_id, week_number, title) VALUES ($1, $2, $3, $4)',
        [weekId, id, week_number, title]
      );
    } else {
      (db as any).prepare(
        'INSERT INTO course_weeks (id, course_id, week_number, title) VALUES (?, ?, ?, ?)'
      ).run(weekId, id, week_number, title);
    }

    res.status(201).json({ 
      message: 'Week added successfully',
      weekId 
    });
  } catch (error) {
    console.error('Add week error:', error);
    res.status(500).json({ error: 'Failed to add week' });
  }
});

// Update course (instructors only)
router.put('/:id', verifyToken, requireRole('instructor'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = ${dbType === 'postgres' ? '$' + paramCount++ : '?'}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = ${dbType === 'postgres' ? '$' + paramCount++ : '?'}`);
      values.push(description);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const query = `UPDATE courses SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                   WHERE id = ${dbType === 'postgres' ? '$' + paramCount : '?'}`;

    if (dbType === 'postgres') {
      await (db as any).query(query, values);
    } else {
      (db as any).prepare(query).run(...values);
    }

    res.json({ message: 'Course updated successfully' });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Delete course (instructors only)
router.delete('/:id', verifyToken, requireRole('instructor'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (dbType === 'postgres') {
      await (db as any).query('DELETE FROM courses WHERE id = $1 AND instructor_id = $2', [id, req.user!.id]);
    } else {
      (db as any).prepare('DELETE FROM courses WHERE id = ? AND instructor_id = ?').run(id, req.user!.id);
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

export default router;
