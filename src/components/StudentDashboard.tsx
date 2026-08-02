/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { User, Course, Assignment, Submission, Announcement, DiscussionPost, Material } from '../types';
import { motion } from 'motion/react';
import { 
  BookOpen, FileText, Calendar, Award, UserCheck, CheckCircle2, AlertTriangle, 
  Upload, Sparkles, Plus, X, Search, MapPin, Clock, MessageSquare, Download, Lock, Check, Bookmark, Flame
} from 'lucide-react';
import DiscussionSection from './DiscussionSection';
import AvailabilityPicker from './AvailabilityPicker';
import SavedMaterialsHub from './SavedMaterialsHub';
import UpcomingMilestones from './UpcomingMilestones';
import ScheduleView from './ScheduleView';

interface StudentDashboardProps {
  currentUser: User;
  courses: Course[];
  assignments: Assignment[];
  submissions: Submission[];
  announcements: Announcement[];
  discussions: DiscussionPost[];
  allUsers: User[];
  onEnrollCourse: (courseId: string) => void;
  onUpdateProfile: (updatedProfile: Partial<User>) => void;
  onSubmitAssignment: (assignmentId: string, fileName: string, fileSize: string) => void;
  onAddPost: (content: string) => void;
  onAddReply: (postId: string, content: string) => void;
  onLikePost: (postId: string) => void;
  onTriggerNotification: (title: string, message: string, type: 'assignment' | 'announcement' | 'grade' | 'collaboration') => void;
}

interface ConfirmModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'primary' | 'danger' | 'emerald';
  onConfirm: () => void;
}

