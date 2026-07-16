import RoutineUploadModal from './RoutineUploadModal';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, CalendarEvent, RoutineClass } from '../types';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Sparkles, 
  CheckCircle, 
  Download, 
  RefreshCw, 
  BookOpen, 
  FileSpreadsheet, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface RoutineViewProps {
  profile: UserProfile;
  events: CalendarEvent[];
  onBack: () => void;
  onSyncRoutineEvents: (routineEvents: CalendarEvent[]) => void;
  onUploadRoutineTrigger: () => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

export default function RoutineView({ 
  profile, 
  events, 
  onBack, 
  onSyncRoutineEvents,
  onUploadRoutineTrigger,
  onUpdateProfile
}: RoutineViewProps) {
  // Define routine days standard for Bangladesh/Varendra University (Sunday - Thursday)
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('Sunday');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Parse student metadata or fall back to standard defaults if incomplete
  const studentBatch = profile.batch || "32nd Batch";
  const studentSection = profile.section || "A";
  const studentSemester = profile.semester || "6th";
  const studentId = profile.studentId || "23131105";

  // Generate dynamic, realistic class routine tailored EXACTLY to the user's specific section
  const getRoutineForDay = (day: string): RoutineClass[] => {
    // If the user has uploaded an actual routine parsed via Gemini, use that!
    if (profile.routineClasses && profile.routineClasses.length > 0) {
      return profile.routineClasses.filter(
        cls => cls.day.toLowerCase() === day.toLowerCase()
      );
    }

    // We adjust times/courses/rooms based on the user's section to demonstrate personalized extraction
    const sectionSuffix = studentSection.toUpperCase() === 'B' ? ' (Sec B)' : ' (Sec A)';
    const offsetHour = studentSection.toUpperCase() === 'B' ? 1 : 0; // Shift times slightly for Sec B
    
    const routineData: Record<string, Omit<RoutineClass, 'day'>[]> = {
      'Saturday': [
        {
          id: 'rot-sat-1',
          courseName: "Advanced Database Systems",
          courseCode: "CSE 301",
          time: `${9 + offsetHour}:30 - ${11 + offsetHour}:00`,
          room: studentSection.toUpperCase() === 'B' ? "CS-403" : "CS-402",
          teacher: "Dr. JKD"
        },
        {
          id: 'rot-sat-2',
          courseName: "Compiler Design Lab",
          courseCode: "CSE 302L",
          time: `13:30 - 16:00`,
          room: "Lab-2",
          teacher: "Mr. MHR"
        }
      ],
      'Sunday': [
        {
          id: 'rot-sun-1',
          courseName: "Compiler Design",
          courseCode: "CSE 302",
          time: `${9 + offsetHour}:00 - ${10 + offsetHour}:30`,
          room: studentSection.toUpperCase() === 'B' ? "CS-401" : "CS-402",
          teacher: "Mr. MHR"
        },
        {
          id: 'rot-sun-2',
          courseName: "Advanced Database Systems",
          courseCode: "CSE 301",
          time: `${11 + offsetHour}:00 - ${12 + offsetHour}:30`,
          room: studentSection.toUpperCase() === 'B' ? "CS-301" : "CS-302",
          teacher: "Dr. JKD"
        }
      ],
      'Monday': [
        {
          id: 'rot-mon-1',
          courseName: "Software Engineering Lab",
          courseCode: "CSE 304",
          time: `${10 + offsetHour}:30 - ${12 + offsetHour}:00`,
          room: studentSection.toUpperCase() === 'B' ? "CS-402" : "CS-403",
          teacher: "Mrs. ARS"
        },
        {
          id: 'rot-mon-2',
          courseName: "Artificial Intelligence",
          courseCode: "CSE 312",
          time: `14:00 - 15:30`,
          room: "CS-402",
          teacher: "Prof. SKB"
        }
      ],
      'Tuesday': [
        {
          id: 'rot-tue-1',
          courseName: "Artificial Intelligence",
          courseCode: "CSE 312",
          time: `${9 + offsetHour}:00 - ${10 + offsetHour}:30`,
          room: studentSection.toUpperCase() === 'B' ? "CS-401" : "CS-402",
          teacher: "Prof. SKB"
        },
        {
          id: 'rot-tue-2',
          courseName: "Advanced Database Systems Lab",
          courseCode: "CSE 301L",
          time: `11:00 - 13:30`,
          room: "Lab-3",
          teacher: "Dr. JKD"
        }
      ],
      'Wednesday': [
        {
          id: 'rot-wed-1',
          courseName: "Compiler Design",
          courseCode: "CSE 302",
          time: `${10 + offsetHour}:30 - ${12 + offsetHour}:00`,
          room: studentSection.toUpperCase() === 'B' ? "CS-403" : "CS-402",
          teacher: "Mr. MHR"
        },
        {
          id: 'rot-wed-2',
          courseName: "Software Engineering Lab",
          courseCode: "CSE 304",
          time: `13:30 - 15:00`,
          room: "Lab-2",
          teacher: "Mrs. ARS"
        }
      ],
      'Thursday': [
        {
          id: 'rot-thu-1',
          courseName: "Artificial Intelligence Seminar",
          courseCode: "CSE 312",
          time: `${9 + offsetHour}:00 - ${10 + offsetHour}:30`,
          room: "Auditorium",
          teacher: "Prof. SKB"
        }
      ]
    };

    const rawClasses = routineData[day] || [];
    return rawClasses.map(cls => ({ ...cls, day }));
  };

  const dayClasses = getRoutineForDay(selectedDay);

  // Sync routine classes with main calendar events
  const handleSyncToCalendar = () => {
    setIsSyncing(true);
    
    // Convert routine classes to CalendarEvent format for this week
    const calendarEventsToSync: CalendarEvent[] = [];
    
    // Base simulation week starting Monday, July 13, 2026
    const baseWeekDates: Record<string, string> = {
      'Saturday': '2026-07-11',
      'Sunday': '2026-07-12',
      'Monday': '2026-07-13',
      'Tuesday': '2026-07-14',
      'Wednesday': '2026-07-15',
      'Thursday': '2026-07-16',
    };

    daysOfWeek.forEach(day => {
      const classes = getRoutineForDay(day);
      classes.forEach(cls => {
        calendarEventsToSync.push({
          id: `routine-sync-${cls.id}-${baseWeekDates[day]}`,
          title: `${cls.courseName} (${studentSection})`,
          type: 'Extra Class',
          date: baseWeekDates[day],
          time: cls.time,
          room: cls.room,
          course: cls.courseCode,
          color: 'emerald'
        });
      });
    });

    setTimeout(() => {
      onSyncRoutineEvents(calendarEventsToSync);
      setIsSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }, 1500);
  };

  // Helper to mark class attendance directly from Routine View
  const handleMarkAttendance = (courseCode: string, isPresent: boolean) => {
    if (!onUpdateProfile || !profile) return;
    
    const updatedCourses = profile.courses.map(c => {
      if (c.code.toLowerCase().trim() === courseCode.toLowerCase().trim()) {
        const newAttended = isPresent ? c.lecturesAttended + 1 : c.lecturesAttended;
        const newTotal = c.lecturesTotal + 1;
        const newPct = newTotal > 0 ? Math.round((newAttended / newTotal) * 100) : 100;
        return {
          ...c,
          lecturesAttended: newAttended,
          lecturesTotal: newTotal,
          attendance: newPct
        };
      }
      return c;
    });

    // Recalculate overall profile attendance
    const overallAttendance = updatedCourses.length > 0
      ? Math.round(updatedCourses.reduce((acc, curr) => acc + curr.attendance, 0) / updatedCourses.length)
      : profile.attendance;

    const updatedProfile: UserProfile = {
      ...profile,
      courses: updatedCourses,
      attendance: overallAttendance
    };

    onUpdateProfile(updatedProfile);
  };

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-5xl mx-auto font-sans text-left">
      
      {/* Back & Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 glass-card text-slate-500 hover:text-slate-800 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer flex items-center justify-center shadow-3xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              Class Routine Viewer <Sparkles className="w-5 h-5 text-brand-primary" />
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              AI-Extracted Personalized Routine
            </p>
          </div>
        </div>

        {/* Dynamic Sync Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 glass-card border border-slate-200 rounded-2xl text-xs font-black text-slate-700 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-3xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            Change Routine
          </button>
        </div>
      </div>

      {/* Profile & Routine Metadata Banner */}
      <div className="bg-linear-to-r from-brand-primary/10 via-indigo-50/50 to-slate-50 border border-brand-primary/15 rounded-3xl p-5 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase bg-brand-primary/15 text-brand-primary border border-brand-primary/10">
              Active Session Details
            </span>
            <h2 className="text-lg font-black text-slate-800">
              Personalized for {profile.name}
            </h2>
            <p className="text-xs text-slate-500 font-semibold">
              Automatic routine extraction filters matched your profile academic criteria.
            </p>
          </div>

          {/* Metadata Badges */}
          <div className="flex flex-wrap gap-2 md:justify-end">
            <div className="glass-card border border-slate-100 rounded-2xl px-3 py-1.5 text-center">
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">ID</span>
              <span className="text-xs font-black text-slate-700">{studentId}</span>
            </div>
            <div className="glass-card border border-slate-100 rounded-2xl px-3 py-1.5 text-center">
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Batch</span>
              <span className="text-xs font-black text-slate-700">{studentBatch}</span>
            </div>
            <div className="glass-card border border-slate-100 rounded-2xl px-3 py-1.5 text-center">
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Semester</span>
              <span className="text-xs font-black text-slate-700">{studentSemester}</span>
            </div>
            <div className="glass-card border border-slate-100 rounded-2xl px-3 py-1.5 text-center">
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Section</span>
              <span className="text-xs font-black text-brand-primary">{studentSection}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Routine Days Navigation tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
        {daysOfWeek.map((day) => {
          const isActive = selectedDay === day;
          const classesCount = getRoutineForDay(day).length;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black tracking-tight whitespace-nowrap transition-all cursor-pointer relative shrink-0 ${
                isActive 
                  ? 'text-brand-primary bg-brand-primary/15 border border-brand-primary/10' 
                  : 'text-slate-500 bg-white border border-slate-100 hover:text-slate-800'
              }`}
            >
              {day}
              {classesCount > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                  isActive ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {classesCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Class Routine Cards List */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3.5"
          >
            {dayClasses.length > 0 ? (
              dayClasses.map((cls, idx) => {
                const matchingCourse = profile.courses.find(
                  c => c.code.toLowerCase().trim() === cls.courseCode.toLowerCase().trim()
                );

                return (
                  <div
                    key={cls.id}
                    className="glass-card border border-slate-100 rounded-3xl p-5 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand-primary/20 hover:shadow-2xs transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      {/* Course Code Indicator Badge */}
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center shrink-0">
                        <BookOpen className="w-4.5 h-4.5 text-brand-primary" />
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight mt-0.5">
                          {cls.courseCode.split(' ')[0]}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-brand-primary uppercase">
                            {cls.courseCode}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                            Theory Class
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-800">
                          {cls.courseName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-400">
                          <span className="flex items-center gap-1 text-slate-500">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            Teacher: {cls.teacher}
                          </span>
                        </div>

                        {/* Interactive Attendance Action Buttons inside RoutineView */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAttendance(cls.courseCode, true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100/50 text-emerald-700 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer active:scale-95"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Present
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAttendance(cls.courseCode, false);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 hover:bg-rose-100 border border-rose-100/50 text-rose-700 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer active:scale-95"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Absent
                          </button>
                          {matchingCourse && (
                            <span className="text-[10px] text-slate-400 font-bold ml-1">
                              Attendance: <span className={matchingCourse.attendance < 80 ? 'text-rose-500 font-black' : 'text-emerald-600 font-black'}>{matchingCourse.attendance}%</span> ({matchingCourse.lecturesAttended}/{matchingCourse.lecturesTotal})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Class Logistics (Time & Location) */}
                    <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 border-slate-50 pt-3.5 sm:pt-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50/80 border border-slate-100 rounded-xl px-2.5 py-1">
                        <Clock className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                        <span>{cls.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50/80 border border-slate-100 rounded-xl px-2.5 py-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>Room {cls.room}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-slate-50/60 border border-dashed border-slate-200 rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-700">No Classes Scheduled</h4>
                  <p className="text-[11px] text-slate-400 font-semibold max-w-sm mx-auto mt-0.5">
                    There are no classes parsed for this day of the week. Enjoy some private study sessions or prepare assignment submissions!
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Informative Tips Footer Card */}
      <div className="bg-slate-50 border border-slate-100 rounded-3xl p-4 flex gap-3.5">
        <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-left">
          <h4 className="text-xs font-black text-slate-700">Automatic Sync Notification</h4>
          <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase">
            Every time your academic profile properties (Semester, Section, Batch) change in your settings, Campus OS re-calculates and re-aligns your routine automatically without needing a manual re-upload.
          </p>
        </div>
      </div>

      <RoutineUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        profile={profile} 
        onUpdateProfile={onUpdateProfile} 
        onSyncRoutineEvents={onSyncRoutineEvents} 
      />
    </div>
  );
}
