import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarEvent } from '../types';
import { Calendar, Plus, Sparkles, UploadCloud, Link2, Clock, MapPin, X, ArrowRight, RefreshCw, FileText, CheckCircle, ArrowLeft } from 'lucide-react';

interface CalendarViewProps {
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
  onBulkAddEvents: (events: CalendarEvent[]) => void;
  onBack?: () => void;
}

export default function CalendarView({ events, onAddEvent, onBulkAddEvents, onBack }: CalendarViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'month' | 'week'>('month');

  // Simulate dynamic database fetching timer on mount for perceived performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, []);
  
  // Selected day details popup state
  const [selectedDayInfo, setSelectedDayInfo] = useState<{ day: number; events: CalendarEvent[] } | null>(null);

  // AI OCR States
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);

  const handleOcrExtraction = () => {
    setIsProcessingOcr(true);
    setTimeout(() => {
      setIsProcessingOcr(false);
      setOcrSuccess(true);
      // Add a mock extracted event
      onAddEvent({
        id: Math.random().toString(36).substr(2, 9),
        title: "Extracted AI Lecture",
        type: "Extra Class",
        date: "2026-07-20",
        time: "13:00 - 15:30",
        room: "Lab-2",
        course: "CSE 312",
        color: "purple"
      });
      setTimeout(() => {
        setIsOcrOpen(false);
        setOcrSuccess(false);
        setOcrText('');
      }, 1500);
    }, 2000);
  };

  // Manual modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'Extra Class' | 'Exam' | 'Assignment' | 'Project' | 'Personal'>('Extra Class');
  const [newDate, setNewDate] = useState('2026-07-13');
  const [newTime, setNewTime] = useState('09:30 - 11:00');
  const [newRoom, setNewRoom] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [newColor, setNewColor] = useState('blue');

  // Search/Filter states for the Agenda
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  // Month days setup (July 2026 baseline)
  const daysInJuly = 31;
  const startDayOffset = 2; // July 1, 2026 is a Wednesday
  const calendarDays = Array.from({ length: daysInJuly }, (_, i) => i + 1);

  const getEventsForDay = (day: number) => {
    const formattedDayStr = `2026-07-${day.toString().padStart(2, '0')}`;
    return events.filter(e => e.date === formattedDayStr);
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;

    const event: CalendarEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTitle,
      type: newType,
      date: newDate,
      time: newTime,
      room: newRoom || undefined,
      course: newCourse || undefined,
      color: newColor,
    };

    onAddEvent(event);
    setIsAddModalOpen(false);
    
    // reset
    setNewTitle('');
    setNewRoom('');
    setNewCourse('');
  };

  // Sort events chronologically descending (newest/most updated events first)
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const filteredEvents = sortedEvents.filter(evt => {
    const matchesSearch = evt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (evt.course && evt.course.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (evt.room && evt.room.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'All' || evt.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="relative flex flex-col items-center justify-center max-w-sm w-full p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-slate-100 shadow-xl space-y-6">
          {/* Breathing / blinking / rotating glowing logo container */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Ambient outer glowing background aura */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"
            />
            {/* Blinking application logo */}
            <motion.img
              src="/images/app.logo.png"
              alt="Campus OS Loading..."
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [0.93, 1.05, 0.93],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-16 h-16 object-contain relative z-10"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-black text-slate-800 tracking-wider uppercase">
              Loading Event Calendar
            </h3>
            <p className="text-[11px] font-bold text-slate-400 font-mono tracking-tight animate-pulse">
              Retrieving academic schedules from Firestore...
            </p>
          </div>

          {/* Minimal custom linear loader bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ left: "-100%" }}
              animate={{ left: "100%" }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-0 bottom-0 w-1/2 bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-2 rounded-xl border border-slate-200 glass-card text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-3xs"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <Calendar className="w-8 h-8 text-brand-primary" />
            Event Calendar
          </h1>
          <p className="text-slate-500 font-light mt-1">
            Keep track of all classes, exams, assignments, and personal academic events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-brand-primary/15 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>
      </div>

      {/* Main Container - Full Width Calendar Grid */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* Full Width Column: Calendar Grid */}
        <div className="glass-card rounded-3xl border border-slate-200/80 p-6 shadow-xs">
          
          {/* Calendar Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-lg font-extrabold text-slate-800">July 2026</h2>
            
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 self-start sm:self-auto">
              {(['month', 'week'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                    currentTab === tab 
                      ? 'bg-white text-brand-primary shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Monthly grid rendering */}
          {currentTab === 'month' && (
            <div className="grid grid-cols-7 gap-2">
              {/* Day names */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider py-2">
                  {d}
                </div>
              ))}

              {/* Offset blanks */}
              {Array.from({ length: startDayOffset }).map((_, i) => (
                <div key={`blank-${i}`} className="aspect-square bg-slate-50/30 rounded-xl border border-slate-100/20" />
              ))}

              {/* Real month days */}
              {calendarDays.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isBaseline = day === 13; // baseline Monday
                const hasEvents = dayEvents.length > 0;

                return (
                  <button 
                    key={day} 
                    onClick={() => {
                      if (hasEvents) {
                        setSelectedDayInfo({ day, events: dayEvents });
                      }
                    }}
                    disabled={!hasEvents}
                    className={`aspect-square p-2 rounded-2xl border flex flex-col justify-between text-left transition-all relative ${
                      isBaseline 
                        ? 'bg-brand-primary/5 border-brand-primary/40 text-brand-primary glow-purple' 
                        : hasEvents
                          ? 'bg-white border-slate-200 hover:border-brand-primary/40 hover:bg-brand-primary/5 hover:scale-[1.03] hover:shadow-md cursor-pointer'
                          : 'bg-slate-50/50 border-slate-100 opacity-60'
                    }`}
                  >
                    <span className={`text-xs font-extrabold ${isBaseline ? 'text-brand-primary' : 'text-slate-600'}`}>
                      {day}
                    </span>

                    {/* Miniature dots for events */}
                    <div className="flex flex-wrap gap-1 mt-1 max-h-[24px] overflow-hidden">
                      {dayEvents.map((evt) => {
                        let dotColor = "bg-blue-500";
                        if (evt.type === 'Exam') dotColor = "bg-rose-500";
                        if (evt.type === 'Assignment') dotColor = "bg-amber-500";
                        if (evt.type === 'Project') dotColor = "bg-purple-500";
                        if (evt.type === 'Personal') dotColor = "bg-slate-500";
                        if (evt.type === 'Extra Class') dotColor = "bg-indigo-500";
                        
                        return (
                          <span 
                            key={evt.id} 
                            className={`w-2.5 h-2.5 rounded-full ${dotColor}`}
                            title={`${evt.title} (${evt.time})`}
                          />
                        );
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Week list view fallback (clean weekly scheduling dashboard) */}
          {currentTab === 'week' && (
            <div className="space-y-6">
              {[13, 14, 15, 16, 17].map((dayNum) => {
                const dayEvents = getEventsForDay(dayNum);
                const dayLabel = dayNum === 13 ? "Monday, July 13" :
                                 dayNum === 14 ? "Tuesday, July 14" :
                                 dayNum === 15 ? "Wednesday, July 15" :
                                 dayNum === 16 ? "Thursday, July 16" :
                                 "Friday, July 17";

                return (
                  <div key={dayNum} className="border-b border-slate-100 last:border-b-0 pb-6">
                    <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-primary"></span>
                      {dayLabel}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dayEvents.map((evt) => (
                        <div key={evt.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3">
                          <div className={`w-2.5 self-stretch rounded-full shrink-0 ${
                            evt.type === 'Extra Class' ? 'bg-blue-400' :
                            evt.type === 'Exam' ? 'bg-rose-400' :
                            evt.type === 'Assignment' ? 'bg-amber-400' :
                            'bg-indigo-400'
                          }`} />
                          <div className="grow">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{evt.course || 'GENERAL'}</h4>
                            <h5 className="text-sm font-bold text-slate-800 mt-0.5">{evt.title}</h5>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 font-light">
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {evt.time}</span>
                              {evt.room && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {evt.room}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                      {dayEvents.length === 0 && (
                        <p className="text-xs text-slate-400 font-light py-2">No active classes or exams scheduled.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* DETAILED ACADEMIC EVENTS & ROUTINE LIST (PAST & FUTURE PERSISTENT LIST) */}
        <div className="glass-card rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">All Registered Events & History</h3>
              <p className="text-xs text-slate-500 font-light mt-1">
                Completed, ongoing, and upcoming exams, classes, and schedules are preserved here chronologically.
              </p>
            </div>
            
            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-brand-primary focus:glass-card rounded-xl text-xs font-semibold outline-hidden min-w-[150px]"
              />
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="Extra Class">Extra Class</option>
                <option value="Exam">Exam</option>
                <option value="Assignment">Assignment</option>
                <option value="Project">Project</option>
                <option value="Personal">Personal</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredEvents.length > 0 ? (
              <table className="w-full text-left text-xs font-semibold border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4 font-bold">Event Title</th>
                    <th className="py-3 px-4 font-bold">Type</th>
                    <th className="py-3 px-4 font-bold">Date & Day</th>
                    <th className="py-3 px-4 font-bold">Time</th>
                    <th className="py-3 px-4 font-bold">Location</th>
                    <th className="py-3 px-4 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredEvents.map((evt) => {
                    // Check if date is in past or future.
                    // Baseline date is 2026-07-11
                    const isPassed = new Date(evt.date) < new Date('2026-07-11');
                    
                    let badgeBg = "bg-blue-50 text-blue-600 border-blue-100";
                    if (evt.type === 'Exam') badgeBg = "bg-rose-50 text-rose-600 border-rose-100";
                    if (evt.type === 'Assignment') badgeBg = "bg-amber-50 text-amber-600 border-amber-100";
                    if (evt.type === 'Project') badgeBg = "bg-purple-50 text-purple-600 border-purple-100";
                    if (evt.type === 'Personal') badgeBg = "bg-slate-100 text-slate-600 border-slate-200";
                    if (evt.type === 'Extra Class') badgeBg = "bg-indigo-50 text-indigo-600 border-indigo-100";

                    return (
                      <tr key={evt.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-extrabold text-slate-800 text-sm block">{evt.title}</span>
                            {evt.course && (
                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-1.5 py-0.5 rounded mt-1 inline-block">
                                {evt.course}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeBg}`}>
                            {evt.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {new Date(evt.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium font-mono">
                          {evt.time}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {evt.room || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPassed 
                              ? 'bg-slate-100 text-slate-400' 
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                            {isPassed ? 'Passed' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-8 text-center text-slate-400 font-light">
                No events found matching your search parameters.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL 1: MANUAL EVENT ADDITION */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            {/* Dialog Content */}
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="glass-card rounded-3xl border border-slate-200/80 p-6 shadow-2xl relative w-full max-w-md z-10"
            >
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-primary" />
                Register New Event
              </h2>

              <form onSubmit={handleAddManual} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Event Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Database Mid-Term"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-1 focus:ring-brand-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Event Type</label>
                    <select
                      value={newType}
                      onChange={(e: any) => setNewType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-1 focus:ring-brand-primary"
                    >
                      <option value="Extra Class">Extra Class</option>
                      <option value="Exam">Exam</option>
                      <option value="Assignment">Assignment</option>
                      <option value="Project">Project</option>
                      <option value="Personal">Personal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Calendar Date</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-1 focus:ring-brand-primary"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Time Period</label>
                    <input
                      type="text"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      placeholder="e.g. 10:00 - 11:30"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Room Number</label>
                    <input
                      type="text"
                      value={newRoom}
                      onChange={(e) => setNewRoom(e.target.value)}
                      placeholder="e.g. CS-402"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Course Code</label>
                  <input
                    type="text"
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    placeholder="e.g. CSE 301"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-brand-primary"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-brand-primary/10"
                  >
                    Save Event
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: AI OCR ROUTINE EXTRACTION */}
      <AnimatePresence>
        {isOcrOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOcrOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="glass-card rounded-3xl border border-slate-200/80 p-6 shadow-2xl relative w-full max-w-lg z-10"
            >
              <button 
                onClick={() => setIsOcrOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-primary animate-pulse" />
                AI Schedule Extractor
              </h2>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed font-light">
                Paste any unstructured syllabus texts, exam lists, or class times. Our server-side Gemini intelligence will dissect the natural dates and map them directly into your calendar.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Schedule Text Blueprint</label>
                  <textarea
                    rows={5}
                    value={ocrText}
                    onChange={(e) => setOcrText(e.target.value)}
                    placeholder="e.g. 'Advanced AI lecture is scheduled every Monday 13:00 to 15:30 in Room Lab-2. And there's a database exam on Thursday next week at 10 AM.'"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-1 focus:ring-brand-primary placeholder:text-slate-400 leading-relaxed"
                  />
                </div>

                {/* Upload Routine image mockup */}
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-brand-primary/40 transition-colors">
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <span className="block text-xs font-bold text-slate-700">Drop schedule image or PDF routine</span>
                  <span className="block text-[10px] text-slate-400 mt-1">Converts via OCR models</span>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOcrOpen(false)}
                    className="px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleOcrExtraction}
                    disabled={isProcessingOcr || !ocrText}
                    className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-brand-primary/10 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                  >
                    {isProcessingOcr ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        AI Dissecting...
                      </>
                    ) : ocrSuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-white" />
                        Extracted Successfully!
                      </>
                    ) : (
                      <>
                        Dissect Routine
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: SELECT DAY DETAILS POPUP */}
      <AnimatePresence>
        {selectedDayInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDayInfo(null)}
              className="absolute inset-0 bg-slate-900/55 backdrop-blur-xs"
            />

            {/* Dialog Content */}
            <motion.div 
              initial={{ scale: 0.94, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="glass-card rounded-3xl border border-slate-200/80 p-6 shadow-2xl relative w-full max-w-md z-10 overflow-hidden text-slate-800"
            >
              {/* Top ambient glow bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-brand-primary via-brand-secondary to-indigo-500" />

              <button 
                onClick={() => setSelectedDayInfo(null)}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-2.5 py-1 rounded-lg">
                  Scheduled events
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-2.5 flex items-center gap-2">
                  <Calendar className="w-5.5 h-5.5 text-brand-primary" />
                  July {selectedDayInfo.day}, 2026
                </h2>
                <p className="text-xs text-slate-400 font-light mt-1">
                  You have {selectedDayInfo.events.length} active event{selectedDayInfo.events.length > 1 ? 's' : ''} scheduled on this day.
                </p>
              </div>

              {/* Event Cards List */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1.5">
                {selectedDayInfo.events.map((evt) => {
                  let borderCol = "border-l-blue-500 bg-blue-500/5";
                  let textCol = "text-blue-600";
                  if (evt.type === 'Exam') {
                    borderCol = "border-l-rose-500 bg-rose-500/5";
                    textCol = "text-rose-600";
                  } else if (evt.type === 'Assignment') {
                    borderCol = "border-l-amber-500 bg-amber-500/5";
                    textCol = "text-amber-600";
                  } else if (evt.type === 'Project') {
                    borderCol = "border-l-purple-500 bg-purple-500/5";
                    textCol = "text-purple-600";
                  } else if (evt.type === 'Personal') {
                    borderCol = "border-l-slate-500 bg-slate-500/5";
                    textCol = "text-slate-600";
                  } else if (evt.type === 'Extra Class') {
                    borderCol = "border-l-indigo-500 bg-indigo-500/5";
                    textCol = "text-indigo-600";
                  }

                  return (
                    <div 
                      key={evt.id} 
                      className={`p-4 rounded-2xl border border-slate-100 border-l-4 ${borderCol} space-y-2.5 hover:shadow-xs transition-shadow`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${textCol}`}>
                          {evt.type}
                        </span>
                        {evt.course && (
                          <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                            {evt.course}
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-slate-800">{evt.title}</h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-3.5 pt-1 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {evt.time}
                        </span>
                        {evt.room && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {evt.room}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Close Button */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedDayInfo(null)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Close Blueprint
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
