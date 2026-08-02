/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Course, Assignment, Submission, Announcement, DiscussionPost, AppNotification } from '../types';

export const mockUsers: User[] = [
  {
    id: 'instructor_demo_1',
    name: 'Dr. Sarah Lee',
    email: 'instructor@university.edu.my',
    role: 'instructor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DrSarah',
    skills: ['Software Engineering', 'Database Systems', 'AI & Machine Learning'],
    preferredMode: 'Hybrid',
    availability: 'Mon-Fri 9AM-5PM',
    loginCount: 5,
    materialViewsCount: 42,
    discussionCount: 18,
  },
  {
    id: 'student_demo_1',
    name: 'Alex Tan',
    email: 'student@university.edu.my',
    role: 'student',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexTan',
    skills: ['Information Technology', 'React & Web Dev'],
    preferredMode: 'Online',
    availability: 'Mon-Fri Flexible',
    loginCount: 3,
    materialViewsCount: 12,
    discussionCount: 5,
  },
];

export const mockCourses: Course[] = [];

export const mockAssignments: Assignment[] = [];

export const mockSubmissions: Submission[] = [];

export const mockAnnouncements: Announcement[] = [];

export const mockDiscussionPosts: DiscussionPost[] = [];

export const mockNotifications: AppNotification[] = [];

// Initialize localStorage with clean database and session persistence
export const initializeDatabase = () => {
  if (typeof window === 'undefined') return {
    users: mockUsers,
    courses: mockCourses,
    assignments: mockAssignments,
    submissions: mockSubmissions,
    announcements: mockAnnouncements,
    discussions: mockDiscussionPosts,
    notifications: mockNotifications,
    savedUserId: mockUsers[0]?.id || '',
  };

  // Clear previous version storage keys if present
  if (typeof localStorage !== 'undefined') {
    ['v1', 'v2', 'v3', 'v4', 'v5'].forEach(v => {
      ['users', 'courses', 'assignments', 'submissions', 'announcements', 'discussions', 'notifications', 'current_user_id'].forEach(k => {
        localStorage.removeItem(`ccp_${k}_${v}`);
      });
    });
  }

  const getOrSet = (key: string, defaultData: any) => {
    const val = localStorage.getItem(key);
    if (!val) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    try {
      return JSON.parse(val);
    } catch {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
  };

  const rawUsers: User[] = getOrSet('ccp_users_v6', mockUsers);
  const courses = getOrSet('ccp_courses_v6', mockCourses);
  const assignments = getOrSet('ccp_assignments_v6', mockAssignments);
  const submissions = getOrSet('ccp_submissions_v6', mockSubmissions);
  const announcements = getOrSet('ccp_announcements_v6', mockAnnouncements);
  const discussions = getOrSet('ccp_discussions_v6', mockDiscussionPosts);
  const notifications = getOrSet('ccp_notifications_v6', mockNotifications);

  // Deduplicate users by email, preserving instructor role if conflict exists
  const userMap = new Map<string, User>();
  rawUsers.forEach(u => {
    const cleanEmail = u.email.trim().toLowerCase();
    const existing = userMap.get(cleanEmail);
    if (!existing) {
      userMap.set(cleanEmail, u);
    } else {
      // If one of them is an instructor, keep the instructor user
      if (u.role === 'instructor' && existing.role !== 'instructor') {
        userMap.set(cleanEmail, u);
      }
    }
  });

  const users = Array.from(userMap.values());
  localStorage.setItem('ccp_users_v6', JSON.stringify(users));

  const savedUserId = localStorage.getItem('ccp_current_user_id_v6') || '';

  return { users, courses, assignments, submissions, announcements, discussions, notifications, savedUserId };
};

export const saveDatabase = (data: {
  users?: User[];
  courses?: Course[];
  assignments?: Assignment[];
  submissions?: Submission[];
  announcements?: Announcement[];
  discussions?: DiscussionPost[];
  notifications?: AppNotification[];
  currentUserId?: string;
}) => {
  if (typeof window === 'undefined') return;
  Object.entries(data).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      if (key === 'currentUserId') {
        localStorage.setItem('ccp_current_user_id_v6', val as string);
      } else {
        localStorage.setItem(`ccp_${key}_v6`, JSON.stringify(val));
      }
    }
  });
};
