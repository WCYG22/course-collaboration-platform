/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Course, Assignment, Submission, Announcement, DiscussionPost, AppNotification } from '../types';

// EMPTY MOCK DATA - Ready for fresh demo
export const mockUsers: User[] = [];

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
    savedUserId: '',
  };

  // Clear ALL previous version storage keys
  if (typeof localStorage !== 'undefined') {
    // Clear all versions (v1-v6)
    ['v1', 'v2', 'v3', 'v4', 'v5', 'v6'].forEach(v => {
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

  const rawUsers: User[] = getOrSet('ccp_users_v7', mockUsers);
  const courses = getOrSet('ccp_courses_v7', mockCourses);
  const assignments = getOrSet('ccp_assignments_v7', mockAssignments);
  const submissions = getOrSet('ccp_submissions_v7', mockSubmissions);
  const announcements = getOrSet('ccp_announcements_v7', mockAnnouncements);
  const discussions = getOrSet('ccp_discussions_v7', mockDiscussionPosts);
  const notifications = getOrSet('ccp_notifications_v7', mockNotifications);

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
  localStorage.setItem('ccp_users_v7', JSON.stringify(users));

  const savedUserId = localStorage.getItem('ccp_current_user_id_v7') || '';

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
        localStorage.setItem('ccp_current_user_id_v7', val as string);
      } else {
        localStorage.setItem(`ccp_${key}_v7`, JSON.stringify(val));
      }
    }
  });
};
