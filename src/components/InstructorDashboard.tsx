/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Course, Assignment, Submission, Announcement, Material } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  BookOpen, Plus, FolderPlus, BellRing, Settings, Calendar, Award, 
  CheckCircle, ShieldAlert, BarChart2, Users, FileText, Send, 
  Trash2, UserX, UserCheck, ChevronRight, GraduationCap, ArrowRight, TrendingUp, X, User as UserIcon, UserPlus, Search, Edit3, Check
} from 'lucide-react';

interface InstructorDashboardProps {
  currentUser: User;
  courses: Course[];
  assignments: Assignment[];
  submissions: Submission[];
  announcements: Announcement[];
  allUsers: User[];
  onAddCourse: (course: Course) => void;
  onUpdateCourse: (courseId: string, updatedWeeks: any[]) => void;
  onUpdateCourseEnrollment?: (courseId: string, enrolledStudentIds: string[]) => void;
  onAddAnnouncement: (courseId: string, title: string, content: string) => void;
  onAddAssignment: (assignment: Assignment) => void;
  onGradeSubmission: (submissionId: string, grade: number, feedback: string) => void;
  onGradeStudent?: (assignmentId: string, studentId: string, grade: number, feedback: string) => void;
  onTriggerNotification: (title: string, message: string, type: 'assignment' | 'announcement' | 'grade' | 'collaboration') => void;
}

