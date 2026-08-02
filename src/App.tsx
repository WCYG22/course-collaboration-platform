/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Course, Assignment, Submission, Announcement, DiscussionPost, AppNotification } from './types';
import { initializeDatabase, saveDatabase } from './data/mockData';
import Navbar from './components/Navbar';
import StudentDashboard from './components/StudentDashboard';
import InstructorDashboard from './components/InstructorDashboard';
import AuthModal from './components/AuthModal';
import { Sparkles, Check, HelpCircle, Award, Github, BookOpen, X, GraduationCap, ShieldCheck, ArrowRight, UserPlus, LogIn } from 'lucide-react';

export default function App() {
  // Database States
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionPost[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Current session states
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  // Load database once on mount and simulate smooth 2 second progress animation
  useEffect(() => {
    const db = initializeDatabase();
    setUsers(db.users);
    setCourses(db.courses);
    setAssignments(db.assignments);
    setSubmissions(db.submissions);
    setAnnouncements(db.announcements);
    setDiscussions(db.discussions);
    setNotifications(db.notifications);

    if (db.savedUserId && db.users.some(u => u.id === db.savedUserId)) {
      setCurrentUserId(db.savedUserId);
    } else if (db.users.length > 0) {
      setCurrentUserId(db.users[0].id);
    } else {
      setCurrentUserId('');
    }

    const startTime = Date.now();
    const duration = 2000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentPct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setLoadingProgress(currentPct);

      if (elapsed >= duration) {
        clearInterval(interval);
        setTimeout(() => {
          setIsLoading(false);
        }, 150);
      }
    }, 25);

    return () => clearInterval(interval);
  }, []);

  // Save database on state changes
  useEffect(() => {
    saveDatabase({
      users,
      courses,
      assignments,
      submissions,
      announcements,
      discussions,
      notifications,
      currentUserId,
    });
  }, [users, courses, assignments, submissions, announcements, discussions, notifications, currentUserId]);

  const currentUser = users.find(u => u.id === currentUserId) || null;

  // Auth Handlers
  const handleOpenAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLogin = (userId: string) => {
    setCurrentUserId(userId);
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, loginCount: u.loginCount + 1 };
      }
      return u;
    }));
    saveDatabase({ currentUserId: userId });
    setIsAuthModalOpen(false);
  };

  const handleSignUp = (newUser: User) => {
    const cleanNewEmail = newUser.email.trim().toLowerCase();
    setUsers(prev => {
      const filtered = prev.filter(u => u.email.trim().toLowerCase() !== cleanNewEmail);
      return [newUser, ...filtered];
    });
    setCurrentUserId(newUser.id);
    saveDatabase({ currentUserId: newUser.id });
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setCurrentUserId('');
    saveDatabase({ currentUserId: '' });
  };

  const handleUserSwitch = (userId: string) => {
    handleLogin(userId);
  };

  const handleEnrollCourse = (courseId: string) => {
    if (!currentUser) return;
    setCourses(prev => prev.map(c => {
      if (c.id === courseId && !c.enrolledStudents.includes(currentUser.id)) {
        return { ...c, enrolledStudents: [...c.enrolledStudents, currentUser.id] };
      }
      return c;
    }));
  };

  const handleUpdateProfile = (updatedFields: Partial<User>) => {
    if (!currentUser) return;
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, ...updatedFields };
      }
      return u;
    }));
  };

  const handleSubmitAssignment = (assignmentId: string, fileName: string, fileSize: string) => {
    if (!currentUser) return;
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    setSubmissions(prev => {
      const existingSub = prev.find(s => s.assignmentId === assignmentId && s.studentId === currentUser.id);
      const nowStr = new Date().toISOString();

      if (existingSub) {
        const nextVersion = existingSub.submissionHistory.length + 1;
        const updatedHistory = [
          ...existingSub.submissionHistory,
          { fileName, submittedAt: nowStr, version: nextVersion }
        ];

        return prev.map(s => {
          if (s.id === existingSub.id) {
            return {
              ...s,
              fileName,
              fileSize,
              submittedAt: nowStr,
              status: 'Submitted',
              submissionHistory: updatedHistory,
            };
          }
          return s;
        });
      } else {
        const newSub: Submission = {
          id: `sub_${Date.now()}`,
          assignmentId,
          studentId: currentUser.id,
          studentName: currentUser.name,
          fileName,
          fileSize,
          submittedAt: nowStr,
          status: 'Submitted',
          grade: null,
          feedback: null,
          submissionHistory: [
            { fileName, submittedAt: nowStr, version: 1 }
          ]
        };
        return [...prev, newSub];
      }
    });

    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, materialViewsCount: u.materialViewsCount + 1 };
      }
      return u;
    }));
  };

  const handleGradeSubmission = (submissionId: string, grade: number, feedback: string) => {
    setSubmissions(prev => prev.map(s => {
      if (s.id === submissionId) {
        return { ...s, grade, feedback, status: 'Graded' };
      }
      return s;
    }));

    const sub = submissions.find(s => s.id === submissionId);
    const asg = assignments.find(a => a.id === sub?.assignmentId);
    if (sub && asg) {
      const newNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        title: 'Assignment Graded!',
        message: `Your lecturer scored "${asg.title}": ${grade}/100. Feedback: "${feedback}"`,
        type: 'grade',
        courseCode: 'CS201',
        createdAt: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const handleGradeStudent = (assignmentId: string, studentId: string, grade: number, feedback: string) => {
    const student = users.find(u => u.id === studentId);
    const studentName = student ? student.name : 'Student';

    setSubmissions(prev => {
      const existingSub = prev.find(s => s.assignmentId === assignmentId && s.studentId === studentId);
      const nowStr = new Date().toISOString();

      if (existingSub) {
        return prev.map(s => {
          if (s.id === existingSub.id) {
            return { ...s, grade, feedback, status: 'Graded' };
          }
          return s;
        });
      } else {
        const newSub: Submission = {
          id: `sub_${Date.now()}`,
          assignmentId,
          studentId,
          studentName,
          fileName: 'Instructor Direct Assessment',
          fileSize: 'N/A',
          submittedAt: nowStr,
          status: 'Graded',
          grade,
          feedback,
          submissionHistory: [
            { fileName: 'Instructor Direct Assessment', submittedAt: nowStr, version: 1 }
          ]
        };
        return [...prev, newSub];
      }
    });

    const asg = assignments.find(a => a.id === assignmentId);
    if (asg) {
      const newNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        title: 'Assignment Graded!',
        message: `Grade published for "${asg.title}": ${grade}/100. Feedback: "${feedback}"`,
        type: 'grade',
        courseCode: 'CS201',
        createdAt: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const handleUpdateCourseEnrollment = (courseId: string, enrolledStudentIds: string[]) => {
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        return { ...c, enrolledStudents: enrolledStudentIds };
      }
      return c;
    }));
  };

  const handleAddCourse = (course: Course) => {
    setCourses(prev => [...prev, course]);
  };

  const handleUpdateCourse = (courseId: string, updatedWeeks: any[]) => {
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        return { ...c, weeks: updatedWeeks };
      }
      return c;
    }));
  };

  const handleAddAnnouncement = (courseId: string, title: string, content: string) => {
    if (!currentUser) return;
    const newAnn: Announcement = {
      id: `ann_${Date.now()}`,
      courseId,
      title,
      content,
      publishedAt: new Date().toISOString(),
      authorName: currentUser.name,
    };
    setAnnouncements(prev => [newAnn, ...prev]);

    const targetCourse = courses.find(c => c.id === courseId);
    if (targetCourse) {
      const newNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        title: 'New Course Alert!',
        message: `Lecturer posted: "${title}"`,
        type: 'announcement',
        courseCode: targetCourse.code,
        createdAt: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const handleAddAssignment = (assignment: Assignment) => {
    setAssignments(prev => [...prev, assignment]);

    const targetCourse = courses.find(c => c.id === assignment.courseId);
    if (targetCourse) {
      const newNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        title: 'New Assignment Out!',
        message: `Homework brief published: "${assignment.title}". Deadline: ${new Date(assignment.deadline).toLocaleDateString()}`,
        type: 'assignment',
        courseCode: targetCourse.code,
        createdAt: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const handleAddPost = (content: string) => {
    if (!currentUser) return;
    const activeCourseId = courses[0]?.id || 'course_1';
    const newPost: DiscussionPost = {
      id: `post_${Date.now()}`,
      courseId: activeCourseId,
      userName: currentUser.name,
      userRole: currentUser.role,
      avatar: currentUser.avatar,
      content,
      timestamp: new Date().toISOString(),
      likes: 0,
      replies: [],
    };
    setDiscussions(prev => [newPost, ...prev]);

    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, discussionCount: u.discussionCount + 1 };
      }
      return u;
    }));
  };

  const handleAddReply = (postId: string, content: string) => {
    if (!currentUser) return;
    setDiscussions(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          replies: [
            ...post.replies,
            {
              id: `reply_${Date.now()}`,
              userName: currentUser.name,
              userRole: currentUser.role,
              avatar: currentUser.avatar,
              content,
              timestamp: new Date().toISOString(),
            }
          ]
        };
      }
      return post;
    }));

    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, discussionCount: u.discussionCount + 1 };
      }
      return u;
    }));
  };

  const handleLikePost = (postId: string) => {
    setDiscussions(prev => prev.map(post => {
      if (post.id === postId) {
        return { ...post, likes: post.likes + 1 };
      }
      return post;
    }));
  };

  const handleTriggerNotification = (
    title: string,
    message: string,
    type: 'assignment' | 'announcement' | 'grade' | 'collaboration'
  ) => {
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      title,
      message,
      type,
      courseCode: 'CS201',
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleClearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F8F7F3] text-slate-900 flex flex-col items-center justify-center p-6 select-none font-sans">
        <div className="flex flex-col items-center text-center max-w-sm w-full space-y-6 bg-white p-8 rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/50">
          <div className="relative flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border-2 border-indigo-100 border-t-indigo-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              CAML LMS
            </h1>
            <p className="text-[11px] text-slate-500 font-mono tracking-wider uppercase font-semibold">
              CAMU DIGITAL CAMPUS
            </p>
          </div>

          <div className="w-full space-y-2.5 pt-1">
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200/80 shadow-inner">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-75 ease-out shadow-xs"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono px-0.5">
              <div className="flex items-center space-x-1.5 font-medium">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                <span>
                  {loadingProgress < 35
                    ? 'Loading workspace...'
                    : loadingProgress < 75
                    ? 'Fetching courses...'
                    : 'Preparing campus...'}
                </span>
              </div>
              <span className="font-bold text-indigo-600">{loadingProgress}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-slate-900 flex flex-col font-sans">
      
      {/* Main navigation */}
      <Navbar
        currentUser={currentUser}
        allUsers={users}
        onUserSwitch={handleUserSwitch}
        notifications={notifications}
        onClearNotification={handleClearNotification}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onOpenAuthModal={handleOpenAuthModal}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentUser ? (
          currentUser.role === 'student' ? (
            <StudentDashboard
              currentUser={currentUser}
              courses={courses}
              assignments={assignments}
              submissions={submissions}
              announcements={announcements}
              discussions={discussions}
              allUsers={users}
              onEnrollCourse={handleEnrollCourse}
              onUpdateProfile={handleUpdateProfile}
              onSubmitAssignment={handleSubmitAssignment}
              onAddPost={handleAddPost}
              onAddReply={handleAddReply}
              onLikePost={handleLikePost}
              onTriggerNotification={handleTriggerNotification}
            />
          ) : (
            <InstructorDashboard
              currentUser={currentUser}
              courses={courses}
              assignments={assignments}
              submissions={submissions}
              announcements={announcements}
              allUsers={users}
              onAddCourse={handleAddCourse}
              onUpdateCourse={handleUpdateCourse}
              onUpdateCourseEnrollment={handleUpdateCourseEnrollment}
              onAddAnnouncement={handleAddAnnouncement}
              onAddAssignment={handleAddAssignment}
              onGradeSubmission={handleGradeSubmission}
              onGradeStudent={handleGradeStudent}
              onTriggerNotification={handleTriggerNotification}
            />
          )
        ) : (
          /* Logged out Welcome / Auth Hero view - Refined Colored Background & Concise Layout */
          <div className="w-full px-4 sm:px-8 lg:px-10 py-8 sm:py-12 bg-gradient-to-b from-indigo-50/40 via-slate-50/60 to-amber-50/30">
            <div className="bg-white/95 rounded-3xl p-8 sm:p-12 lg:p-14 border border-slate-200/80 shadow-xs w-full relative overflow-hidden backdrop-blur-xs">
              {/* Vibrant subtle background glow shapes */}
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl pointer-events-none -z-0" />
              <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl pointer-events-none -z-0" />

              <div className="max-w-3xl mx-auto text-center mb-12 relative z-10">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
                  Learn, Teach, &amp; Collaborate
                </h1>
                
                <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed font-normal">
                  A unified open platform for course materials, assignment submissions, grading, and peer study groups.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                  <button
                    onClick={() => handleOpenAuthModal('login')}
                    className="w-full sm:w-auto px-8 py-3.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-sm font-extrabold transition-all flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Log In to Account</span>
                  </button>

                  <button
                    onClick={() => handleOpenAuthModal('signup')}
                    className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-900 hover:bg-slate-50 rounded-xl text-sm font-extrabold transition-all flex items-center justify-center space-x-2 border border-slate-300 hover:border-slate-400 shadow-xs cursor-pointer"
                  >
                    <UserPlus className="h-4 w-4 text-indigo-600" />
                    <span>Create New Account</span>
                  </button>
                </div>
              </div>

              {/* Feature Cards Grid (Unclickable, Informational) */}
              <div className="pt-10 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 text-left relative z-10">
                <div className="p-6 rounded-2xl border border-slate-200/70 bg-slate-50/50">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2.5 bg-indigo-100/80 text-indigo-600 rounded-xl">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <span className="font-extrabold text-base text-slate-900">For Students</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Access course materials, submit homework solutions, and form study groups with peers.
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-slate-200/70 bg-slate-50/50">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2.5 bg-indigo-100/80 text-indigo-600 rounded-xl">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <span className="font-extrabold text-base text-slate-900">For Instructors</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Publish syllabus content, set homework tasks, grade submissions, and track class progress.
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-slate-200/70 bg-slate-50/50">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2.5 bg-indigo-100/80 text-indigo-600 rounded-xl">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <span className="font-extrabold text-base text-slate-900">Peer Collaboration</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Coordinate study schedules, participate in discussions, and share knowledge with classmates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Auth Modal component */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        allUsers={users}
        onLogin={handleLogin}
        onSignUp={handleSignUp}
        initialMode={authModalMode}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="w-full px-4 sm:px-8 lg:px-10 text-center text-xs text-slate-400 font-mono space-y-1">
          <p>© 2026 CAML LMS. All rights reserved.</p>
          <p>Public Open Learning Management System for Students & Instructors</p>
        </div>
      </footer>

    </div>
  );
}
