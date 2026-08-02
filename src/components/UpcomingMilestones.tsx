import React, { useState } from 'react';
import { Assignment, Course, Submission } from '../types';
import { Calendar, Clock, AlertCircle, CheckCircle2, Award, Flame, Plus, Flag, ArrowRight, ShieldAlert } from 'lucide-react';

interface MilestoneItem {
  id: string;
  title: string;
  courseCode: string;
  courseName: string;
  dueDate: string; // YYYY-MM-DD format or ISO
  type: 'Assignment' | 'Project' | 'Midterm Exam' | 'Quiz' | 'Final Exam' | 'Personal';
  marksWeight: number; // e.g., 20%
  status: 'Pending' | 'In Progress' | 'Submitted' | 'Completed';
  description?: string;
  isCustom?: boolean;
}

interface UpcomingMilestonesProps {
  assignments: Assignment[];
  courses: Course[];
  submissions: Submission[];
  currentUserId: string;
  onSubmitAssignment: (assignmentId: string, fileName: string, fileSize: string) => void;
}

export default function UpcomingMilestones({
  assignments,
  courses,
  submissions,
  currentUserId,
  onSubmitAssignment,
}: UpcomingMilestonesProps) {
  // Built-in exam/quiz milestones
  const [customMilestones, setCustomMilestones] = useState<MilestoneItem[]>([
    {
      id: 'm-midterm-1',
      title: 'CS101 Midterm Examination',
      courseCode: 'CS101',
      courseName: 'Intro to Computer Science',
      dueDate: '2026-07-28',
      type: 'Midterm Exam',
      marksWeight: 25,
      status: 'Pending',
      description: 'Covers Weeks 1-6 topics: Recursion, Sorting Algorithms, Big-O.',
    },
    {
      id: 'm-quiz-2',
      title: 'CS150 Relational Algebra Quiz',
      courseCode: 'CS150',
      courseName: 'Database Systems',
      dueDate: '2026-07-25',
      type: 'Quiz',
      marksWeight: 10,
      status: 'In Progress',
      description: 'Online timed quiz on SQL joins and normal forms.',
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCourseCode, setNewCourseCode] = useState(courses[0]?.code || 'CS101');
  const [newDueDate, setNewDueDate] = useState('');
  const [newType, setNewType] = useState<MilestoneItem['type']>('Personal');
  const [newWeight, setNewWeight] = useState('10');
  const [newDesc, setNewDesc] = useState('');

  // Map assignments into milestone structure
  const assignmentMilestones: MilestoneItem[] = assignments.map(a => {
    const course = courses.find(c => c.id === a.courseId);
    const sub = submissions.find(s => s.assignmentId === a.id && s.studentId === currentUserId);
    return {
      id: a.id,
      title: a.title,
      courseCode: course?.code || 'COURSE',
      courseName: course?.name || 'Academic Course',
      dueDate: a.deadline,
      type: 'Assignment',
      marksWeight: a.marks,
      status: sub ? 'Submitted' : 'Pending',
      description: a.description,
      isCustom: false,
    };
  });

  const allMilestones = [...assignmentMilestones, ...customMilestones];

  // Helper to calculate days remaining
  const getDaysRemaining = (dueDateStr: string) => {
    const now = new Date();
    const due = new Date(dueDateStr);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDueDate) return;

    const course = courses.find(c => c.code === newCourseCode);

    const item: MilestoneItem = {
      id: `custom-ms-${Date.now()}`,
      title: newTitle.trim(),
      courseCode: newCourseCode,
      courseName: course?.name || 'Personal Target',
      dueDate: newDueDate,
      type: newType,
      marksWeight: parseInt(newWeight) || 0,
      status: 'Pending',
      description: newDesc.trim(),
      isCustom: true,
    };

    setCustomMilestones([...customMilestones, item]);
    setNewTitle('');
    setNewDueDate('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const toggleCustomStatus = (id: string) => {
    setCustomMilestones(customMilestones.map(m => {
      if (m.id === id) {
        const nextStatus = m.status === 'Submitted' || m.status === 'Completed' ? 'Pending' : 'Completed';
        return { ...m, status: nextStatus };
      }
      return m;
    }));
  };

  // Sort by urgency (nearest deadline first)
  const sortedMilestones = [...allMilestones].sort((a, b) => {
    const daysA = getDaysRemaining(a.dueDate);
    const daysB = getDaysRemaining(b.dueDate);
    return daysA - daysB;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 rounded-[2rem] text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-300 font-mono text-xs uppercase tracking-wider mb-2">
              <Flame className="h-4 w-4 text-indigo-400 fill-indigo-400/30" />
              <span>Academic Deadlines Tracker</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
              Upcoming Academic Milestones
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
              Visual countdown cards for project submissions, midterm quizzes, and personal revision deadlines. Stay ahead of your assessment calendar!
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-3 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Personal Goal</span>
          </button>
        </div>
      </div>

      {/* Milestones Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedMilestones.map(item => {
          const daysLeft = getDaysRemaining(item.dueDate);
          const isOverdue = daysLeft < 0;
          const isUrgent = daysLeft >= 0 && daysLeft <= 3;
          const isApproaching = daysLeft > 3 && daysLeft <= 7;
          const isDone = item.status === 'Submitted' || item.status === 'Completed';

          return (
            <div
              key={item.id}
              className={`bg-white rounded-[2rem] border transition-all p-6 flex flex-col justify-between shadow-xs relative overflow-hidden ${
                isDone
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : isOverdue
                  ? 'border-amber-300/80 bg-amber-50/20'
                  : isUrgent
                  ? 'border-amber-200 shadow-amber-100/50'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono font-extrabold uppercase px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                    {item.courseCode} • {item.type}
                  </span>

                  {/* Urgency Badge */}
                  {isDone ? (
                    <span className="flex items-center gap-1 text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Done
                    </span>
                  ) : isOverdue ? (
                    <span className="flex items-center gap-1 text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-slate-800 text-white font-mono">
                      Overdue
                    </span>
                  ) : isUrgent ? (
                    <span className="flex items-center gap-1 text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-mono">
                      <ShieldAlert className="h-3.5 w-3.5 text-amber-600" /> Urgent
                    </span>
                  ) : isApproaching ? (
                    <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-mono">
                      Approaching
                    </span>
                  ) : (
                    <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-sky-100 text-sky-800 font-mono">
                      On Track
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg mb-2 leading-snug">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="text-xs sm:text-sm text-slate-600 mb-4 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Countdown Counter Block */}
              <div className="pt-4 mt-2 border-t border-slate-100 space-y-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-700">
                    <Calendar className="h-4.5 w-4.5 text-slate-500" />
                    <div>
                      <span className="text-xs uppercase font-mono text-slate-500 block font-bold">Due Date</span>
                      <span className="font-extrabold text-slate-900">{item.dueDate}</span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-xs uppercase text-slate-500 block font-mono font-bold">Countdown</span>
                    {isDone ? (
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-700">Completed</span>
                    ) : isOverdue ? (
                      <span className="text-xs sm:text-sm font-extrabold text-amber-700">Passed</span>
                    ) : (
                      <span className="text-sm sm:text-base font-black text-slate-900">
                        {daysLeft === 0 ? 'Due Today!' : `${daysLeft} days left`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-xs font-mono text-slate-600 uppercase font-extrabold flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-indigo-500" /> Weight: {item.marksWeight}%
                  </span>

                  {item.isCustom ? (
                    <button
                      onClick={() => toggleCustomStatus(item.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                        isDone
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {isDone ? 'Mark Pending' : 'Mark Completed'}
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-700 font-mono">
                      {isDone ? 'Submission Received' : 'Course Assessment'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Personal Milestone */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Flag className="h-5 w-5 text-indigo-600" /> Add Personal Milestone
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="space-y-3.5 text-xs">
              <div>
                <label className="font-mono font-bold text-slate-500 uppercase block mb-1">Milestone / Goal Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Finish Literature Review Draft"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-mono font-bold text-slate-500 uppercase block mb-1">Course Code</label>
                  <select
                    value={newCourseCode}
                    onChange={e => setNewCourseCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium bg-white"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.code}>{c.code}</option>
                    ))}
                    <option value="GENERAL">GENERAL</option>
                  </select>
                </div>

                <div>
                  <label className="font-mono font-bold text-slate-500 uppercase block mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium bg-white"
                  >
                    <option value="Personal">Personal Goal</option>
                    <option value="Project">Group Project</option>
                    <option value="Quiz">Revision Quiz</option>
                    <option value="Midterm Exam">Exam Target</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono font-bold text-slate-500 uppercase block mb-1">Target Due Date</label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={e => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="font-mono font-bold text-slate-500 uppercase block mb-1">Notes / Description</label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  rows={2}
                  placeholder="Additional details or preparation checklist..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium resize-none"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
