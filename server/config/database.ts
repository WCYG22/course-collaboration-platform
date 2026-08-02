/**
 * Database Configuration
 * Supports both PostgreSQL and SQLite for development
 */

import { Pool } from 'pg';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration from environment variables
const DB_TYPE = process.env.DB_TYPE || 'sqlite'; // 'postgres' or 'sqlite'

// PostgreSQL configuration
let pgPool: Pool | null = null;

if (DB_TYPE === 'postgres') {
  pgPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'caml_lms',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20, // Maximum pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pgPool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
    process.exit(-1);
  });
}

// SQLite configuration (for development)
let sqliteDb: Database.Database | null = null;

if (DB_TYPE === 'sqlite') {
  const dbPath = path.join(__dirname, '..', 'database', 'caml_lms.db');
  sqliteDb = new Database(dbPath);
  sqliteDb.pragma('journal_mode = WAL');
  sqliteDb.pragma('foreign_keys = ON');
}

export const db = DB_TYPE === 'postgres' ? pgPool : sqliteDb;
export const dbType = DB_TYPE;

export async function initializeDatabase() {
  if (DB_TYPE === 'postgres' && pgPool) {
    try {
      await pgPool.query('SELECT NOW()');
      console.log('✅ PostgreSQL database connected successfully');
    } catch (error) {
      console.error('❌ PostgreSQL connection failed:', error);
      throw error;
    }
  } else if (DB_TYPE === 'sqlite' && sqliteDb) {
    console.log('✅ SQLite database initialized successfully');
    // Create tables for SQLite
    await createSQLiteTables();
  }
}

async function createSQLiteTables() {
  if (!sqliteDb) return;

  const schema = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT CHECK (role IN ('student', 'instructor')) NOT NULL,
      avatar TEXT,
      skills TEXT,
      preferred_mode TEXT CHECK (preferred_mode IN ('Online', 'Offline', 'Hybrid')),
      availability TEXT,
      login_count INTEGER DEFAULT 0,
      material_views_count INTEGER DEFAULT 0,
      discussion_count INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      instructor_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS course_weeks (
      id TEXT PRIMARY KEY,
      course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
      week_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      week_id TEXT REFERENCES course_weeks(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      type TEXT CHECK (type IN ('lecture', 'reading', 'tutorial')) NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size TEXT,
      mime_type TEXT,
      download_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY,
      course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
      student_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(course_id, student_id)
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      marks INTEGER NOT NULL,
      deadline DATETIME NOT NULL,
      allowed_file_types TEXT,
      max_file_size INTEGER,
      is_resubmission_allowed INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      assignment_id TEXT REFERENCES assignments(id) ON DELETE CASCADE,
      student_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size TEXT,
      version INTEGER DEFAULT 1,
      status TEXT CHECK (status IN ('Submitted', 'Graded')) DEFAULT 'Submitted',
      grade INTEGER,
      feedback TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      graded_at DATETIME,
      UNIQUE(assignment_id, student_id, version)
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
      author_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      published_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS discussion_posts (
      id TEXT PRIMARY KEY,
      course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      likes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS discussion_replies (
      id TEXT PRIMARY KEY,
      post_id TEXT REFERENCES discussion_posts(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT CHECK (type IN ('announcement', 'assignment', 'grade', 'collaboration')) NOT NULL,
      course_code TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      material_id TEXT REFERENCES materials(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, material_id)
    );

    CREATE TABLE IF NOT EXISTS private_messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      recipient_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
      student_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      status TEXT CHECK (status IN ('present', 'absent', 'late')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(course_id, student_id, date)
    );

    CREATE TABLE IF NOT EXISTS calendar_events (
      id TEXT PRIMARY KEY,
      course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      event_type TEXT CHECK (event_type IN ('assignment', 'exam', 'lecture', 'office_hours', 'meeting')) NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      location TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      time_limit INTEGER,
      total_marks INTEGER NOT NULL,
      is_published INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quiz_questions (
      id TEXT PRIMARY KEY,
      quiz_id TEXT REFERENCES quizzes(id) ON DELETE CASCADE,
      question_text TEXT NOT NULL,
      question_type TEXT CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')) NOT NULL,
      options TEXT,
      correct_answer TEXT NOT NULL,
      marks INTEGER NOT NULL,
      order_num INTEGER
    );

    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id TEXT PRIMARY KEY,
      quiz_id TEXT REFERENCES quizzes(id) ON DELETE CASCADE,
      student_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      answers TEXT NOT NULL,
      score INTEGER,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  sqliteDb.exec(schema);
  console.log('✅ SQLite tables created successfully');
}

export async function closeDatabase() {
  if (DB_TYPE === 'postgres' && pgPool) {
    await pgPool.end();
    console.log('PostgreSQL pool closed');
  } else if (DB_TYPE === 'sqlite' && sqliteDb) {
    sqliteDb.close();
    console.log('SQLite database closed');
  }
}
