/**
 * API Service Layer
 * Central place for all API calls to backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Store token in memory and localStorage
let authToken: string | null = null;

// Initialize token from localStorage
if (typeof window !== 'undefined') {
  authToken = localStorage.getItem('auth_token');
}

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

// Generic fetch wrapper
async function fetchAPI(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Authentication API
export const authAPI = {
  register: async (data: {
    email: string;
    password: string;
    name: string;
    role: 'student' | 'instructor';
  }) => {
    const result = await fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAuthToken(result.token);
    return result;
  },

  login: async (email: string, password: string) => {
    const result = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(result.token);
    return result;
  },

  logout: async () => {
    try {
      await fetchAPI('/auth/logout', { method: 'POST' });
    } finally {
      setAuthToken(null);
    }
  },

  getCurrentUser: async () => {
    return fetchAPI('/auth/me');
  },

  updateProfile: async (data: Partial<{
    name: string;
    skills: string[];
    preferred_mode: string;
    availability: string;
    avatar: string;
  }>) => {
    return fetchAPI('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return fetchAPI('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// Courses API
export const coursesAPI = {
  getAll: async () => {
    return fetchAPI('/courses');
  },

  getById: async (id: string) => {
    return fetchAPI(`/courses/${id}`);
  },

  create: async (data: {
    code: string;
    name: string;
    description?: string;
  }) => {
    return fetchAPI('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: {
    name?: string;
    description?: string;
  }) => {
    return fetchAPI(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchAPI(`/courses/${id}`, { method: 'DELETE' });
  },

  enroll: async (id: string) => {
    return fetchAPI(`/courses/${id}/enroll`, { method: 'POST' });
  },

  unenroll: async (id: string) => {
    return fetchAPI(`/courses/${id}/enroll`, { method: 'DELETE' });
  },

  addWeek: async (id: string, data: { week_number: number; title: string }) => {
    return fetchAPI(`/courses/${id}/weeks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Materials API (to be implemented on backend)
export const materialsAPI = {
  upload: async (weekId: string, formData: FormData) => {
    const headers: HeadersInit = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/materials/${weekId}`, {
      method: 'POST',
      headers,
      body: formData, // Don't set Content-Type, browser will set it with boundary
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  },

  download: async (materialId: string) => {
    return `${API_BASE_URL}/materials/${materialId}/download`;
  },

  delete: async (materialId: string) => {
    return fetchAPI(`/materials/${materialId}`, { method: 'DELETE' });
  },
};

// Assignments API (to be implemented on backend)
export const assignmentsAPI = {
  create: async (data: {
    course_id: string;
    title: string;
    description: string;
    marks: number;
    deadline: string;
    allowed_file_types: string[];
    max_file_size: number;
    is_resubmission_allowed: boolean;
  }) => {
    return fetchAPI('/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getByCourse: async (courseId: string) => {
    return fetchAPI(`/assignments?course_id=${courseId}`);
  },

  getById: async (id: string) => {
    return fetchAPI(`/assignments/${id}`);
  },

  update: async (id: string, data: Partial<{
    title: string;
    description: string;
    deadline: string;
  }>) => {
    return fetchAPI(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchAPI(`/assignments/${id}`, { method: 'DELETE' });
  },
};

// Submissions API (to be implemented on backend)
export const submissionsAPI = {
  submit: async (assignmentId: string, formData: FormData) => {
    const headers: HeadersInit = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/submissions/${assignmentId}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Submission failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  },

  getByAssignment: async (assignmentId: string) => {
    return fetchAPI(`/submissions?assignment_id=${assignmentId}`);
  },

  getByStudent: async (studentId: string) => {
    return fetchAPI(`/submissions?student_id=${studentId}`);
  },

  grade: async (submissionId: string, grade: number, feedback: string) => {
    return fetchAPI(`/submissions/${submissionId}/grade`, {
      method: 'POST',
      body: JSON.stringify({ grade, feedback }),
    });
  },
};

// Announcements API (to be implemented on backend)
export const announcementsAPI = {
  create: async (data: {
    course_id: string;
    title: string;
    content: string;
  }) => {
    return fetchAPI('/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getByCourse: async (courseId: string) => {
    return fetchAPI(`/announcements?course_id=${courseId}`);
  },

  delete: async (id: string) => {
    return fetchAPI(`/announcements/${id}`, { method: 'DELETE' });
  },
};

// Discussions API (to be implemented on backend)
export const discussionsAPI = {
  createPost: async (data: {
    course_id: string;
    content: string;
  }) => {
    return fetchAPI('/discussions/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getPosts: async (courseId: string) => {
    return fetchAPI(`/discussions/posts?course_id=${courseId}`);
  },

  createReply: async (postId: string, content: string) => {
    return fetchAPI(`/discussions/posts/${postId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  likePost: async (postId: string) => {
    return fetchAPI(`/discussions/posts/${postId}/like`, { method: 'POST' });
  },

  deletePost: async (postId: string) => {
    return fetchAPI(`/discussions/posts/${postId}`, { method: 'DELETE' });
  },
};

// Notifications API (to be implemented on backend)
export const notificationsAPI = {
  getAll: async () => {
    return fetchAPI('/notifications');
  },

  markAsRead: async (id: string) => {
    return fetchAPI(`/notifications/${id}/read`, { method: 'PUT' });
  },

  markAllAsRead: async () => {
    return fetchAPI('/notifications/read-all', { method: 'PUT' });
  },

  delete: async (id: string) => {
    return fetchAPI(`/notifications/${id}`, { method: 'DELETE' });
  },
};

// Search API (to be implemented on backend)
export const searchAPI = {
  materials: async (query: string) => {
    return fetchAPI(`/search/materials?q=${encodeURIComponent(query)}`);
  },

  discussions: async (query: string) => {
    return fetchAPI(`/search/discussions?q=${encodeURIComponent(query)}`);
  },

  users: async (query: string) => {
    return fetchAPI(`/search/users?q=${encodeURIComponent(query)}`);
  },
};

// WebSocket connection (to be implemented)
export const createSocketConnection = () => {
  // This will be implemented when integrating Socket.IO client
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
  
  // Return socket instance
  // import { io } from 'socket.io-client';
  // return io(SOCKET_URL, { auth: { token: authToken } });
  
  console.warn('Socket.IO client not yet implemented');
  return null;
};

export default {
  auth: authAPI,
  courses: coursesAPI,
  materials: materialsAPI,
  assignments: assignmentsAPI,
  submissions: submissionsAPI,
  announcements: announcementsAPI,
  discussions: discussionsAPI,
  notifications: notificationsAPI,
  search: searchAPI,
  createSocketConnection,
};