export default function StudentDashboard({
  currentUser,
  courses,
  assignments,
  submissions,
  announcements,
  discussions,
  allUsers,
  onEnrollCourse,
  onUpdateProfile,
  onSubmitAssignment,
  onAddPost,
  onAddReply,
  onLikePost,
  onTriggerNotification,
}: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'courses' | 'milestones' | 'schedule' | 'bookmarks' | 'assignments' | 'collaboration' | 'discussions'>('courses');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [matchingSkillSearch, setMatchingSkillSearch] = useState('');
  const [matchingModeFilter, setMatchingModeFilter] = useState<string>('All');
  
  // Confirmation Modal state for student double confirmation
  const [confirmModal, setConfirmModal] = useState<ConfirmModalConfig>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const promptConfirmation = (
    title: string, 
    message: string, 
    onConfirm: () => void, 
    confirmLabel: string = 'Confirm Action',
    confirmVariant: 'primary' | 'danger' | 'emerald' = 'primary'
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmLabel,
      confirmVariant,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      },
    });
  };
  
  // Saved Materials / Bookmark state
  const [bookmarkedMaterialIds, setBookmarkedMaterialIds] = useState<string[]>(['mat-1', 'mat-2']);

  const toggleBookmark = (materialId: string) => {
    if (bookmarkedMaterialIds.includes(materialId)) {
      setBookmarkedMaterialIds(bookmarkedMaterialIds.filter(id => id !== materialId));
    } else {
      setBookmarkedMaterialIds([...bookmarkedMaterialIds, materialId]);
      onTriggerNotification(
        'Resource Saved',
        'Material bookmarked to your Saved Materials & Resource Hub.',
        'collaboration'
      );
    }
  };
  
  // Profile edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSkills, setProfileSkills] = useState<string[]>(currentUser.skills);
  const [skillInput, setSkillInput] = useState('');
  const [profileMode, setProfileMode] = useState(currentUser.preferredMode);
  const [profileAvailability, setProfileAvailability] = useState(currentUser.availability);

  // File Upload states for Assignment Submission
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const isEnrolled = selectedCourse?.enrolledStudents.includes(currentUser.id) || false;

  const handleEnroll = () => {
    if (!selectedCourse) return;
    promptConfirmation(
      'Confirm Course Enrollment',
      `Are you sure you want to enroll in "${selectedCourse.code}: ${selectedCourse.name}"? You will gain access to course syllabus materials, announcements, and assignment submission portals.`,
      () => {
        onEnrollCourse(selectedCourse.id);
        onTriggerNotification(
          'Successfully Enrolled',
          `You have successfully enrolled in ${selectedCourse.code}: ${selectedCourse.name}`,
          'collaboration'
        );
      },
      'Enrol Now',
      'emerald'
    );
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (skillInput.trim() && !profileSkills.includes(skillInput.trim())) {
      setProfileSkills([...profileSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfileSkills(profileSkills.filter(s => s !== skillToRemove));
  };

  const handleSaveProfile = () => {
    promptConfirmation(
      'Confirm Profile Update',
      'Are you sure you want to update your collaboration skills, preferred study mode, and availability schedule?',
      () => {
        onUpdateProfile({
          skills: profileSkills,
          preferredMode: profileMode,
          availability: profileAvailability,
        });
        setIsEditingProfile(false);
        onTriggerNotification(
          'Profile Updated',
          'Your collaboration profile and availability have been successfully updated.',
          'collaboration'
        );
      },
      'Update Profile',
      'primary'
    );
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setUploadError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const currentAssignment = assignments.find(a => a.id === submittingAssignmentId);
    if (!currentAssignment) return;

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !currentAssignment.allowedFileTypes.includes(fileExtension)) {
      setUploadError(`Invalid file type. Only .${currentAssignment.allowedFileTypes.join(', .')} files are allowed.`);
      return;
    }

    // Check file size (in MB)
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > currentAssignment.maxFileSize) {
      setUploadError(`File is too large. Maximum allowed size is ${currentAssignment.maxFileSize} MB.`);
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadSubmit = () => {
    if (!selectedFile || !submittingAssignmentId) return;

    const currentAssignment = assignments.find(a => a.id === submittingAssignmentId);

    promptConfirmation(
      'Confirm Assignment Submission',
      `Are you sure you want to submit file "${selectedFile.name}" for assignment "${currentAssignment?.title || 'Homework'}"? Once submitted, it will be sent to the lecturer for grading.`,
      () => {
        setUploadProgress(0);
        let progress = 0;
        const interval = setInterval(() => {
          progress += 25;
          setUploadProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            
            // Compute file size string
            const sizeInKB = (selectedFile.size / 1024).toFixed(1);
            const sizeStr = Number(sizeInKB) > 1024 
              ? `${(Number(sizeInKB) / 1024).toFixed(1)} MB` 
              : `${sizeInKB} KB`;

            onSubmitAssignment(submittingAssignmentId, selectedFile.name, sizeStr);
            onTriggerNotification(
              'Assignment Submitted',
              `Your work "${selectedFile.name}" has been successfully recorded before the deadline.`,
              'assignment'
            );

            setSelectedFile(null);
            setUploadProgress(null);
            setSubmittingAssignmentId(null);
          }
        }, 300);
      },
      'Confirm Submission',
      'emerald'
    );
  };

  // Filter peers
  const otherStudents = allUsers.filter(u => u.role === 'student' && u.id !== currentUser.id);
  const matchedPeers = otherStudents.filter(peer => {
    const matchesSkill = matchingSkillSearch.trim() === '' || 
      peer.skills.some(skill => skill.toLowerCase().includes(matchingSkillSearch.toLowerCase()));
    const matchesMode = matchingModeFilter === 'All' || peer.preferredMode === matchingModeFilter;
    return matchesSkill && matchesMode;
  });

  return (
    <div id="student-dashboard" className="w-full px-4 sm:px-8 lg:px-10 py-8 animate-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-8 border-b border-slate-200">
        <div>
          <span className="text-xs sm:text-sm font-bold text-slate-600 font-mono uppercase tracking-wider block mb-1">
            Student Workspace
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1.5">
            Access course syllabus materials, submit homework, and coordinate peer study groups.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left column: Course Selector & Quick Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Course Selector card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 font-mono tracking-wider uppercase mb-3">
              Enrolled Course Space
            </h3>
            <div className="space-y-2.5">
              {courses.map(course => {
                const enrolled = course.enrolledStudents.includes(currentUser.id);
                return (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourseId(course.id)}
                    className={`w-full text-left p-3.5 rounded-xl text-sm transition-all border ${
                      selectedCourseId === course.id
                        ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-extrabold tracking-tight font-mono text-sm">{course.code}</span>
                      {enrolled && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="font-extrabold text-sm sm:text-base truncate">{course.name}</p>
                    <p className={`text-xs mt-1 ${selectedCourseId === course.id ? 'text-slate-300' : 'text-slate-500'}`}>
                      Instructor: {course.instructorName}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Profile Overview / Collaboration Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex justify-between items-center mb-3.5">
              <h3 className="text-xs font-bold text-slate-500 font-mono tracking-wider uppercase">
                Your Collab Profile
              </h3>
              <button
                onClick={() => {
                  setIsEditingProfile(!isEditingProfile);
                  setProfileSkills(currentUser.skills);
                  setProfileMode(currentUser.preferredMode);
                  setProfileAvailability(currentUser.availability);
                }}
                className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-bold transition-colors"
              >
                {isEditingProfile ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditingProfile ? (
              <div className="space-y-4">
                {/* Mode */}
                <div>
                  <label className="text-xs text-slate-600 block mb-1 font-semibold">Preferred Mode</label>
                  <select
                    value={profileMode}
                    onChange={e => setProfileMode(e.target.value as any)}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none bg-white font-medium"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Enhanced Day (Mon-Sun) & Time Range Availability Picker */}
                <div>
                  <AvailabilityPicker
                    value={profileAvailability}
                    onChange={setProfileAvailability}
                  />
                </div>

                {/* Skills Tag Edit */}
                <div>
                  <label className="text-xs text-slate-600 block mb-1 font-semibold">Skills & Expertises</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {profileSkills.map(s => (
                      <span key={s} className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full flex items-center space-x-1 font-semibold">
                        <span>{s}</span>
                        <button type="button" onClick={() => handleRemoveSkill(s)} className="text-indigo-400 hover:text-indigo-600">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <form onSubmit={handleAddSkill} className="flex gap-1.5">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      placeholder="Add skill..."
                      className="flex-1 text-xs sm:text-sm px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none bg-white"
                    />
                    <button type="submit" className="bg-slate-900 text-white text-xs sm:text-sm px-3.5 rounded-xl hover:bg-slate-800 font-bold">
                      Add
                    </button>
                  </form>
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="w-full bg-slate-950 hover:bg-slate-850 text-white text-xs sm:text-sm py-2.5 rounded-xl font-bold transition-colors"
                >
                  Save Profile
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 bg-white/80 p-3.5 rounded-2xl border border-indigo-100/60 shadow-xs">
                  <div className="bg-slate-950 p-2.5 rounded-xl text-white">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block font-mono uppercase font-semibold">Preferred Mode</span>
                    <span className="text-sm font-extrabold text-slate-800">{currentUser.preferredMode}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-white/80 p-3.5 rounded-2xl border border-indigo-100/60 shadow-xs">
                  <div className="bg-slate-950 p-2.5 rounded-xl text-white">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block font-mono uppercase font-semibold">Availability</span>
                    <span className="text-sm font-extrabold text-slate-800 truncate block max-w-[150px]">
                      {currentUser.availability || 'Not set yet'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block font-mono uppercase mb-2 font-semibold">Expertise Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentUser.skills.map(skill => (
                      <span key={skill} className="bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>



        </div>

        {/* Right column: Tabs & Content Panel */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Tab buttons */}
          <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap gap-1">
            {[
              { id: 'courses', label: 'Course Materials' },
              { id: 'milestones', label: 'Upcoming Milestones' },
              { id: 'schedule', label: 'Schedule View' },
              { id: 'bookmarks', label: 'Saved Resources' },
              { id: 'assignments', label: 'My Assignments' },
              { id: 'collaboration', label: 'Peer Match & Groups' },
              { id: 'discussions', label: 'Discussions' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[130px] text-center py-3 px-3.5 text-xs sm:text-sm font-extrabold rounded-xl transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TABS CONTENT */}
          {activeTab === 'courses' && selectedCourse && (
            <div className="space-y-6">
              
              {/* Course Header/Join Area */}
              <div className="bg-gradient-to-r from-slate-50/90 via-white to-sky-50/30 p-6 md:p-8 rounded-[2rem] border border-slate-200/90 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200/60 pb-5 mb-5">
                  <div>
                    <span className="text-xs font-bold text-slate-800 font-mono uppercase bg-slate-100 border border-slate-200/60 px-3 py-1 rounded-full">
                      Course Workspace
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
                      {selectedCourse.code}: {selectedCourse.name}
                    </h2>
                  </div>

                  {!isEnrolled ? (
                    <button
                      onClick={handleEnroll}
                      className="mt-3 md:mt-0 px-6 py-3 bg-slate-950 text-white font-bold text-sm rounded-xl hover:bg-slate-850 transition-all shadow-sm cursor-pointer"
                    >
                      Enrol in Course
                    </button>
                  ) : (
                    <div className="mt-3 md:mt-0 flex items-center space-x-2 text-emerald-700 font-extrabold text-sm bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200/80 shadow-2xs">
                      <UserCheck className="h-4.5 w-4.5" />
                      <span>Enrolled & Active</span>
                    </div>
                  )}
                </div>
                
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {selectedCourse.description}
                </p>
              </div>

              {/* Course Materials List (UC-ST-04) */}
              {isEnrolled ? (
                <div className="space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-base font-mono uppercase tracking-wider pl-2">Course Structure & Materials</h3>
                  
                  {selectedCourse.weeks.map(week => (
                    <div key={week.id} className="bg-white rounded-[2rem] border border-slate-200/90 overflow-hidden shadow-xs hover:border-slate-300 transition-all">
                      <div className="bg-gradient-to-r from-slate-100/90 via-indigo-50/40 to-slate-50/80 px-6 py-4 border-b border-slate-200/70">
                        <span className="text-xs font-extrabold text-indigo-700 font-mono uppercase tracking-wider block">WEEK {week.number}</span>
                        <h4 className="font-extrabold text-slate-900 text-base mt-1">{week.title}</h4>
                      </div>

                      <div className="p-5 space-y-3">
                        {week.materials.length === 0 ? (
                          <div className="text-center py-6 text-sm text-slate-500">
                            No materials uploaded for this week yet.
                          </div>
                        ) : (
                          week.materials.map(material => {
                            return (
                              <div key={material.id} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                                material.type === 'lecture' ? 'bg-amber-50/40 hover:bg-amber-50/70 border-amber-200/70' :
                                material.type === 'reading' ? 'bg-indigo-50/40 hover:bg-indigo-50/70 border-indigo-200/70' : 'bg-emerald-50/40 hover:bg-emerald-50/70 border-emerald-200/70'
                              }`}>
                                <div className="flex items-start space-x-3.5 min-w-0">
                                  <div className={`p-2.5 rounded-xl ${
                                    material.type === 'lecture' ? 'bg-amber-100 text-amber-700 border border-amber-200/80' :
                                    material.type === 'reading' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200/80' : 'bg-emerald-100 text-emerald-700 border border-emerald-200/80'
                                  }`}>
                                    <FileText className="h-5 w-5" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                                      <p className="text-sm sm:text-base font-bold text-slate-900 truncate">{material.title}</p>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 font-mono">
                                      {material.fileName} • {material.fileSize}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 shrink-0">
                                  <button
                                    onClick={() => toggleBookmark(material.id)}
                                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                      bookmarkedMaterialIds.includes(material.id)
                                        ? 'bg-amber-100 border-amber-300 text-amber-600'
                                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                                    }`}
                                    title={bookmarkedMaterialIds.includes(material.id) ? "Saved in bookmarks" : "Bookmark this material"}
                                  >
                                    <Bookmark className={`h-4.5 w-4.5 ${bookmarkedMaterialIds.includes(material.id) ? 'fill-amber-500' : ''}`} />
                                  </button>

                                  <button
                                    onClick={() => {
                                      promptConfirmation(
                                        'Confirm Material Download',
                                        `Are you sure you want to download course material file "${material.fileName}"?`,
                                        () => {
                                          onTriggerNotification(
                                            'Material Downloaded',
                                            `Simulated download for "${material.fileName}" started successfully.`,
                                            'collaboration'
                                          );
                                        },
                                        'Download File',
                                        'primary'
                                      );
                                    }}
                                    className="flex items-center space-x-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs sm:text-sm font-bold transition-all border border-slate-200/90 shadow-2xs cursor-pointer"
                                  >
                                    <Download className="h-4 w-4 text-slate-600" />
                                    <span>Download</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-slate-300 rounded-[2rem] bg-white">
                  <Lock className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-800 font-extrabold text-base sm:text-lg">Course Content Locked</p>
                  <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                    Please click "Enrol in Course" above to join the workspace and access lecture slides, readings, and homework resources.
                  </p>
                </div>
              )}

              {/* Course Announcements List (UC-ST-03) */}
              {isEnrolled && (
                <div className="space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-base font-mono uppercase tracking-wider pl-2">Course Announcements</h3>
                  <div className="space-y-3">
                    {announcements.filter(a => a.courseId === selectedCourse.id).map(ann => (
                      <div key={ann.id} className="bg-gradient-to-br from-amber-50/60 via-white to-orange-50/20 border border-amber-200/80 p-6 rounded-[2rem] shadow-xs">
                        <div className="flex justify-between items-start mb-3 border-b border-amber-100/80 pb-2.5">
                          <h4 className="font-bold text-slate-900 text-base">{ann.title}</h4>
                          <span className="text-xs text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full font-mono font-bold border border-amber-200">
                            {new Date(ann.publishedAt).toLocaleDateString([], { dateStyle: 'medium' })}
                          </span>
                        </div>
                        <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-wrap mb-3">
                          {ann.content}
                        </p>
                        <div className="text-xs text-slate-600 font-mono">
                          Posted by <span className="font-extrabold text-slate-900">{ann.authorName}</span> (Lecturer)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {activeTab === 'courses' && !selectedCourse && (
            <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-8">
              <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-900 font-black text-lg sm:text-xl font-mono uppercase tracking-wider">No Courses Configured Yet</p>
              <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                There are no active course spaces yet. Switch to the <strong>Instructor Role</strong> using the top right account switcher to create a course space!
              </p>
            </div>
          )}

          {/* Upcoming Milestones Tab */}
          {activeTab === 'milestones' && (
            <UpcomingMilestones
              assignments={assignments}
              courses={courses}
              submissions={submissions}
              currentUserId={currentUser.id}
              onSubmitAssignment={onSubmitAssignment}
            />
          )}

          {/* Schedule View Tab */}
          {activeTab === 'schedule' && (
            <ScheduleView
              courses={courses}
              assignments={assignments}
            />
          )}

          {/* Saved Resources Tab */}
          {activeTab === 'bookmarks' && (
            <SavedMaterialsHub
              courses={courses}
              bookmarkedMaterialIds={bookmarkedMaterialIds}
              onToggleBookmark={toggleBookmark}
            />
          )}

          {activeTab === 'assignments' && selectedCourse && (
            <div className="space-y-6">
              
              <h3 className="font-extrabold text-slate-900 text-sm font-mono uppercase tracking-wider pl-2">My Homework & Project Submissions</h3>

              {assignments.filter(asg => asg.courseId === selectedCourse.id).length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-[2rem] bg-white p-6">
                  <Calendar className="h-9 w-9 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-700 font-extrabold text-xs font-mono uppercase tracking-wider">No Assignments Published</p>
                  <p className="text-[11px] text-slate-400 mt-1">There are currently no assignments assigned for this course.</p>
                </div>
              ) : assignments.filter(asg => asg.courseId === selectedCourse.id).map(asg => {
                const submission = submissions.find(s => s.assignmentId === asg.id && s.studentId === currentUser.id);
                const isPastDeadline = new Date(asg.deadline).getTime() < Date.now();
                const submissionAttempts = submission?.submissionHistory.length || 0;
                
                // No membership restriction limits
                const hasReachedLimit = false;

                return (
                  <div key={asg.id} className="bg-white rounded-[2rem] border border-slate-200/90 overflow-hidden shadow-xs">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-100/90 via-indigo-50/40 to-slate-50/80 px-6 py-4.5 border-b border-slate-200/70 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <span className="text-[9px] font-bold text-indigo-700 font-mono uppercase tracking-wider">ASSIGNMENT TASK</span>
                        <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">{asg.title}</h4>
                      </div>

                      <div className="flex items-center space-x-2 text-xs text-slate-700 bg-white/90 border border-slate-200 px-3 py-1.5 rounded-full font-mono font-medium shadow-2xs">
                        <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                        <span>
                          Due: <span className="font-bold text-slate-900">{new Date(asg.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </span>
                        {isPastDeadline && (
                          <span className="bg-red-50 text-red-700 border border-red-200/80 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                            Closed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-6">
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                        {asg.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-slate-100 py-4.5 mb-5 text-xs">
                        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
                          <span className="text-slate-400 block text-[9px] uppercase font-mono mb-1">Max Score</span>
                          <span className="font-extrabold text-slate-900">{asg.marks} Marks</span>
                        </div>
                        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
                          <span className="text-slate-400 block text-[9px] uppercase font-mono mb-1">Attempts Logged</span>
                          <span className="font-extrabold text-slate-900">
                            {submissionAttempts} times
                          </span>
                        </div>
                        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
                          <span className="text-slate-400 block text-[9px] uppercase font-mono mb-1">Upload Schema</span>
                          <span className="font-extrabold text-slate-900 uppercase">
                            .{asg.allowedFileTypes.join(', .')} (Max {asg.maxFileSize}MB)
                          </span>
                        </div>
                      </div>

                      {/* Current Submission status */}
                      {submission ? (
                        <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-5 mb-5 shadow-2xs">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-start space-x-3">
                              <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                              <div>
                                <span className="font-extrabold text-emerald-950 text-xs sm:text-sm">Work Record Submitted</span>
                                <p className="text-[10px] text-emerald-700 font-mono mt-1 font-semibold">
                                  Version {submissionAttempts} • Received {new Date(submission.submittedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </p>
                              </div>
                            </div>
                            
                            <span className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-full font-mono border ${
                              submission.status === 'Graded' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                              {submission.status}
                            </span>
                          </div>

                          <div className="bg-white/90 p-3.5 rounded-xl border border-emerald-200/60 text-xs shadow-2xs">
                            <span className="text-slate-400 block text-[9px] uppercase font-mono mb-1">Filename on server</span>
                            <span className="font-bold text-slate-900 truncate block">{submission.fileName}</span>
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{submission.fileSize}</span>
                          </div>

                          {submission.status === 'Graded' && (
                            <div className="mt-4 pt-4 border-t border-emerald-200/60">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">Lecturer Grade & Review</span>
                                <span className="font-black text-base text-indigo-700 font-mono">
                                  {submission.grade} / 100
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm text-slate-700 italic bg-white/90 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed shadow-2xs">
                                "{submission.feedback}"
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-amber-50/60 border border-amber-200/90 rounded-2xl p-5 mb-5 flex items-start space-x-3 shadow-2xs">
                          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold text-amber-950 text-xs sm:text-sm">No submission recorded</span>
                            <p className="text-xs text-amber-800 leading-relaxed mt-1">
                              Please submit your files before the deadline. Make sure your file name follows university standards.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Upload Interface (UC-ST-06 / UC-ST-07) */}
                      {!isPastDeadline && (
                        <div className="mt-4">
                          {submittingAssignmentId === asg.id ? (
                            <div className="space-y-4 animate-none">
                              <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                                  dragActive 
                                    ? 'border-indigo-600 bg-indigo-50/40' 
                                    : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50/50'
                                }`}
                              >
                                <input
                                  type="file"
                                  ref={fileInputRef}
                                  onChange={handleFileChange}
                                  className="hidden"
                                />
                                <Upload className="h-8 w-8 text-slate-450 mx-auto mb-2.5" />
                                <p className="text-xs font-bold text-slate-800">
                                  {selectedFile ? 'Change Selected File' : 'Drag and drop your file here, or click to browse'}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1.5 uppercase font-mono">
                                  Allowed formats: .{asg.allowedFileTypes.join(', .')} • Max size: {asg.maxFileSize}MB
                                </p>

                                {selectedFile && (
                                  <div className="mt-4 bg-slate-950 text-white p-3 rounded-xl max-w-sm mx-auto flex items-center justify-between border border-slate-900 shadow-sm">
                                    <div className="text-left min-w-0">
                                      <p className="text-xs font-bold truncate pr-3">{selectedFile.name}</p>
                                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                    </div>
                                    <button 
                                      type="button" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedFile(null);
                                      }}
                                      className="text-slate-400 hover:text-red-400 flex-shrink-0"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {uploadError && (
                                <p className="text-xs text-red-700 bg-red-50 border border-red-100 px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 font-bold">
                                  <AlertTriangle className="h-4 w-4" /> {uploadError}
                                </p>
                              )}

                              {uploadProgress !== null && (
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-[10px] text-slate-400 font-mono font-semibold">
                                    <span>Uploading & validating...</span>
                                    <span>{uploadProgress}%</span>
                                  </div>
                                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-slate-950 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                  </div>
                                </div>
                              )}

                              <div className="flex space-x-2.5 justify-end">
                                <button
                                  onClick={() => {
                                    setSubmittingAssignmentId(null);
                                    setSelectedFile(null);
                                    setUploadError(null);
                                  }}
                                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200/80"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleUploadSubmit}
                                  disabled={!selectedFile || uploadProgress !== null}
                                  className="px-4 py-2.5 bg-slate-950 hover:bg-slate-850 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                                >
                                  Confirm Submission
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <button
                                onClick={() => setSubmittingAssignmentId(asg.id)}
                                className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-950 hover:bg-slate-850 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                              >
                                <Upload className="h-3.5 w-3.5" />
                                <span>{submission ? 'Resubmit Assignment (Update File)' : 'Upload & Submit File'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'assignments' && !selectedCourse && (
            <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-6">
              <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-800 font-extrabold text-sm font-mono uppercase tracking-wider">No Assignments Found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                There are no course spaces created yet. Switch to the <strong>Instructor Role</strong> using the top right account switcher to create a course space!
              </p>
            </div>
          )}

          {activeTab === 'collaboration' && (
            <div className="space-y-6 animate-none">
              
              {/* Profile Card & Group matching (UC-ST-09) */}
              <div className="bg-gradient-to-b from-indigo-50/30 via-white to-sky-50/20 p-7 sm:p-8 rounded-[2rem] border border-indigo-150/80 shadow-xs">
                <h3 className="font-extrabold text-slate-900 text-base mb-1.5 font-mono uppercase tracking-wider">Group Collaboration & Peer Matching</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Find potential project members by matching preferred mode (online/offline) and tech stack. Reach out in the discussions tab to form groups of 4.
                </p>

                {/* Filter section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white/90 p-5 rounded-2xl border border-indigo-100/80 shadow-2xs mb-6">
                  <div>
                    <label className="text-[10px] text-slate-500 block font-mono font-bold uppercase tracking-wider mb-2">Filter by Tech/Skill</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={matchingSkillSearch}
                        onChange={e => setMatchingSkillSearch(e.target.value)}
                        placeholder="e.g. React, Python, UI/UX"
                        className="w-full text-xs pl-9 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-indigo-400 transition-colors font-medium text-slate-800 placeholder:text-slate-400"
                      />
                      <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block font-mono font-bold uppercase tracking-wider mb-2">Filter by Mode</label>
                    <div className="flex space-x-1.5">
                      {['All', 'Online', 'Offline', 'Hybrid'].map(mode => (
                        <button
                          key={mode}
                          onClick={() => setMatchingModeFilter(mode)}
                          className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold border transition-all ${
                            matchingModeFilter === mode
                              ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Peers list */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-xs font-mono uppercase tracking-wider">
                    Registered Student Peers {selectedCourse ? `for ${selectedCourse.name}` : ''}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {matchedPeers.length === 0 ? (
                      <div className="col-span-2 text-center py-10 text-xs font-medium text-slate-400 font-mono">
                        No students match your filter criteria. Try adjusting the tags or mode!
                      </div>
                    ) : (
                      matchedPeers.map(peer => (
                        <div key={peer.id} className="bg-white border border-slate-200/90 p-5 rounded-2xl hover:border-indigo-300 transition-all hover:shadow-xs bg-gradient-to-b from-white to-indigo-50/20">
                          <div className="flex items-center space-x-3 mb-4">
                            <img
                              className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 object-cover"
                              src={peer.avatar}
                              alt=""
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">{peer.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono truncate">{peer.email}</p>
                            </div>
                            <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full font-mono border bg-indigo-50 text-indigo-700 border-indigo-200">
                              Student
                            </span>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between text-slate-600">
                              <span className="flex items-center gap-1.5 font-medium"><MapPin className="h-3.5 w-3.5 text-indigo-500" /> Preferred Mode:</span>
                              <span className="font-extrabold text-slate-900">{peer.preferredMode}</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-600">
                              <span className="flex items-center gap-1.5 font-medium"><Clock className="h-3.5 w-3.5 text-indigo-500" /> Availability:</span>
                              <span className="font-extrabold text-slate-900 max-w-[140px] truncate">{peer.availability || 'Flexible'}</span>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Expertise & Skills</p>
                            <div className="flex flex-wrap gap-1.5">
                              {peer.skills.map(skill => (
                                <span key={skill} className="bg-indigo-50/80 text-indigo-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-indigo-100">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {activeTab === 'discussions' && selectedCourse && (
            <DiscussionSection
              courseId={selectedCourse.id}
              currentUser={currentUser}
              posts={discussions}
              onAddPost={onAddPost}
              onAddReply={onAddReply}
              onLikePost={onLikePost}
            />
          )}

        </div>

      </div>

      {/* Double Confirmation Modal Overlay */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-none">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-5 animate-none">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg font-mono uppercase tracking-tight">
                    {confirmModal.title}
                  </h3>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 font-mono uppercase px-2 py-0.5 rounded border border-amber-200">
                    Action Confirmation
                  </span>
                </div>
              </div>
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              {confirmModal.message}
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer ${
                  confirmModal.confirmVariant === 'emerald'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : confirmModal.confirmVariant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-slate-950 hover:bg-slate-850'
                }`}
              >
                {confirmModal.confirmLabel || 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
