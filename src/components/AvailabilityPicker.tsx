import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Check } from 'lucide-react';

interface AvailabilityPickerProps {
  value: string;
  onChange: (formattedValue: string) => void;
}

const DAYS = [
  { id: 'Mon', label: 'Mon', fullName: 'Monday' },
  { id: 'Tue', label: 'Tue', fullName: 'Tuesday' },
  { id: 'Wed', label: 'Wed', fullName: 'Wednesday' },
  { id: 'Thu', label: 'Thu', fullName: 'Thursday' },
  { id: 'Fri', label: 'Fri', fullName: 'Friday' },
  { id: 'Sat', label: 'Sat', fullName: 'Saturday' },
  { id: 'Sun', label: 'Sun', fullName: 'Sunday' },
];

export default function AvailabilityPicker({ value, onChange }: AvailabilityPickerProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [isFlexibleTime, setIsFlexibleTime] = useState<boolean>(false);

  // Format 24h time to 12h AM/PM
  const formatTime12h = (time24: string) => {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    if (isNaN(h)) return time24;
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const mStr = m ? `:${m < 10 ? '0' + m : m}` : ':00';
    return `${h12}${mStr !== ':00' ? mStr : ''} ${period}`;
  };

  // Helper to format days range nicely
  const formatDaysString = (days: string[]) => {
    if (days.length === 0) return 'No days selected';
    if (days.length === 7) return 'Mon - Sun (Daily)';
    
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const weekendDays = ['Sat', 'Sun'];
    
    const hasAllWeekdays = weekDays.every(d => days.includes(d));
    const hasOnlyWeekdays = days.length === 5 && hasAllWeekdays;
    if (hasOnlyWeekdays) return 'Mon - Fri';

    const hasOnlyWeekend = days.length === 2 && weekendDays.every(d => days.includes(d));
    if (hasOnlyWeekend) return 'Sat - Sun';

    return days.join(', ');
  };

  // Build formatted string and emit
  const updateAvailability = (days: string[], start: string, end: string, flex: boolean) => {
    if (days.length === 0) {
      onChange('Flexible');
      return;
    }

    const daysStr = formatDaysString(days);
    if (flex) {
      onChange(`${daysStr} Flexible`);
    } else {
      const startFmt = formatTime12h(start);
      const endFmt = formatTime12h(end);
      onChange(`${daysStr} ${startFmt} - ${endFmt}`);
    }
  };

  const toggleDay = (dayId: string) => {
    let updated: string[];
    if (selectedDays.includes(dayId)) {
      updated = selectedDays.filter(d => d !== dayId);
    } else {
      // Keep day order Mon->Sun
      const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      updated = [...selectedDays, dayId].sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
    }
    setSelectedDays(updated);
    updateAvailability(updated, startTime, endTime, isFlexibleTime);
  };

  const handlePresetDays = (preset: 'weekdays' | 'weekend' | 'daily' | 'clear') => {
    let updated: string[] = [];
    if (preset === 'weekdays') updated = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    if (preset === 'weekend') updated = ['Sat', 'Sun'];
    if (preset === 'daily') updated = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    if (preset === 'clear') updated = [];
    setSelectedDays(updated);
    updateAvailability(updated, startTime, endTime, isFlexibleTime);
  };

  const handleTimeChange = (newStart: string, newEnd: string, flex: boolean = false) => {
    setStartTime(newStart);
    setEndTime(newEnd);
    setIsFlexibleTime(flex);
    updateAvailability(selectedDays, newStart, newEnd, flex);
  };

  return (
    <div className="space-y-3.5 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/90 text-xs">
      {/* Schedule Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
        <span className="font-extrabold text-slate-800 text-[11px] uppercase font-mono tracking-wider flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-indigo-600" />
          Availability Schedule
        </span>
      </div>

      <div className="space-y-3">
        {/* Day Picker (Mon till Sun) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase font-mono">
                Select Active Days (Mon – Sun)
              </label>
              <div className="flex items-center space-x-1 text-[9px] font-mono">
                <button
                  type="button"
                  onClick={() => handlePresetDays('weekdays')}
                  className="px-1.5 py-0.5 text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 rounded font-semibold"
                >
                  Mon-Fri
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetDays('weekend')}
                  className="px-1.5 py-0.5 text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 rounded font-semibold"
                >
                  Sat-Sun
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetDays('daily')}
                  className="px-1.5 py-0.5 text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 rounded font-semibold"
                >
                  Daily
                </button>
              </div>
            </div>

            {/* Day buttons grid */}
            <div className="grid grid-cols-7 gap-1">
              {DAYS.map(day => {
                const isSelected = selectedDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={`py-2 px-1 rounded-xl text-center font-bold text-[11px] transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                    title={day.fullName}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase font-mono flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-400" /> Time Range
              </label>
              <button
                type="button"
                onClick={() => handleTimeChange(startTime, endTime, !isFlexibleTime)}
                className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border transition-all ${
                  isFlexibleTime
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isFlexibleTime ? '✓ Flexible Hours' : 'Set Specific Hours'}
              </button>
            </div>

            {!isFlexibleTime ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] text-slate-400 font-mono block mb-1">Start Time</span>
                    <input
                      type="time"
                      value={startTime}
                      onChange={e => handleTimeChange(e.target.value, endTime, false)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-mono block mb-1">End Time</span>
                    <input
                      type="time"
                      value={endTime}
                      onChange={e => handleTimeChange(startTime, e.target.value, false)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 font-medium text-slate-900"
                    />
                  </div>
                </div>

                {/* Quick Time Shortcuts */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {[
                    { label: 'Morning (9AM-12PM)', start: '09:00', end: '12:00' },
                    { label: 'Afternoon (1PM-5PM)', start: '13:00', end: '17:00' },
                    { label: 'Evening (6PM-9PM)', start: '18:00', end: '21:00' },
                    { label: 'Full Workday (9AM-5PM)', start: '09:00', end: '17:00' },
                  ].map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleTimeChange(preset.start, preset.end, false)}
                      className="text-[9px] font-medium bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 px-2 py-0.5 rounded-lg border border-slate-200 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-[10px] text-emerald-800 font-medium flex items-center space-x-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Marked as flexible time throughout the selected days.</span>
              </div>
            )}
          </div>

          {/* Formatted Summary Preview */}
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
            <span className="text-[9px] text-slate-400 uppercase font-mono font-bold">Result String:</span>
            <span className="text-xs font-bold text-indigo-900 bg-indigo-50/90 px-2.5 py-1 rounded-lg border border-indigo-200 font-mono">
              {value || 'Not set'}
            </span>
          </div>
        </div>
    </div>
  );
}
