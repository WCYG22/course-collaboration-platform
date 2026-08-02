import React, { useState } from 'react';
import { Course, Assignment } from '../types';
import { Calendar as CalendarIcon, Clock, Users, BookOpen, AlertCircle, Plus, MapPin, Filter, ChevronLeft, ChevronRight, Check, CalendarDays, CalendarCheck } from 'lucide-react';

interface ScheduleEvent {
  id: string;
  title: string;
  courseCode: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  specificDate?: string; // e.g. "2026-07-24"
  startTime: string; // e.g. "10:00"
  endTime: string; // e.g. "12:00"
  type: 'lecture' | 'assignment' | 'study' | 'office_hours';
  location: string;
  isCustom?: boolean;
}

interface ScheduleViewProps {
  courses: Course[];
  assignments: Assignment[];
}

const DAYS_OF_WEEK: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[] = [
  'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
];

const DAY_FULL_NAMES: Record<string, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

// Helper: Get Monday of the week for a given date
function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

// Helper: Format date string YYYY-MM-DD
function toYYYYMMDD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ScheduleView({ courses, assignments }: ScheduleViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'month' | 'agenda'>('grid');
  const [selectedDayTab, setSelectedDayTab] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  // Week navigation state (defaulting to current week's Monday)
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(() => getMonday(new Date(2026, 6, 23)));
  
  // Month view state (month index 0-11 and year)
  const [activeMonthDate, setActiveMonthDate] = useState<Date>(() => new Date(2026, 6, 1));

  // Initial schedule events derived from courses & default academic events
  const [events, setEvents] = useState<ScheduleEvent[]>([
    {
      id: 'e-1',
      title: 'CS101 Lecture: Algorithms & Complexity',
      courseCode: 'CS101',
      day: 'Mon',
      startTime: '09:00',
      endTime: '11:00',
      type: 'lecture',
      location: 'Lecture Hall A & Online Zoom',
    },
    {
      id: 'e-2',
      title: 'CS101 Lab Session: Recursion Exercises',
      courseCode: 'CS101',
      day: 'Wed',
      startTime: '14:00',
      endTime: '16:00',
      type: 'lecture',
      location: 'Computer Lab 3',
    },
    {
      id: 'e-3',
      title: 'CS150 Database Systems Lecture',
      courseCode: 'CS150',
      day: 'Tue',
      startTime: '10:00',
      endTime: '12:00',
      type: 'lecture',
      location: 'Hall B',
    },
    {
      id: 'e-4',
      title: 'Group Study: CS101 Project Collaboration',
      courseCode: 'CS101',
      day: 'Thu',
      startTime: '15:00',
      endTime: '17:00',
      type: 'study',
      location: 'Library Study Room 4',
      isCustom: true,
    },
    {
      id: 'e-5',
      title: 'Dr. Sarah Office Hours (CS150)',
      courseCode: 'CS150',
      day: 'Fri',
      startTime: '11:00',
      endTime: '12:30',
      type: 'office_hours',
      location: 'Faculty Office 204',
    },
    {
      id: 'e-6',
      title: 'Assignment 1 Deadline Submission',
      courseCode: 'CS101',
      day: 'Fri',
      specificDate: '2026-07-24',
      startTime: '23:59',
      endTime: '23:59',
      type: 'assignment',
      location: 'Student Portal',
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCourseCode, setNewCourseCode] = useState(courses[0]?.code || 'CS101');
  const [newDateStr, setNewDateStr] = useState<string>('2026-07-23');
  const [newDay, setNewDay] = useState<ScheduleEvent['day']>('Thu');
  const [newStartTime, setNewStartTime] = useState('14:00');
  const [newEndTime, setNewEndTime] = useState('16:00');
  const [newType, setNewType] = useState<ScheduleEvent['type']>('study');
  const [newLocation, setNewLocation] = useState('Online Google Meet');

  // Calculate dates for current active week (Mon-Sun)
  const currentWeekDays = DAYS_OF_WEEK.map((dayName, idx) => {
    const d = new Date(currentWeekMonday);
    d.setDate(currentWeekMonday.getDate() + idx);
    const dateISO = toYYYYMMDD(d);
    const formattedShort = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const isToday = dateISO === toYYYYMMDD(new Date());
    return {
      dayName,
      fullDayName: DAY_FULL_NAMES[dayName],
      dateObj: d,
      dateISO,
      formattedShort,
      isToday,
    };
  });

  const sundayOfCurrentWeek = currentWeekDays[6].dateObj;
  const weekRangeText = `${currentWeekDays[0].dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${sundayOfCurrentWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  // Week navigation handlers
  const handlePrevWeek = () => {
    const prev = new Date(currentWeekMonday);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekMonday(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekMonday);
    next.setDate(next.getDate() + 7);
    setCurrentWeekMonday(next);
  };

  const handleJumpToToday = () => {
    setCurrentWeekMonday(getMonday(new Date(2026, 6, 23)));
  };

  const handleJumpToDate = (dateValStr: string) => {
    if (!dateValStr) return;
    const parts = dateValStr.split('-').map(Number);
    if (parts.length === 3) {
      const selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);
      setCurrentWeekMonday(getMonday(selectedDate));
      setActiveMonthDate(new Date(parts[0], parts[1] - 1, 1));
    }
  };

  // Month navigation handlers
  const handlePrevMonth = () => {
    const prev = new Date(activeMonthDate.getFullYear(), activeMonthDate.getMonth() - 1, 1);
    setActiveMonthDate(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(activeMonthDate.getFullYear(), activeMonthDate.getMonth() + 1, 1);
    setActiveMonthDate(next);
  };

  const handleAddMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let derivedDay = newDay;
    if (newDateStr) {
      const parts = newDateStr.split('-').map(Number);
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        const dayIdx = d.getDay(); // 0 is Sun
        const dayMap: ScheduleEvent['day'][] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        derivedDay = dayMap[dayIdx];
      }
    }

    const newEvent: ScheduleEvent = {
      id: `custom-event-${Date.now()}`,
      title: newTitle.trim(),
      courseCode: newCourseCode,
      day: derivedDay,
      specificDate: newDateStr || undefined,
      startTime: newStartTime,
      endTime: newEndTime,
      type: newType,
      location: newLocation.trim() || 'Study Hall / Online',
      isCustom: true,
    };

    setEvents([...events, newEvent]);
    setNewTitle('');
    setShowAddModal(false);
  };

  const getTypeStyle = (type: ScheduleEvent['type']) => {
    switch (type) {
      case 'lecture':
        return {
          bg: 'bg-sky-50/80 hover:bg-sky-50',
          border: 'border-l-4 border-l-sky-500 border-sky-200/80',
          badge: 'bg-sky-100 text-sky-800',
          dot: 'bg-sky-500',
          label: 'Lecture',
        };
      case 'assignment':
        return {
          bg: 'bg-amber-50/80 hover:bg-amber-50',
          border: 'border-l-4 border-l-amber-500 border-amber-200/80',
          badge: 'bg-amber-100 text-amber-900',
          dot: 'bg-amber-500',
          label: 'Deadline',
        };
      case 'study':
        return {
          bg: 'bg-indigo-50/80 hover:bg-indigo-50',
          border: 'border-l-4 border-l-indigo-500 border-indigo-200/80',
          badge: 'bg-indigo-100 text-indigo-800',
          dot: 'bg-indigo-500',
          label: 'Group Study',
        };
      case 'office_hours':
        return {
          bg: 'bg-emerald-50/80 hover:bg-emerald-50',
          border: 'border-l-4 border-l-emerald-500 border-emerald-200/80',
          badge: 'bg-emerald-100 text-emerald-800',
          dot: 'bg-emerald-500',
          label: 'Office Hours',
        };
      default:
        return {
          bg: 'bg-slate-50 hover:bg-slate-100',
          border: 'border-l-4 border-l-slate-400 border-slate-200',
          badge: 'bg-slate-200 text-slate-800',
          dot: 'bg-slate-500',
          label: 'Session',
        };
    }
  };

  // Helper to check if an event applies to a specific day info object
  const getEventsForDay = (dayInfo: typeof currentWeekDays[0]) => {
    return events.filter(e => {
      // If event has a specific date, match exact date
      if (e.specificDate) {
        if (e.specificDate !== dayInfo.dateISO) return false;
      } else {
        // Otherwise match day of week
        if (e.day !== dayInfo.dayName) return false;
      }
      if (selectedTypeFilter !== 'all' && e.type !== selectedTypeFilter) return false;
      return true;
    });
  };

  const visibleDays = selectedDayTab === 'all'
    ? currentWeekDays
    : currentWeekDays.filter(d => d.dayName === selectedDayTab);

  // Month grid calculations
  const year = activeMonthDate.getFullYear();
  const month = activeMonthDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // Get starting offset for Monday-first week
  let startOffset = firstDayOfMonth.getDay() - 1;
  if (startOffset < 0) startOffset = 6; // Sunday = 6

  const daysInMonthCount = lastDayOfMonth.getDate();
  const monthCells = [];

  // Padding cells from previous month
  for (let i = startOffset - 1; i >= 0; i--) {
    const prevDate = new Date(year, month, -i);
    monthCells.push({ dateObj: prevDate, isCurrentMonth: false });
  }

  // Current month cells
  for (let dayNum = 1; dayNum <= daysInMonthCount; dayNum++) {
    const currDate = new Date(year, month, dayNum);
    monthCells.push({ dateObj: currDate, isCurrentMonth: true });
  }

  // Padding cells for trailing days
  const remainingCells = (7 - (monthCells.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const nextDate = new Date(year, month + 1, i);
    monthCells.push({ dateObj: nextDate, isCurrentMonth: false });
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 sm:p-8 rounded-[2rem] text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-sky-300 font-mono text-xs uppercase tracking-wider mb-2 font-bold">
              <CalendarIcon className="h-4 w-4 text-sky-400" />
              <span>Academic Timetable & Calendar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Schedule & Calendar View
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mt-1.5 max-w-xl leading-relaxed">
              Consolidated timetable with actual dates, weekly navigation, monthly overview, and study session scheduling.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm px-5 py-3 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Schedule Group Study</span>
          </button>
        </div>
      </div>

      {/* Date Navigation & Controls Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        
        {/* Row 1: Week Navigator + Date Picker + View Mode Selector */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Week Date Range Navigator */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={handlePrevWeek}
                className="p-2 hover:bg-white rounded-lg text-slate-700 transition-colors cursor-pointer"
                title="Previous Week"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                onClick={handleJumpToToday}
                className="px-3 py-1.5 font-mono text-xs font-bold text-slate-800 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                Current Week
              </button>

              <button
                onClick={handleNextWeek}
                className="p-2 hover:bg-white rounded-lg text-slate-700 transition-colors cursor-pointer"
                title="Next Week"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Current Week Date Range Badge */}
            <div className="px-3.5 py-2 bg-sky-50 border border-sky-200/90 rounded-xl flex items-center space-x-2 text-sky-950 font-mono font-extrabold text-xs sm:text-sm shadow-2xs">
              <CalendarDays className="h-4 w-4 text-sky-600 shrink-0" />
              <span>{weekRangeText}</span>
            </div>

            {/* Jump to Specific Date Picker */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase shrink-0">Go to Date:</span>
              <input
                type="date"
                value={toYYYYMMDD(currentWeekMonday)}
                onChange={e => handleJumpToDate(e.target.value)}
                className="text-xs font-mono font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold shrink-0 self-start lg:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly Grid
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'month' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Calendar
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'agenda' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Agenda View
            </button>
          </div>
        </div>

        {/* Row 2: Category Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono text-xs sm:text-sm">
            <span className="text-xs text-slate-400 font-bold uppercase mr-1">Filter:</span>
            {[
              { id: 'all', label: 'All Sessions' },
              { id: 'lecture', label: 'Lectures' },
              { id: 'study', label: 'Group Study' },
              { id: 'assignment', label: 'Deadlines' },
              { id: 'office_hours', label: 'Office Hours' },
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedTypeFilter(type.id)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs ${
                  selectedTypeFilter === type.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Quick Day Tabs with Date Display */}
          {viewMode !== 'month' && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-xs font-mono uppercase font-bold text-slate-400 shrink-0 mr-1">Day:</span>
              <button
                onClick={() => setSelectedDayTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                  selectedDayTab === 'all'
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Full Week
              </button>
              {currentWeekDays.map(d => {
                const dayEvents = getEventsForDay(d);
                return (
                  <button
                    key={d.dayName}
                    onClick={() => setSelectedDayTab(d.dayName)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all shrink-0 flex items-center space-x-1.5 cursor-pointer ${
                      selectedDayTab === d.dayName
                        ? 'bg-slate-950 text-white'
                        : d.isToday
                        ? 'bg-sky-100 text-sky-900 border border-sky-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{d.dayName} ({d.formattedShort})</span>
                    {dayEvents.length > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        selectedDayTab === d.dayName ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {dayEvents.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* WEEKLY GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="bg-white rounded-[2rem] border border-slate-200/90 p-5 sm:p-6 shadow-xs overflow-x-auto">
          <div className={`grid gap-4 ${
            selectedDayTab === 'all'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-7 min-w-[320px] lg:min-w-[980px]'
              : 'grid-cols-1'
          }`}>
            {visibleDays.map(dayInfo => {
              const dayEvents = getEventsForDay(dayInfo);
              const sessionCountText = `${dayEvents.length} ${dayEvents.length === 1 ? 'session' : 'sessions'}`;

              return (
                <div 
                  key={dayInfo.dayName} 
                  className={`p-3.5 rounded-2xl border flex flex-col transition-all ${
                    dayInfo.isToday 
                      ? 'bg-sky-50/40 border-sky-300 shadow-2xs' 
                      : 'bg-slate-50/60 border-slate-200/80'
                  }`}
                >
                  {/* Day Header with Actual Date */}
                  <div className="pb-3 mb-3 border-b border-slate-200/70 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-slate-900 tracking-tight">
                        {dayInfo.fullDayName}
                      </span>
                      {dayInfo.isToday && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-sky-600 text-white uppercase">
                          Today
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-bold text-slate-500">
                        {dayInfo.formattedShort}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        dayEvents.length > 0 ? 'bg-sky-100 text-sky-800' : 'bg-slate-200/70 text-slate-500'
                      }`}>
                        {sessionCountText}
                      </span>
                    </div>
                  </div>

                  {/* Day Events Container */}
                  <div className="space-y-3 flex-1">
                    {dayEvents.length === 0 ? (
                      <div className="h-full min-h-[100px] flex items-center justify-center p-4 border border-dashed border-slate-200 rounded-xl bg-white/60">
                        <span className="text-xs text-slate-400 font-mono font-medium">No sessions</span>
                      </div>
                    ) : (
                      dayEvents.map(event => {
                        const style = getTypeStyle(event.type);
                        return (
                          <div
                            key={event.id}
                            className={`p-3.5 rounded-xl border ${style.bg} ${style.border} transition-all shadow-2xs hover:shadow-xs space-y-2`}
                          >
                            <div className="flex items-center justify-between text-xs font-mono font-extrabold">
                              <span className="text-slate-900">{event.courseCode}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${style.badge}`}>
                                {style.label}
                              </span>
                            </div>

                            <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                              {event.title}
                            </h4>

                            <div className="space-y-1.5 text-xs font-mono text-slate-600 pt-1">
                              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                                <Clock className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                                <span>{event.startTime} - {event.endTime}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MONTHLY CALENDAR VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-[2rem] border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
          {/* Month Header Navigation */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <CalendarCheck className="h-6 w-6 text-sky-600" />
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono">
                {activeMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevMonth}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setActiveMonthDate(new Date(2026, 6, 1))}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                This Month
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Month Grid Table */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Header Names */}
            {DAYS_OF_WEEK.map(d => (
              <div key={d} className="p-2 text-center font-mono font-black text-xs text-slate-500 uppercase bg-slate-50 rounded-xl border border-slate-200/60">
                {d}
              </div>
            ))}

            {/* Calendar Cells */}
            {monthCells.map((cell, idx) => {
              const cellISO = toYYYYMMDD(cell.dateObj);
              const cellDayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][cell.dateObj.getDay()] as ScheduleEvent['day'];
              
              // Find matching events for this cell date
              const dayMatchingEvents = events.filter(e => {
                if (e.specificDate) return e.specificDate === cellISO;
                return e.day === cellDayName;
              });

              const isToday = cellISO === toYYYYMMDD(new Date());

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentWeekMonday(getMonday(cell.dateObj));
                    setViewMode('grid');
                  }}
                  className={`min-h-[95px] sm:min-h-[110px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    cell.isCurrentMonth
                      ? isToday
                        ? 'bg-sky-50/70 border-sky-400 ring-2 ring-sky-200'
                        : 'bg-white hover:bg-slate-50 border-slate-200/90 shadow-2xs'
                      : 'bg-slate-50/40 border-slate-100 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-mono font-bold text-xs ${
                      cell.isCurrentMonth ? (isToday ? 'text-sky-900 font-black' : 'text-slate-800') : 'text-slate-300'
                    }`}>
                      {cell.dateObj.getDate()}
                    </span>
                    {isToday && (
                      <span className="text-[9px] bg-sky-600 text-white font-mono font-extrabold px-1.5 py-0.2 rounded">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Event Badges in cell */}
                  {cell.isCurrentMonth && dayMatchingEvents.length > 0 && (
                    <div className="space-y-1 my-1 overflow-hidden">
                      {dayMatchingEvents.slice(0, 2).map(ev => {
                        const style = getTypeStyle(ev.type);
                        return (
                          <div key={ev.id} className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold truncate ${style.badge}`}>
                            {ev.courseCode}: {ev.title}
                          </div>
                        );
                      })}
                      {dayMatchingEvents.length > 2 && (
                        <div className="text-[9px] text-slate-500 font-mono font-bold">
                          +{dayMatchingEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 font-mono font-bold self-end">
                    Click to view week
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AGENDA LIST VIEW WITH DATES */}
      {viewMode === 'agenda' && (
        <div className="bg-white rounded-[2rem] border border-slate-200/90 overflow-hidden shadow-xs divide-y divide-slate-100">
          {visibleDays.map(dayInfo => {
            const dayEvents = getEventsForDay(dayInfo);
            if (dayEvents.length === 0) return null;

            return (
              <div key={dayInfo.dayName} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start gap-4">
                <div className={`sm:w-44 shrink-0 p-4 rounded-2xl border text-center font-mono ${
                  dayInfo.isToday ? 'bg-sky-50 border-sky-300' : 'bg-slate-50 border-slate-200/80'
                }`}>
                  <span className="text-base font-black text-slate-900 block uppercase">
                    {dayInfo.fullDayName}
                  </span>
                  <span className="text-xs font-extrabold text-sky-700 block mt-0.5">
                    {dayInfo.formattedShort}
                  </span>
                  <span className="text-[11px] text-slate-500 font-bold mt-1 block">
                    {dayEvents.length} {dayEvents.length === 1 ? 'session' : 'sessions'}
                  </span>
                </div>

                <div className="flex-1 space-y-3">
                  {dayEvents.map(event => {
                    const style = getTypeStyle(event.type);
                    return (
                      <div
                        key={event.id}
                        className={`p-4 sm:p-5 rounded-2xl border ${style.bg} ${style.border} flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-extrabold uppercase px-2.5 py-0.5 rounded bg-white/90 border border-slate-200 text-slate-900">
                              {event.courseCode}
                            </span>
                            <span className={`text-xs font-mono font-extrabold uppercase px-2 py-0.5 rounded ${style.badge}`}>
                              {style.label}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-base text-slate-900 mt-1">{event.title}</h4>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-mono text-slate-700 shrink-0 bg-white/80 px-4 py-2.5 rounded-xl border border-slate-200/80">
                          <div className="flex items-center gap-1.5 font-bold">
                            <Clock className="h-4 w-4 text-slate-500" />
                            <span>{event.startTime} - {event.endTime}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {currentWeekDays.every(d => getEventsForDay(d).length === 0) && (
            <div className="text-center py-12 p-6">
              <CalendarIcon className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-800 font-bold text-base">No events match your selected filters for this week</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Try switching categories or navigating weeks.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal: Add Group Study Session */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Users className="h-5 w-5 text-sky-600" /> Schedule Study Session
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMeeting} className="space-y-3.5 text-xs">
              <div>
                <label className="font-mono font-bold text-slate-500 uppercase block mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Midterm Group Revision & Problem Solving"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-medium text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-mono font-bold text-slate-500 uppercase block mb-1">Course Code</label>
                  <select
                    value={newCourseCode}
                    onChange={e => setNewCourseCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-medium bg-white text-sm"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.code}>{c.code}</option>
                    ))}
                    <option value="GENERAL">GENERAL</option>
                  </select>
                </div>

                <div>
                  <label className="font-mono font-bold text-slate-500 uppercase block mb-1">Specific Calendar Date</label>
                  <input
                    type="date"
                    required
                    value={newDateStr}
                    onChange={e => setNewDateStr(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-medium font-mono text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-mono font-bold text-slate-500 uppercase block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={e => setNewStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="font-mono font-bold text-slate-500 uppercase block mb-1">End Time</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={e => setNewEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-medium text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono font-bold text-slate-500 uppercase block mb-1">Location / Link</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  placeholder="e.g. Library Room 3 or Google Meet Link"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-medium text-sm"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Add to Timetable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