export default function InstructorDashboard({
  currentUser,
  courses,
  assignments,
  submissions,
  announcements,
  allUsers,
  onAddCourse,
  onUpdateCourse,
  onUpdateCourseEnrollment,
  onAddAnnouncement,
  onAddAssignment,
  onGradeSubmission,
  onGradeStudent,
  onTriggerNotification,
}: InstructorDashboardProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [activeSubTab, setActiveSubTab] = useState<'materials' | 'assignments' | 'grading' | 'insights' | 'announcements' | 'enrollment'>('insights');

  // Grading form state
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState<number>(100);
  const [feedbackInput, setFeedbackInput] = useState<string>('');

  // Direct Student Grade Modal state
  const [showDirectGradeModal, setShowDirectGradeModal] = useState<boolean>(false);
  const [directGradeStudentId, setDirectGradeStudentId] = useState<string>('');
  const [directGradeAssignmentId, setDirectGradeAssignmentId] = useState<string>('');
  const [directGradeScore, setDirectGradeScore] = useState<number>(100);
  const [directGradeFeedback, setDirectGradeFeedback] = useState<string>('');

  // Enrollment management state
  const [enrollSearchQuery, setEnrollSearchQuery] = useState<string>('');
  const [selectedStudentToEnroll, setSelectedStudentToEnroll] = useState<string>('');

  // Grading list view filter
  const [gradingFilter, setGradingFilter] = useState<'all' | 'pending' | 'graded' | 'gradebook'>('all');

  // Course space builder states (UC-INS-01)
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');

  // Material upload state (UC-INS-02)
  const [uploadMaterialWeekId, setUploadMaterialWeekId] = useState<string | null>(null);
  const [matTitle, setMatTitle] = useState('');
  const [matType, setMatType] = useState<'lecture' | 'reading' | 'tutorial'>('lecture');
  const [matFileName, setMatFileName] = useState('');
  const [matFileSize, setMatFileSize] = useState('');

  // New Announcement state (UC-INS-03)
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  // New Assignment state (UC-INS-04)
  const [asgTitle, setAsgTitle] = useState('');
  const [asgDesc, setAsgDesc] = useState('');
  const [asgMarks, setAsgMarks] = useState<number>(100);
  const [asgDeadline, setAsgDeadline] = useState('2026-08-09T23:59:00');
  const [asgAllowedTypes, setAsgAllowedTypes] = useState<string[]>(['pdf', 'zip']);
  const [asgMaxSize, setAsgMaxSize] = useState<number>(15);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  // 1. Calculations for Instructor Insights (UC-INS-06) & Enrollment
  const students = allUsers.filter(u => u.role === 'student');
  const enrolledStudentsList = students.filter(s => selectedCourse?.enrolledStudents.includes(s.id));
  const nonEnrolledStudentsList = students.filter(s => !selectedCourse?.enrolledStudents.includes(s.id));
  
  // Course-specific calculations
  const courseAssignments = assignments.filter(a => a.courseId === selectedCourseId);
  const totalMaterialsCount = selectedCourse?.weeks.reduce((acc, w) => acc + w.materials.length, 0) || 0;
  const courseSubmissions = submissions.filter(s => 
    courseAssignments.some(asg => asg.id === s.assignmentId)
  );
  
  const gradedCount = courseSubmissions.filter(s => s.status === 'Graded').length;
  const pendingCount = courseSubmissions.length - gradedCount;

  // Student academic performance analytics calculations
  const studentPerformanceData = students.map(student => {
    const studentSubs = courseSubmissions.filter(s => s.studentId === student.id);
    const gradedSubs = studentSubs.filter(s => s.status === 'Graded' && s.grade !== null);
    const avgGrade = gradedSubs.length > 0 
      ? Math.round(gradedSubs.reduce((acc, s) => acc + (s.grade || 0), 0) / gradedSubs.length)
      : null;
    const submittedCount = studentSubs.length;
    const totalAsgs = courseAssignments.length;
    const submissionRatePct = totalAsgs > 0 ? Math.round((submittedCount / totalAsgs) * 100) : 0;

    let academicStatus: 'High Performer' | 'On Track' | 'Needs Attention' = 'On Track';
    if (totalAsgs > 0 && submittedCount < totalAsgs) {
      academicStatus = 'Needs Attention';
    } else if (avgGrade !== null) {
      if (avgGrade >= 85) academicStatus = 'High Performer';
      else if (avgGrade < 70) academicStatus = 'Needs Attention';
      else academicStatus = 'On Track';
    }

    return {
      student,
      submittedCount,
      totalAsgs,
      submissionRatePct,
      avgGrade,
      academicStatus,
    };
  });

  const totalPossibleSubmissions = students.length * courseAssignments.length;
  const overallSubmissionRate = totalPossibleSubmissions > 0
    ? Math.round((courseSubmissions.length / totalPossibleSubmissions) * 100)
    : 0;

  const allGradedScores = courseSubmissions
    .filter(s => s.status === 'Graded' && s.grade !== null)
    .map(s => s.grade as number);
  const classAvgGrade = allGradedScores.length > 0
    ? Math.round(allGradedScores.reduce((a, b) => a + b, 0) / allGradedScores.length)
    : null;

  const atRiskStudentsCount = studentPerformanceData.filter(d => d.academicStatus === 'Needs Attention').length;

  // Recharts chart dataset for academic overview
  const academicChartData = studentPerformanceData.map(d => ({
    name: d.student.name.split(' ')[0],
    fullName: d.student.name,
    'Average Grade': d.avgGrade !== null ? d.avgGrade : 0,
    'Submissions Rate (%)': d.submissionRatePct,
  }));

  // Pie chart data for student submissions review status
  const submissionsPieData = [
    { name: 'Graded', value: gradedCount },
    { name: 'Pending Review', value: pendingCount },
  ];
  const PIE_COLORS = ['#10b981', '#f59e0b']; // emerald, amber

  // Handlers
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseName) return;
    const newCourse: Course = {
      id: `course_${Date.now()}`,
      code: newCourseCode.toUpperCase().trim(),
      name: newCourseName.trim(),
      description: newCourseDesc.trim(),
      instructorName: currentUser.name,
      enrolledStudents: [], // Students have full flexibility to enter and enroll in the course space voluntarily
      weeks: [
        { id: `week_1_${Date.now()}`, number: 1, title: 'Week 1: Foundations & Setup', materials: [] },
        { id: `week_2_${Date.now()}`, number: 2, title: 'Week 2: Iteration Plan', materials: [] },
      ]
    };
    onAddCourse(newCourse);
    setSelectedCourseId(newCourse.id);
    setShowCourseForm(false);
    setNewCourseCode('');
    setNewCourseName('');
    setNewCourseDesc('');
    
    onTriggerNotification(
      'New Course Created',
      `Course Space for ${newCourse.code} is successfully configured. Organised by weeks.`,
      'collaboration'
    );
  };

  const handleUploadMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle || !matFileName || !selectedCourse || !uploadMaterialWeekId) return;

    const newMaterial: Material = {
      id: `mat_${Date.now()}`,
      title: matTitle,
      type: matType,
      fileName: matFileName,
      fileSize: matFileSize || '1.5 MB',
      downloadCount: 0,
    };

    const updatedWeeks = selectedCourse.weeks.map(w => {
      if (w.id === uploadMaterialWeekId) {
        return { ...w, materials: [...w.materials, newMaterial] };
      }
      return w;
    });

    onUpdateCourse(selectedCourse.id, updatedWeeks);
    setUploadMaterialWeekId(null);
    setMatTitle('');
    setMatFileName('');
    setMatFileSize('');

    onTriggerNotification(
      'Material Uploaded',
      `Lecturer uploaded ${newMaterial.type}: "${newMaterial.title}" to Week section.`,
      'announcement'
    );
  };

  const handleAddAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent || !selectedCourse) return;

    onAddAnnouncement(selectedCourse.id, annTitle, annContent);
    setAnnTitle('');
    setAnnContent('');

    onTriggerNotification(
      'New Announcement',
      `${currentUser.name} published an announcement for ${selectedCourse.code}.`,
      'announcement'
    );
  };

  const handleCreateAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle || !selectedCourse) return;

    const newAsg: Assignment = {
      id: `asg_${Date.now()}`,
      courseId: selectedCourse.id,
      title: asgTitle,
      description: asgDesc,
      marks: asgMarks,
      deadline: new Date(asgDeadline).toISOString(),
      allowedFileTypes: asgAllowedTypes,
      maxFileSize: asgMaxSize,
      isResubmissionAllowed: true,
    };

    onAddAssignment(newAsg);
    setAsgTitle('');
    setAsgDesc('');
    setAsgMarks(100);

    onTriggerNotification(
      'New Assignment Created',
      `New assignment details published for ${selectedCourse.code}: ${newAsg.title}`,
      'assignment'
    );
  };

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmissionId) return;

    // Validate grade is bounded 0 to 100
    const finalGrade = Math.max(0, Math.min(100, gradeInput));

    onGradeSubmission(gradingSubmissionId, finalGrade, feedbackInput);
    
    const sub = submissions.find(s => s.id === gradingSubmissionId);
    if (sub) {
      onTriggerNotification(
        'Assignment Graded',
        `Your submission for "${sub.studentName}" was graded: ${finalGrade}/100.`,
        'grade'
      );
    }

    setGradingSubmissionId(null);
    setFeedbackInput('');
  };

  // Enrollment management handlers
  const handleEnrollStudent = (studentId: string) => {
    if (!selectedCourse) return;
    if (selectedCourse.enrolledStudents.includes(studentId)) return;
    const updated = [...selectedCourse.enrolledStudents, studentId];
    if (onUpdateCourseEnrollment) {
      onUpdateCourseEnrollment(selectedCourse.id, updated);
    }
    const student = allUsers.find(u => u.id === studentId);
    onTriggerNotification(
      'Student Enrolled',
      `${student?.name || 'Student'} was successfully enrolled into ${selectedCourse.code}.`,
      'collaboration'
    );
  };

  const handleRemoveStudent = (studentId: string) => {
    if (!selectedCourse) return;
    const updated = selectedCourse.enrolledStudents.filter(id => id !== studentId);
    if (onUpdateCourseEnrollment) {
      onUpdateCourseEnrollment(selectedCourse.id, updated);
    }
    const student = allUsers.find(u => u.id === studentId);
    onTriggerNotification(
      'Student Enrollment Removed',
      `${student?.name || 'Student'} was removed from ${selectedCourse.code}.`,
      'collaboration'
    );
  };

  const handleEnrollAllStudents = () => {
    if (!selectedCourse) return;
    const allStudentIds = students.map(s => s.id);
    if (onUpdateCourseEnrollment) {
      onUpdateCourseEnrollment(selectedCourse.id, allStudentIds);
    }
    onTriggerNotification(
      'Bulk Enrollment Updated',
      `All ${allStudentIds.length} platform student accounts are now enrolled in ${selectedCourse.code}.`,
      'collaboration'
    );
  };

  // Direct Student Grade Handler
  const handleDirectGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directGradeStudentId || !directGradeAssignmentId) return;

    const boundedScore = Math.max(0, Math.min(100, directGradeScore));

    if (onGradeStudent) {
      onGradeStudent(directGradeAssignmentId, directGradeStudentId, boundedScore, directGradeFeedback);
    } else {
      const existingSub = courseSubmissions.find(s => s.assignmentId === directGradeAssignmentId && s.studentId === directGradeStudentId);
      if (existingSub) {
        onGradeSubmission(existingSub.id, boundedScore, directGradeFeedback);
      }
    }

    const student = allUsers.find(u => u.id === directGradeStudentId);
    const asg = courseAssignments.find(a => a.id === directGradeAssignmentId);

    onTriggerNotification(
      'Student Grade Recorded',
      `Recorded grade ${boundedScore}/100 for ${student?.name} on "${asg?.title}".`,
      'grade'
    );

    setShowDirectGradeModal(false);
    setDirectGradeStudentId('');
    setDirectGradeAssignmentId('');
    setDirectGradeFeedback('');
    setDirectGradeScore(100);
  };

  return (
    <div id="instructor-dashboard" className="w-full px-4 sm:px-8 lg:px-10 py-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
        <div>
          <span className="text-xs font-extrabold text-indigo-600 font-mono uppercase tracking-wider block mb-1">
            Instructor Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Course Management & Grading
          </h1>
          <p className="text-sm sm:text-base text-slate-700 mt-1 font-medium">
            Publish weekly syllabus materials, set assignments, grade submissions, and view engagement metrics.
          </p>
        </div>
        
        <button
          onClick={() => setShowCourseForm(!showCourseForm)}
          className="flex items-center space-x-2 px-5 py-3 bg-slate-950 hover:bg-slate-900 text-white font-bold text-sm rounded-xl transition-all shadow-sm self-start sm:self-center cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Course Space</span>
        </button>
      </div>

      {/* Create Course Form centered modal popup */}
      {showCourseForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200 shadow-2xl max-w-lg w-full space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base font-mono uppercase tracking-wider">Configure New Course Space</h3>
              <button onClick={() => setShowCourseForm(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCourse} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-700 font-mono font-extrabold uppercase block mb-1.5">Course Code</label>
                  <input
                    type="text"
                    required
                    value={newCourseCode}
                    onChange={e => setNewCourseCode(e.target.value)}
                    placeholder="e.g. XBAU2114N"
                    className="w-full text-sm px-4 py-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 transition-colors font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-mono font-extrabold uppercase block mb-1.5">Course Name</label>
                  <input
                    type="text"
                    required
                    value={newCourseName}
                    onChange={e => setNewCourseName(e.target.value)}
                    placeholder="e.g. Software Methodologies"
                    className="w-full text-sm px-4 py-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 transition-colors font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-700 font-mono font-extrabold uppercase block mb-1.5">Description</label>
                <textarea
                  value={newCourseDesc}
                  onChange={e => setNewCourseDesc(e.target.value)}
                  placeholder="Course objectives, target syllabus..."
                  rows={3}
                  className="w-full text-sm px-4 py-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 transition-colors resize-none font-medium"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCourseForm(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-slate-950 hover:bg-slate-850 text-white font-bold text-sm py-3 rounded-xl transition-all cursor-pointer"
                >
                  Setup Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unified Top Navigation: Active Course + Lecturer Workflows Tabs */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200/90 shadow-xs space-y-5 mb-8">
        
        {/* Row 1: Select Active Course */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2 shrink-0">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-mono font-extrabold uppercase text-slate-700 tracking-wider">
              Select Active Course:
            </span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 sm:pb-0 font-mono text-sm w-full sm:w-auto">
            {courses.map(course => (
              <button
                key={course.id}
                onClick={() => {
                  setSelectedCourseId(course.id);
                  setUploadMaterialWeekId(null);
                }}
                className={`px-4 py-2.5 rounded-xl font-extrabold transition-all shrink-0 cursor-pointer flex items-center gap-2.5 ${
                  selectedCourseId === course.id
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                <span className="text-sm">{course.code}</span>
                <span className="text-xs font-normal opacity-80">({course.enrolledStudents.length} students)</span>
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Lecturer Workflows Horizontal Bar */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-extrabold text-slate-600 font-mono tracking-wider uppercase">
              Lecturer Workflows
            </span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 font-mono text-sm">
            {[
              { id: 'insights', label: 'Student Analytics', icon: BarChart2 },
              { id: 'enrollment', label: 'Edit Student Enrollment', icon: Users, badge: enrolledStudentsList.length > 0 ? enrolledStudentsList.length : null },
              { id: 'grading', label: 'Grade Homework', icon: GraduationCap, badge: pendingCount > 0 ? pendingCount : null },
              { id: 'materials', label: 'Syllabus & Uploads', icon: FileText },
              { id: 'assignments', label: 'Create Assignment', icon: Calendar },
              { id: 'announcements', label: 'Dispatch Alerts', icon: BellRing }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4.5 py-3 rounded-xl font-extrabold text-sm transition-all shrink-0 cursor-pointer ${
                  activeSubTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                <tab.icon className={`h-4.5 w-4.5 ${activeSubTab === tab.id ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full font-mono">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Main Full-Width Workspace Panel */}
      <div className="w-full space-y-6">
          
          {selectedCourse ? (
            <div>
              {/* SYLLABUS AND MATERIALS UPLOADS (UC-INS-02) */}
              {activeSubTab === 'materials' && (
                <div className="bg-white p-7 sm:p-8 rounded-[2rem] border border-slate-200/80 shadow-xs space-y-6">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg font-mono uppercase tracking-wider">Syllabus Materials Planner: {selectedCourse.code}</h3>
                    <p className="text-sm text-slate-700 leading-relaxed mt-1 font-medium">
                      Organize resources by week/topic and attach files for students to download.
                    </p>
                  </div>

                  {/* Materials upload form */}
                  {uploadMaterialWeekId && (
                    <form onSubmit={handleUploadMaterial} className="bg-slate-50 p-6 border border-slate-200 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                        <span className="text-xs font-bold text-slate-900 font-mono uppercase">UPLOAD SECTION: WEEK {selectedCourse.weeks.find(w => w.id === uploadMaterialWeekId)?.number}</span>
                        <button type="button" onClick={() => setUploadMaterialWeekId(null)} className="text-xs text-red-600 hover:text-red-800 font-bold font-mono uppercase tracking-wider cursor-pointer">
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="text-xs text-slate-700 font-mono font-extrabold uppercase block mb-1.5">Resource Title</label>
                          <input
                            type="text"
                            required
                            value={matTitle}
                            onChange={e => setMatTitle(e.target.value)}
                            placeholder="e.g. Lecture 6: UML Diagrams"
                            className="w-full text-sm px-4 py-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-700 font-mono font-extrabold uppercase block mb-1.5">Resource Type</label>
                          <select
                            value={matType}
                            onChange={e => setMatType(e.target.value as any)}
                            className="w-full text-sm px-4 py-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                          >
                            <option value="lecture">Lecture Slide</option>
                            <option value="reading">Required Reading</option>
                            <option value="tutorial">Tutorial Resource</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-slate-700 font-mono font-extrabold uppercase block mb-1.5">Simulated File Name</label>
                          <input
                            type="text"
                            required
                            value={matFileName}
                            onChange={e => setMatFileName(e.target.value)}
                            placeholder="e.g. Slide_UML.pdf"
                            className="w-full text-sm px-4 py-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-700 font-mono font-extrabold uppercase block mb-1.5">Simulated File Size</label>
                          <input
                            type="text"
                            value={matFileSize}
                            onChange={e => setMatFileSize(e.target.value)}
                            placeholder="e.g. 3.4 MB"
                            className="w-full text-sm px-4 py-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-slate-950 hover:bg-slate-850 text-white font-bold text-sm py-3.5 rounded-xl transition-all cursor-pointer"
                      >
                        Publish Material to Course Syllabus
                      </button>
                    </form>
                  )}

                  {/* Syllabus list */}
                  <div className="space-y-4">
                    {selectedCourse.weeks.map(week => (
                      <div key={week.id} className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <span className="text-xs font-bold text-slate-600 font-mono block uppercase tracking-wider">WEEK {week.number} SCHEDULE</span>
                            <h4 className="font-extrabold text-slate-900 text-base">{week.title}</h4>
                          </div>
                          {!uploadMaterialWeekId && (
                            <button
                              onClick={() => setUploadMaterialWeekId(week.id)}
                              className="flex items-center space-x-2 bg-white border border-slate-300 hover:border-slate-400 px-4 py-2 rounded-xl text-slate-800 text-sm font-bold font-mono transition-all cursor-pointer shadow-2xs"
                            >
                              <Plus className="h-4 w-4 text-slate-600" />
                              <span>Add File</span>
                            </button>
                          )}
                        </div>

                        {/* Files table */}
                        {week.materials.length === 0 ? (
                          <div className="text-center py-6 text-sm text-slate-500 border border-dashed border-slate-300 rounded-xl bg-white font-mono font-medium">
                            No materials uploaded. Click "Add File" to configure lecture notes.
                          </div>
                        ) : (
                          <div className="bg-white rounded-xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden">
                            {week.materials.map(m => (
                              <div key={m.id} className="p-4 flex justify-between items-center text-sm">
                                <div className="flex items-center space-x-3">
                                  <FileText className="h-5 w-5 text-indigo-600 shrink-0" />
                                  <div>
                                    <span className="font-extrabold text-slate-900">{m.title}</span>
                                    <p className="text-xs text-slate-600 font-mono mt-0.5">
                                      {m.fileName} • {m.fileSize}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 shrink-0">
                                  <span className="text-xs text-slate-700 font-mono font-bold">Downloads: {m.downloadCount}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* EDIT STUDENT ENROLLMENT (Roster Management) */}
              {activeSubTab === 'enrollment' && (
                <div className="bg-white p-7 sm:p-8 rounded-[2rem] border border-slate-200/80 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-indigo-600" />
                        <h3 className="font-extrabold text-slate-900 text-lg font-mono uppercase tracking-wider">
                          Student Enrollment & Roster Manager ({selectedCourse?.code})
                        </h3>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed mt-1 font-medium">
                        Add or remove students enrolled in this course space, search student profiles, and update class capacity.
                      </p>
                    </div>

                    <button
                      onClick={handleEnrollAllStudents}
                      className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs font-mono rounded-xl border border-indigo-200 transition-all cursor-pointer shrink-0"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Enroll All Platform Students</span>
                    </button>
                  </div>

                  {/* Enrollment Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                      <span className="text-xs text-slate-500 font-mono font-bold uppercase block">Currently Enrolled</span>
                      <span className="text-2xl font-black font-mono text-slate-900">{enrolledStudentsList.length} Students</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                      <span className="text-xs text-slate-500 font-mono font-bold uppercase block">Unenrolled Accounts</span>
                      <span className="text-2xl font-black font-mono text-slate-900">{nonEnrolledStudentsList.length} Unenrolled</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                      <span className="text-xs text-slate-500 font-mono font-bold uppercase block">Total Student Accounts</span>
                      <span className="text-2xl font-black font-mono text-indigo-600">{students.length} Total</span>
                    </div>
                  </div>

                  {/* Enroll New Student Box */}
                  <div className="bg-gradient-to-r from-indigo-50/60 via-slate-50/50 to-white p-5 rounded-2xl border border-indigo-150 space-y-3">
                    <h4 className="font-extrabold text-slate-900 text-sm font-mono uppercase tracking-wider flex items-center space-x-2">
                      <UserPlus className="h-4 w-4 text-indigo-600" />
                      <span>Enroll New Student</span>
                    </h4>

                    {nonEnrolledStudentsList.length === 0 ? (
                      <div className="p-3 bg-white rounded-xl border border-emerald-200 text-emerald-800 text-xs font-mono font-extrabold flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>All registered students in the platform are currently enrolled in this course!</span>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                          <select
                            value={selectedStudentToEnroll}
                            onChange={e => setSelectedStudentToEnroll(e.target.value)}
                            className="w-full text-sm px-4 py-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                          >
                            <option value="">-- Select student account to enroll --</option>
                            {nonEnrolledStudentsList.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.name} ({s.email}) • Preferred Mode: {s.preferredMode}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          disabled={!selectedStudentToEnroll}
                          onClick={() => {
                            if (selectedStudentToEnroll) {
                              handleEnrollStudent(selectedStudentToEnroll);
                              setSelectedStudentToEnroll('');
                            }
                          }}
                          className="px-6 py-3 bg-slate-950 hover:bg-slate-850 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-2 shrink-0"
                        >
                          <UserCheck className="h-4 w-4" />
                          <span>Confirm Enrollment</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Current Roster Table */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h4 className="font-extrabold text-slate-900 text-base font-mono uppercase tracking-wider">
                        Enrolled Roster ({enrolledStudentsList.length})
                      </h4>

                      {/* Search Filter */}
                      <div className="relative max-w-xs w-full">
                        <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search student name or email..."
                          value={enrollSearchQuery}
                          onChange={e => setEnrollSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {enrolledStudentsList.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-slate-300 rounded-2xl bg-slate-50/50">
                        <UserX className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-700 font-extrabold text-sm font-mono uppercase tracking-wider">No students enrolled yet.</p>
                        <p className="text-xs text-slate-500 mt-1">Use the dropdown above or click "Enroll All Platform Students" to populate the class roster.</p>
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-100">
                            <thead className="bg-slate-50/90 text-xs text-slate-700 font-mono font-extrabold uppercase tracking-wider">
                              <tr>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Email & Contact</th>
                                <th className="px-6 py-4">Learning Mode</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white font-medium">
                              {enrolledStudentsList
                                .filter(s => 
                                  s.name.toLowerCase().includes(enrollSearchQuery.toLowerCase()) || 
                                  s.email.toLowerCase().includes(enrollSearchQuery.toLowerCase())
                                )
                                .map(student => (
                                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="px-6 py-4">
                                      <div className="flex items-center space-x-3">
                                        <img
                                          src={student.avatar}
                                          alt={student.name}
                                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                                        />
                                        <div>
                                          <span className="font-black text-slate-900 text-sm block">{student.name}</span>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {student.skills.slice(0, 2).map((sk, i) => (
                                              <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
                                                {sk}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </td>

                                    <td className="px-6 py-4">
                                      <span className="font-mono text-xs text-slate-700 block">{student.email}</span>
                                      <span className="text-[11px] text-slate-500 font-medium">Availability: {student.availability || 'Flexible'}</span>
                                    </td>

                                    <td className="px-6 py-4">
                                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-150 rounded-lg text-xs font-mono font-extrabold">
                                        {student.preferredMode}
                                      </span>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                      <span className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-mono font-bold">
                                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                                        <span>Enrolled</span>
                                      </span>
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                      <button
                                        onClick={() => handleRemoveStudent(student.id)}
                                        className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer inline-flex items-center space-x-1.5"
                                        title="Unenroll student from this course"
                                      >
                                        <UserX className="h-3.5 w-3.5" />
                                        <span>Remove</span>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* GRADING WORKSPACE & STUDENT MARKS RECORDING (UC-INS-07 / UC-INS-08) */}
              {activeSubTab === 'grading' && (
                <div className="bg-white p-7 sm:p-8 rounded-[2rem] border border-slate-200/80 shadow-xs space-y-6">
                  
                  {/* Header & Direct Grade Trigger */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg font-mono uppercase tracking-wider">
                        Grading & Student Feedback Center
                      </h3>
                      <p className="text-sm text-slate-700 leading-relaxed mt-1 font-medium">
                        Review uploaded student homework documents, or directly record grades and constructive critique for enrolled students.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowDirectGradeModal(true);
                        if (enrolledStudentsList.length > 0) setDirectGradeStudentId(enrolledStudentsList[0].id);
                        if (courseAssignments.length > 0) setDirectGradeAssignmentId(courseAssignments[0].id);
                      }}
                      className="flex items-center space-x-2 px-5 py-3 bg-slate-950 hover:bg-slate-900 text-white font-bold text-sm rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
                    >
                      <Plus className="h-4 w-4 text-emerald-400" />
                      <span>Record Student Grade</span>
                    </button>
                  </div>

                  {/* Direct Grade Student Modal */}
                  {showDirectGradeModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                      <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200 shadow-2xl max-w-lg w-full space-y-5">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                          <h3 className="font-extrabold text-slate-900 text-base font-mono uppercase tracking-wider flex items-center space-x-2">
                            <GraduationCap className="h-5 w-5 text-indigo-600" />
                            <span>Record Student Grade</span>
                          </h3>
                          <button onClick={() => setShowDirectGradeModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <form onSubmit={handleDirectGradeSubmit} className="space-y-4 text-sm">
                          <div>
                            <label className="text-xs text-slate-700 font-mono font-extrabold uppercase block mb-1.5">Select Enrolled Student</label>
                            <select
                              required
                              value={directGradeStudentId}
                              onChange={e => setDirectGradeStudentId(e.target.value)}
                              className="w-full text-sm px-4 py-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                            >
                              <option value="">-- Select Student --</option>
                              {enrolledStudentsList.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-xs text-slate-700 font-mono font-extrabold uppercase block mb-1.5">Select Assignment</label>
                            <select
                              required
                              value={directGradeAssignmentId}
                              onChange={e => setDirectGradeAssignmentId(e.target.value)}
                              className="w-full text-sm px-4 py-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                            >
                              <option value="">-- Select Assignment --</option>
                              {courseAssignments.map(a => (
                                <option key={a.id} value={a.id}>{a.title} (Max {a.marks} pts)</option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs text-slate-700 font-mono font-extrabold uppercase block mb-1.5">Score / Marks (0-100)</label>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                required
                                value={directGradeScore}
                                onChange={e => setDirectGradeScore(parseInt(e.target.value) || 0)}
                                className="w-full text-sm px-4 py-3 border border-slate-200 bg-white rounded-xl font-mono font-black text-slate-900 focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-slate-700 font-mono font-extrabold uppercase block mb-1.5">Grade Level</label>
                              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800">
                                {directGradeScore >= 85 ? 'Grade A (Excellent)' : directGradeScore >= 70 ? 'Grade B (Good)' : directGradeScore >= 50 ? 'Grade C (Pass)' : 'Needs Revision'}
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs text-slate-700 font-mono font-extrabold uppercase block mb-1.5">Lecturer Feedback & Critique</label>
                            <textarea
                              required
                              value={directGradeFeedback}
                              onChange={e => setDirectGradeFeedback(e.target.value)}
                              placeholder="e.g. Excellent solution structure and clear documentation!"
                              rows={3}
                              className="w-full text-sm px-4 py-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 font-medium resize-none"
                            />
                          </div>

                          <div className="pt-2 flex gap-3">
                            <button
                              type="button"
                              onClick={() => setShowDirectGradeModal(false)}
                              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer text-sm"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="flex-1 bg-slate-950 hover:bg-slate-850 text-white font-bold text-sm py-3 rounded-xl transition-all cursor-pointer"
                            >
                              Save & Publish Grade
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Filter Toolbar for Submissions & Gradebook Grid */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 font-mono text-xs font-bold">
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      {[
                        { id: 'all', label: `All Submissions (${courseSubmissions.length})` },
                        { id: 'pending', label: `Pending Review (${pendingCount})` },
                        { id: 'graded', label: `Graded (${gradedCount})` },
                        { id: 'gradebook', label: `Class Gradebook Grid` }
                      ].map(f => (
                        <button
                          key={f.id}
                          onClick={() => setGradingFilter(f.id as any)}
                          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                            gradingFilter === f.id
                              ? 'bg-slate-950 text-white shadow-2xs'
                              : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grading detail inline editor */}
                  {gradingSubmissionId && (
                    <form onSubmit={handleGradeSubmit} className="bg-slate-50 border border-slate-200 p-6 sm:p-7 rounded-2xl space-y-5">
                      {(() => {
                        const sub = submissions.find(s => s.id === gradingSubmissionId);
                        const asg = assignments.find(a => a.id === sub?.assignmentId);
                        if (!sub) return null;
                        return (
                          <>
                            <div className="flex justify-between items-start pb-3 border-b border-slate-200">
                              <div>
                                <span className="text-xs text-slate-600 font-extrabold uppercase tracking-wider block font-mono">GRADING ASSESSMENT</span>
                                <h4 className="font-extrabold text-slate-900 text-base sm:text-lg mt-1">{sub.studentName}</h4>
                                <p className="text-xs text-slate-700 font-mono mt-1 font-bold">{asg?.title}</p>
                              </div>
                              <button 
                                type="button" 
                                onClick={() => setGradingSubmissionId(null)} 
                                className="text-xs text-red-600 hover:text-red-800 font-bold font-mono uppercase tracking-wider cursor-pointer"
                              >
                                Close
                              </button>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-slate-600 block text-xs uppercase font-mono tracking-wider font-extrabold mb-1">Simulated Submission File</span>
                                <span className="font-extrabold text-slate-900 text-base block">{sub.fileName}</span>
                                <span className="text-xs text-slate-600 font-mono block mt-1 font-medium">{sub.fileSize} • {new Date(sub.submittedAt).toLocaleTimeString()}</span>
                              </div>
                              <div>
                                <span className="text-slate-600 block text-xs uppercase font-mono tracking-wider font-extrabold mb-1">Submission Versions History</span>
                                <div className="space-y-1.5 mt-1 max-h-28 overflow-y-auto pr-1">
                                  {sub.submissionHistory.map(hist => (
                                    <div key={hist.version} className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200 font-mono font-medium">
                                      v{hist.version}: {hist.fileName} ({new Date(hist.submittedAt).toLocaleDateString()})
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="md:col-span-1">
                                <label className="text-xs text-slate-700 font-mono font-extrabold uppercase block mb-1.5">Score / Marks (Max 100)</label>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  required
                                  value={gradeInput}
                                  onChange={e => setGradeInput(parseInt(e.target.value) || 0)}
                                  className="w-full text-sm px-4 py-3 border border-slate-200 bg-white rounded-xl font-mono font-black text-slate-900 focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="text-xs text-slate-700 font-mono font-extrabold uppercase block mb-1.5">Feedback / Critique</label>
                                <input
                                  type="text"
                                  required
                                  value={feedbackInput}
                                  onChange={e => setFeedbackInput(e.target.value)}
                                  placeholder="e.g. Well formulated use cases. Clear database schema!"
                                  className="w-full text-sm px-4 py-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full bg-slate-950 hover:bg-slate-850 text-white font-bold text-sm py-3.5 rounded-xl transition-all cursor-pointer"
                            >
                              Publish Score & Send Instant Notification
                            </button>
                          </>
                        );
                      })()}
                    </form>
                  )}

                  {/* VIEW 1: CLASS GRADEBOOK MATRIX GRID */}
                  {gradingFilter === 'gradebook' && (
                    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
                      <div className="p-4 bg-slate-50 border-b border-slate-200 font-mono text-xs font-extrabold uppercase tracking-wider text-slate-800">
                        Course Gradebook Grid ({selectedCourse?.code})
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-100">
                          <thead className="bg-slate-50/90 text-xs text-slate-700 font-mono font-extrabold uppercase tracking-wider">
                            <tr>
                              <th className="px-6 py-4">Enrolled Student</th>
                              {courseAssignments.map(asg => (
                                <th key={asg.id} className="px-6 py-4 text-center">{asg.title}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white font-medium">
                            {enrolledStudentsList.map(student => (
                              <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="px-6 py-4 font-black text-slate-900">
                                  {student.name}
                                  <span className="block text-xs font-normal text-slate-500 font-mono">{student.email}</span>
                                </td>

                                {courseAssignments.map(asg => {
                                  const sub = submissions.find(s => s.assignmentId === asg.id && s.studentId === student.id);
                                  return (
                                    <td key={asg.id} className="px-6 py-4 text-center font-mono">
                                      {sub && sub.status === 'Graded' ? (
                                        <div className="inline-flex flex-col items-center">
                                          <span className="text-sm font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                                            {sub.grade} / 100
                                          </span>
                                          <button
                                            onClick={() => {
                                              setGradingSubmissionId(sub.id);
                                              setGradeInput(sub.grade || 100);
                                              setFeedbackInput(sub.feedback || '');
                                              setGradingFilter('all');
                                            }}
                                            className="text-[10px] text-indigo-600 font-bold hover:underline mt-1 cursor-pointer"
                                          >
                                            Edit Grade
                                          </button>
                                        </div>
                                      ) : sub ? (
                                        <div className="inline-flex flex-col items-center">
                                          <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                                            Pending Review
                                          </span>
                                          <button
                                            onClick={() => {
                                              setGradingSubmissionId(sub.id);
                                              setGradeInput(100);
                                              setFeedbackInput('');
                                              setGradingFilter('all');
                                            }}
                                            className="text-[10px] text-indigo-600 font-bold hover:underline mt-1 cursor-pointer"
                                          >
                                            Grade Now
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setShowDirectGradeModal(true);
                                            setDirectGradeStudentId(student.id);
                                            setDirectGradeAssignmentId(asg.id);
                                          }}
                                          className="text-xs text-slate-400 hover:text-indigo-600 font-bold font-mono border border-dashed border-slate-300 hover:border-indigo-400 px-2.5 py-1 rounded-lg cursor-pointer"
                                        >
                                          + Enter Grade
                                        </button>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* VIEW 2: SUBMISSIONS LIST */}
                  {gradingFilter !== 'gradebook' && (
                    <div className="space-y-4">
                      {(() => {
                        const filteredSubs = courseSubmissions.filter(sub => {
                          if (gradingFilter === 'pending') return sub.status === 'Submitted';
                          if (gradingFilter === 'graded') return sub.status === 'Graded';
                          return true;
                        });

                        if (filteredSubs.length === 0) {
                          return (
                            <div className="text-center py-12 border border-dashed border-slate-300 rounded-2xl bg-slate-50/50">
                              <Users className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                              <p className="text-slate-700 font-bold text-sm font-mono uppercase tracking-wider">No submissions match selected filter.</p>
                              <p className="text-xs text-slate-500 mt-1">Click "+ Record Student Grade" to manually enter marks for any student.</p>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-4">
                            {filteredSubs.map(sub => {
                              const asg = assignments.find(a => a.id === sub.assignmentId);
                              return (
                                <div key={sub.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl hover:border-slate-400 transition-all shadow-2xs">
                                  <div className="min-w-0">
                                    <div className="flex items-center space-x-2.5">
                                      <span className="font-black text-slate-900 text-sm sm:text-base">{sub.studentName}</span>
                                      <span className="text-xs text-slate-600 font-mono font-bold uppercase tracking-wider">• {asg?.title}</span>
                                    </div>
                                    <p className="text-sm text-slate-700 font-bold truncate mt-1.5">{sub.fileName}</p>
                                    <p className="text-xs text-slate-500 font-mono mt-1 font-medium">
                                      Attempts: {sub.submissionHistory.length} • Submitted {new Date(sub.submittedAt).toLocaleString()}
                                    </p>
                                    {sub.feedback && (
                                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 mt-2 font-medium italic">
                                        "Feedback: {sub.feedback}"
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex items-center space-x-4 self-end sm:self-center shrink-0">
                                    {sub.status === 'Graded' ? (
                                      <div className="text-right">
                                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono px-3 py-1 rounded-full uppercase tracking-wider">
                                          Graded
                                        </span>
                                        <p className="font-extrabold font-mono text-sm text-slate-900 mt-1">{sub.grade} / 100</p>
                                      </div>
                                    ) : (
                                      <span className="bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold font-mono px-3 py-1 rounded-full uppercase tracking-wider">
                                        Pending Review
                                      </span>
                                    )}

                                    <button
                                      onClick={() => {
                                        setGradingSubmissionId(sub.id);
                                        setGradeInput(sub.grade || 100);
                                        setFeedbackInput(sub.feedback || '');
                                      }}
                                      className="px-4.5 py-2.5 bg-slate-950 hover:bg-slate-850 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                                    >
                                      {sub.status === 'Graded' ? 'Edit Grade' : 'Record Grade'}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                </div>
              )}

              {/* CREATE ASSIGNMENT (UC-INS-04) */}
              {activeSubTab === 'assignments' && (
                <div className="bg-white p-7 sm:p-8 rounded-[2rem] border border-slate-200/80 shadow-xs space-y-6">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg font-mono uppercase tracking-wider">Create Assignment Details: {selectedCourse.code}</h3>
                    <p className="text-sm text-slate-700 leading-relaxed mt-1 font-medium">
                      Configure homework requirements, deadline timers, marks weight, and validate allowed file attachments.
                    </p>
                  </div>

                  <form onSubmit={handleCreateAssignmentSubmit} className="space-y-4 text-sm">
                    <div>
                      <label className="text-xs text-slate-700 font-mono font-extrabold uppercase block mb-1.5">Assignment Title</label>
                      <input
                        type="text"
                        required
                        value={asgTitle}
                        onChange={e => setAsgTitle(e.target.value)}
                        placeholder="e.g. 2nd Submission: Final Project Report"
                        className="w-full text-sm px-4 py-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-700 font-mono font-extrabold uppercase block mb-1.5">Assignment Instructions</label>
                      <textarea
                        value={asgDesc}
                        onChange={e => setAsgDesc(e.target.value)}
                        placeholder="Detail the submission components, references guidelines, and criteria..."
                        rows={3}
                        className="w-full text-sm px-4 py-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 resize-none font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-slate-700 font-mono font-extrabold uppercase block mb-1.5">Total Points / Marks</label>
                        <input
                          type="number"
                          required
                          value={asgMarks}
                          onChange={e => setAsgMarks(parseInt(e.target.value) || 100)}
                          className="w-full text-sm px-4 py-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-700 font-mono font-extrabold uppercase block mb-1.5">Deadline Date & Time</label>
                        <input
                          type="datetime-local"
                          required
                          value={asgDeadline}
                          onChange={e => setAsgDeadline(e.target.value)}
                          className="w-full text-sm px-4 py-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-700 font-mono font-extrabold uppercase block mb-1.5">Max File Size (MB)</label>
                        <input
                          type="number"
                          required
                          value={asgMaxSize}
                          onChange={e => setAsgMaxSize(parseInt(e.target.value) || 15)}
                          className="w-full text-sm px-4 py-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-slate-950 hover:bg-slate-850 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      Publish Assignment & Notify Enrolled Students
                    </button>
                  </form>
                </div>
              )}

              {/* POST ANNOUNCEMENT (UC-INS-03) */}
              {activeSubTab === 'announcements' && (
                <div className="bg-white p-7 sm:p-8 rounded-[2rem] border border-slate-200/80 shadow-xs space-y-6">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg font-mono uppercase tracking-wider">Dispatch Class Announcement Alert</h3>
                    <p className="text-sm text-slate-700 leading-relaxed mt-1 font-medium">
                      Send push notifications for schedule changes, task reminders, or updates to the requirement brief.
                    </p>
                  </div>

                  <form onSubmit={handleAddAnnouncementSubmit} className="space-y-4 text-sm">
                    <div>
                      <label className="text-xs text-slate-700 font-mono font-extrabold uppercase block mb-1.5">Subject Header</label>
                      <input
                        type="text"
                        required
                        value={annTitle}
                        onChange={e => setAnnTitle(e.target.value)}
                        placeholder="e.g. Requirement change update details"
                        className="w-full text-sm px-4 py-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-mono font-extrabold uppercase block mb-1.5">Content Body</label>
                      <textarea
                        required
                        value={annContent}
                        onChange={e => setAnnContent(e.target.value)}
                        placeholder="Write class notification content here..."
                        rows={4}
                        className="w-full text-sm px-4 py-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 resize-none font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-slate-950 hover:bg-slate-850 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      Publish and Dispatch Notification
                    </button>
                  </form>
                </div>
              )}

              {/* MONITOR STUDENT PERFORMANCE & INSIGHTS (UC-INS-06) */}
              {activeSubTab === 'insights' && (
                <div className="space-y-6">
                  
                  {/* Overview Metrics Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-slate-50/90 via-white to-slate-100/50 p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                      <div className="flex items-center space-x-3.5">
                        <div className="bg-slate-950 p-3 rounded-xl text-white shadow-2xs">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-xs text-slate-600 font-mono uppercase block font-extrabold tracking-wider">Enrolled Students</span>
                          <span className="font-black text-slate-900 text-xl font-mono">{students.length} Registered</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/30 p-5 rounded-2xl border border-indigo-150/90 shadow-2xs">
                      <div className="flex items-center space-x-3.5">
                        <div className="bg-indigo-600 p-3 rounded-xl text-white shadow-2xs">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-xs text-indigo-950 font-mono uppercase block font-extrabold tracking-wider">Submission Rate</span>
                          <span className="font-black text-slate-900 text-xl font-mono">{overallSubmissionRate}% Completed</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/30 p-5 rounded-2xl border border-emerald-200/90 shadow-2xs">
                      <div className="flex items-center space-x-3.5">
                        <div className="bg-emerald-600 p-3 rounded-xl text-white shadow-2xs">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-xs text-emerald-950 font-mono uppercase block font-extrabold tracking-wider">Class Avg Score</span>
                          <span className="font-black text-slate-900 text-xl font-mono">
                            {classAvgGrade !== null ? `${classAvgGrade} / 100` : 'No Grades'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50/60 via-white to-orange-50/30 p-5 rounded-2xl border border-amber-200/90 shadow-2xs">
                      <div className="flex items-center space-x-3.5">
                        <div className="bg-amber-600 p-3 rounded-xl text-white shadow-2xs">
                          <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-xs text-amber-950 font-mono uppercase block font-extrabold tracking-wider">Needs Follow-Up</span>
                          <span className="font-black text-slate-900 text-xl font-mono">{atRiskStudentsCount} Students</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Academic Performance Visual Chart */}
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200/90 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base font-mono uppercase tracking-wider">Student Academic Performance & Progress</h4>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">Calculated from assignment submission completion rates and graded scores.</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 uppercase">
                        Course: {selectedCourse.code}
                      </span>
                    </div>

                    <div className="h-64 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={academicChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={12} tickLine={false} domain={[0, 100]} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '1rem', color: '#fff', fontSize: '12px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                          <Bar dataKey="Average Grade" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={40} />
                          <Bar dataKey="Submissions Rate (%)" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Student Academic Performance & Collaboration Matrix Table */}
                  <div className="bg-white rounded-[2rem] border border-slate-200/90 overflow-hidden shadow-xs">
                    <div className="px-6 py-5 border-b border-slate-200/70 bg-gradient-to-r from-slate-100/90 via-indigo-50/40 to-slate-50/80 flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base font-mono uppercase tracking-wider">Student Performance & Progress Analytics</h4>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">Real-time academic evaluation and assignment progress metrics.</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-100">
                        <thead className="bg-slate-50/90 text-xs text-slate-700 font-mono font-extrabold uppercase tracking-wider">
                          <tr>
                            <th className="px-6 py-4">Student & Skills</th>
                            <th className="px-6 py-4 text-center">Assignments Progress</th>
                            <th className="px-6 py-4 text-center">Average Score</th>
                            <th className="px-6 py-4 text-center">Academic Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white font-medium">
                          {studentPerformanceData.map(({ student, submittedCount, totalAsgs, submissionRatePct, avgGrade, academicStatus }) => (
                            <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                              {/* Student & Skills */}
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
                                    <UserIcon className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <span className="font-black text-slate-900 text-sm sm:text-base block">{student.name}</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {student.skills.slice(0, 2).map((skill, idx) => (
                                        <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-slate-200">
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Assignment Progress */}
                              <td className="px-6 py-4 text-center">
                                <div className="inline-flex flex-col items-center">
                                  <span className="font-mono font-black text-slate-900 text-sm">
                                    {submittedCount} / {totalAsgs} Submitted
                                  </span>
                                  <div className="w-28 bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5 border border-slate-200">
                                    <div 
                                      className={`h-full transition-all rounded-full ${
                                        submissionRatePct === 100 ? 'bg-emerald-500' : submissionRatePct >= 50 ? 'bg-indigo-500' : 'bg-amber-500'
                                      }`}
                                      style={{ width: `${submissionRatePct}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-mono font-bold mt-1">
                                    {submissionRatePct}% Completion
                                  </span>
                                </div>
                              </td>

                              {/* Average Score */}
                              <td className="px-6 py-4 text-center font-mono font-black text-slate-900 text-sm">
                                {avgGrade !== null ? (
                                  <div className="inline-flex items-center space-x-1.5">
                                    <span className="text-base text-slate-900">{avgGrade}</span>
                                    <span className="text-xs text-slate-500 font-bold">/ 100</span>
                                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded font-mono ${
                                      avgGrade >= 85 ? 'bg-emerald-100 text-emerald-800' : avgGrade >= 70 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {avgGrade >= 85 ? 'Grade A' : avgGrade >= 70 ? 'Grade B' : 'Grade C'}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400 font-normal font-mono uppercase">Not Graded</span>
                                )}
                              </td>

                              {/* Academic Status */}
                              <td className="px-6 py-4 text-center">
                                <span className={`text-xs font-bold uppercase px-3.5 py-1 rounded-full font-mono border inline-block ${
                                  academicStatus === 'High Performer'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : academicStatus === 'On Track'
                                    ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                    : 'bg-amber-50 text-amber-900 border-amber-200'
                                }`}>
                                  {academicStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-200/80 shadow-xs">
              <BookOpen className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-700 font-extrabold text-base font-mono uppercase tracking-wider">No courses configured.</p>
              <p className="text-sm text-slate-500 mt-1">Please click "New Course Space" to define the syllabus.</p>
            </div>
          )}

        </div>
    </div>
  );
}
