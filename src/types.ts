/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'student' | 'instructor';
export type PreferredMode = 'Online' | 'Offline' | 'Hybrid';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  // Enhanced Profile fields for Student Collaboration
  skills: string[];
  preferredMode: PreferredMode;
  availability: string; // text or simple slots
  // Tracking fields for Instructor Insights
  loginCount: number;
  materialViewsCount: number;
  discussionCount: number;
}

export interface Material {
  id: string;
  title: string;
  type: 'lecture' | 'reading' | 'tutorial';
  fileName: string;
  fileSize: string;
  downloadCount: number;
}

export interface CourseWeek {
  id: string;
  number: number;
  title: string;
  materials: Material[];
}

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  instructorName: string;
  enrolledStudents: string[]; // User IDs
  weeks: CourseWeek[];
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  marks: number;
  deadline: string; // ISO date string or simple formatted date
  allowedFileTypes: string[]; // e.g. ["pdf", "zip", "doc"]
  maxFileSize: number; // in MB
  isResubmissionAllowed: boolean;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  fileName: string;
  fileSize: string;
  submittedAt: string;
  status: 'Submitted' | 'Graded';
  grade: number | null;
  feedback: string | null;
  submissionHistory: {
    fileName: string;
    submittedAt: string;
    version: number;
  }[];
}

export interface Announcement {
  id: string;
  courseId: string;
  title: string;
  content: string;
  publishedAt: string;
  authorName: string;
}

export interface DiscussionPost {
  id: string;
  courseId: string;
  userName: string;
  userRole: UserRole;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: {
    id: string;
    userName: string;
    userRole: UserRole;
    avatar: string;
    content: string;
    timestamp: string;
  }[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'announcement' | 'assignment' | 'grade' | 'collaboration';
  courseCode: string;
  createdAt: string;
  read: boolean;
}
