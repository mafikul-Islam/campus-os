import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, CalendarEvent, RoutineClass } from '../types';
import RoutineUploadModal from './RoutineUploadModal';
import { 
  Sparkles, 
  Calendar, 
  BookOpen, 
  Clock, 
  Award, 
  ShieldAlert, 
  CheckCircle, 
  GraduationCap, 
  ArrowRight, 
  Brain,
  Bell,
  ChevronRight,
  ClipboardList,
  BarChart2,
  CreditCard,
  Rocket,
  X,
  FileText,
  Copy,
  Check,
  TrendingUp,
  ClipboardCheck,
  Target,
  UploadCloud,
  FileSpreadsheet
} from 'lucide-react';

interface DashboardViewProps {
  profile: UserProfile;
  events: CalendarEvent[];
  onNavigate: (page: string) => void;
  activities: any[];
  onTrackActivity: (title: string, module: string) => void;
  onSyncRoutineEvents?: (routineEvents: CalendarEvent[]) => void;
  onUpdateProfile?: (profile: UserProfile) => void;
}

export default function DashboardView({ 
  profile, 
  events, 
  onNavigate, 
  activities, 
  onTrackActivity,
  onSyncRoutineEvents,
  onUpdateProfile
}: DashboardViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);
  const [notepadText, setNotepadText] = useState(() => {
    return localStorage.getItem('campus_notepad_draft') || '';
  });
  const [copied, setCopied] = useState(false);

  // Routine Upload & Extraction States
  const [isRoutinePopupOpen, setIsRoutinePopupOpen] = useState(false);
  const [isRoutineUploaded, setIsRoutineUploaded] = useState(() => {
    return localStorage.getItem('campus_routine_uploaded') === 'true';
  });

  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = daysMap[new Date().getDay()];
  const [selectedRoutineDay, setSelectedRoutineDay] = useState<string>(currentDayName);


  // Simulate dynamic database fetching timer on mount for perceived performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, []);

  // Check if we need to open the routine upload popup automatically on mount
  useEffect(() => {
    const shouldOpen = localStorage.getItem('campus_open_routine_upload') === 'true';
    if (shouldOpen) {
      localStorage.removeItem('campus_open_routine_upload');
      setIsRoutinePopupOpen(true);
    }
  }, []);

  // Save notepad draft to localStorage on change
  useEffect(() => {
    localStorage.setItem('campus_notepad_draft', notepadText);
  }, [notepadText]);

  // Handle Copy Notepad text
  const handleCopy = () => {
    if (!notepadText) return;
    navigator.clipboard.writeText(notepadText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to mark class attendance directly from Dashboard
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
    onTrackActivity(`Logged attendance for ${courseCode} (${isPresent ? 'Present' : 'Absent'})`, "Attendance");
  };


  // Get upcoming events
  const todayStr = "2026-07-13"; // Simulation baseline date
  
  const todayRoutineClasses = profile.routineClasses?.filter(cls => cls.day.toLowerCase() === selectedRoutineDay.toLowerCase()) || [];
  
  // Live Class Countdown Tracker & Current status calculator
  const getLiveClassStatus = () => {
    if (todayRoutineClasses.length === 0) {
      return { status: 'free', message: 'No classes scheduled today! 🎉', current: null, next: null, timeDiff: 0, progress: 0 };
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let activeClass: any = null;
    let nextClass: any = null;
    let minTimeDiff = Infinity;
    let progress = 0;

    todayRoutineClasses.forEach(cls => {
      try {
        const [startStr, endStr] = cls.time.split('-').map(s => s.trim());
        const [startHour, startMin] = startStr.split(':').map(Number);
        const [endHour, endMin] = endStr.split(':').map(Number);

        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
          activeClass = cls;
          const totalDuration = endMinutes - startMinutes;
          const elapsed = currentMinutes - startMinutes;
          progress = totalDuration > 0 ? Math.round((elapsed / totalDuration) * 100) : 0;
        } else if (startMinutes > currentMinutes) {
          const diff = startMinutes - currentMinutes;
          if (diff < minTimeDiff) {
            minTimeDiff = diff;
            nextClass = cls;
          }
        }
      } catch (err) {
        console.error("Error parsing class time for live status:", err);
      }
    });

    if (activeClass) {
      return { status: 'ongoing', message: 'Ongoing Class Active Now ⚡', current: activeClass, next: nextClass, timeDiff: 0, progress };
    } else if (nextClass) {
      return { status: 'upcoming', message: 'Upcoming Lecture Today 🚀', current: null, next: nextClass, timeDiff: minTimeDiff, progress: 0 };
    } else {
      return { status: 'completed', message: 'All classes completed for today! 🎓', current: null, next: null, timeDiff: 0, progress: 0 };
    }
  };

  const liveClassStatus = getLiveClassStatus();
  
  const upcomingExams = events.filter(e => e.type === 'Exam');
  const upcomingAssignments = events.filter(e => e.type === 'Assignment' || e.type === 'Project');

  // Derive low attendance courses for AI Insights banner
  const lowAttendanceCourses = profile.courses.filter(c => c.attendance < 80);

  // Safe datetime parser for calendar events
  const parseExamDateTime = (dateStr: string, timeStr: string) => {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    const startTime = timeStr ? timeStr.split('-')[0].trim() : "00:00";
    const [hours, minutes] = startTime.split(':').map(Number);
    return new Date(year, month - 1, day, hours || 0, minutes || 0, 0, 0);
  };

  const nowTime = new Date();
  const sortedExamEvents = events
    .filter(e => e.type === 'Exam')
    .map(e => ({
      event: e,
      targetDate: parseExamDateTime(e.date, e.time)
    }))
    .filter(item => item.targetDate.getTime() > nowTime.getTime())
    .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());

  const nextExamItem = sortedExamEvents[0];

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!nextExamItem) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = nextExamItem.targetDate.getTime() - new Date().getTime();
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    // Set initial time
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [nextExamItem?.event?.id, nextExamItem?.targetDate?.getTime()]);

  // Get dynamic time-based greeting parameters
  const getGreetingDetails = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        title: `Good morning, ${profile.name}! 🌅`,
        subtitle: "Ready to crush your goals today?",
        bgClass: "bg-linear-to-r from-amber-50 via-orange-50/50 to-pink-50/30 border-amber-100/60",
        textTitleClass: "text-slate-800",
        textSubClass: "text-slate-500"
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        title: `Good afternoon, ${profile.name}! ☀️`,
        subtitle: "Keep up the amazing momentum!",
        bgClass: "bg-linear-to-r from-sky-50 via-amber-50/40 to-sky-50/30 border-sky-100/60",
        textTitleClass: "text-slate-800",
        textSubClass: "text-slate-500"
      };
    } else if (hour >= 17 && hour < 22) {
      return {
        title: `Good evening, ${profile.name}! 🌆`,
        subtitle: "Time to review your progress and prep for tomorrow!",
        bgClass: "bg-linear-to-r from-indigo-50 via-purple-50/50 to-pink-50/30 border-indigo-100/60",
        textTitleClass: "text-slate-800",
        textSubClass: "text-slate-500"
      };
    } else {
      return {
        title: `Working late, ${profile.name}? 🌙`,
        subtitle: "Stay focused, but remember to get some rest!",
        bgClass: "bg-linear-to-r from-slate-800 via-slate-900 to-indigo-950 border-slate-700/50",
        textTitleClass: "text-white",
        textSubClass: "text-indigo-200/80"
      };
    }
  };

  const greeting = getGreetingDetails();

  // Stagger variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: [0, -5, 0],
      transition: { 
        opacity: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
        y: { duration: 5, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }
      }
    },
    hover: {
      y: -4,
      scale: 1.01,
      boxShadow: "0 10px 30px rgba(108, 99, 255, 0.15)",
      transition: { type: "spring", stiffness: 400, damping: 25 }
    },
    tap: {
      scale: 0.98
    }
  };

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
              Syncing Campus OS
            </h3>
            <p className="text-[11px] font-bold text-slate-400 font-mono tracking-tight animate-pulse">
              Retrieving academic data from Firestore...
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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-4 md:p-6 max-w-lg mx-auto font-sans bg-transparent min-h-screen pb-20"
    >
      {/* 1. Header Profile & Welcome Banner (Rose-pink elegant block) */}
      <motion.div 
        variants={cardVariants} whileHover="hover" whileTap="tap"
        className={`${greeting.bgClass} rounded-3xl p-5 flex items-center justify-between shadow-2xs border transition-all duration-300`}
      >
        <div className="space-y-1 text-left">
          <h1 className={`text-2xl font-black ${greeting.textTitleClass} tracking-tight flex items-center gap-1`}>
            {greeting.title}
          </h1>
          <p className={`text-xs font-semibold ${greeting.textSubClass}`}>
            {greeting.subtitle}
          </p>
        </div>
      </motion.div>

      {/* 2. Daily Checks Status Card */}
      <motion.div 
        variants={cardVariants} whileHover="hover" whileTap="tap"
        className="glass-card border border-slate-100 rounded-3xl p-4 shadow-3xs text-xs text-slate-600 leading-relaxed font-light text-left"
      >
        Your Operating System has completed daily checks. You have{' '}
        <strong className="font-bold text-slate-800">{todayRoutineClasses.length} lectures</strong> today,{' '}
        <strong className="font-bold text-slate-800">{upcomingAssignments.length} pending milestone</strong>, and{' '}
        <strong className="font-bold text-slate-800">{upcomingExams.length} active exam</strong> coming up.
      </motion.div>

      {/* Live Classroom Status Tracker Widget */}
      {liveClassStatus.status !== 'free' && (
        <motion.div
          variants={cardVariants} whileHover="hover" whileTap="tap"
          className={`rounded-3xl p-5 border text-left relative overflow-hidden transition-all duration-300 ${
            liveClassStatus.status === 'ongoing'
              ? 'bg-linear-to-br from-indigo-500/10 via-indigo-500/[0.02] to-slate-50 border-indigo-500/20 shadow-2xs'
              : liveClassStatus.status === 'upcoming'
              ? 'bg-linear-to-br from-purple-500/10 via-purple-500/[0.02] to-slate-50 border-purple-500/20 shadow-2xs'
              : 'bg-linear-to-br from-emerald-500/10 via-emerald-500/[0.02] to-slate-50 border-emerald-500/20 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="space-y-1 w-full">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border ${
                liveClassStatus.status === 'ongoing'
                  ? 'bg-indigo-500/15 text-indigo-600 border-indigo-500/10'
                  : liveClassStatus.status === 'upcoming'
                  ? 'bg-purple-500/15 text-purple-600 border-purple-500/10'
                  : 'bg-emerald-500/15 text-emerald-600 border-emerald-500/10'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  liveClassStatus.status === 'ongoing' ? 'bg-indigo-500 animate-ping' :
                  liveClassStatus.status === 'upcoming' ? 'bg-purple-500 animate-pulse' : 'bg-emerald-500'
                }`} />
                {liveClassStatus.message}
              </span>

              {liveClassStatus.status === 'ongoing' && liveClassStatus.current && (
                <div className="pt-2 w-full">
                  <h3 className="text-base font-black text-slate-800 leading-snug">
                    {liveClassStatus.current.courseName}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                    Code: {liveClassStatus.current.courseCode} • Room: {liveClassStatus.current.room} • {liveClassStatus.current.time}
                  </p>
                  {/* Visual Progress bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${liveClassStatus.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                    <span>Class Progress</span>
                    <span className="text-indigo-600 font-black">{liveClassStatus.progress}% Complete</span>
                  </div>
                </div>
              )}

              {liveClassStatus.status === 'upcoming' && liveClassStatus.next && (
                <div className="pt-2 w-full">
                  <h3 className="text-base font-black text-slate-800 leading-snug">
                    {liveClassStatus.next.courseName}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                    Code: {liveClassStatus.next.courseCode} • Room: {liveClassStatus.next.room} • {liveClassStatus.next.time}
                  </p>
                  {/* Real-time countdown timer */}
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-purple-500/5 border border-purple-500/10 rounded-2xl w-fit">
                    <Clock className="w-4 h-4 text-purple-600 animate-pulse" />
                    <span className="text-xs font-black text-purple-700">
                      Starts in {Math.floor(liveClassStatus.timeDiff / 60)}h {liveClassStatus.timeDiff % 60}m
                    </span>
                  </div>
                </div>
              )}

              {liveClassStatus.status === 'completed' && (
                <div className="pt-2 w-full">
                  <h3 className="text-xs font-black text-slate-700 leading-snug">
                    Great job completing all your study slots today!
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                    Enjoy your free evening and check calendar milestone metrics.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* 2b. Upcoming Exam Countdown Widget */}
      {nextExamItem && timeLeft ? (
        <motion.div
          variants={cardVariants} whileHover="hover" whileTap="tap"
          className="bg-linear-to-br from-rose-500/10 via-rose-500/[0.03] to-slate-50 border border-rose-500/20 rounded-3xl p-5 shadow-2xs text-left relative overflow-hidden"
        >
          {/* Decorative blurred background circle for premium touch */}
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 relative z-10">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase bg-rose-500/15 text-rose-600 border border-rose-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                Next Exam Countdown
              </span>
              <h3 className="text-base font-black text-slate-800 leading-snug">
                {nextExamItem.event.title}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {nextExamItem.event.course || "No Course"} • Room {nextExamItem.event.room || "N/A"}
              </p>
            </div>
            
            <div className="sm:text-right shrink-0">
              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Exam Date</span>
              <span className="text-xs font-black text-slate-700 block mt-0.5">
                {new Date(nextExamItem.targetDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <span className="text-[10px] font-bold text-rose-600 block">
                at {nextExamItem.event.time.split('-')[0].trim()}
              </span>
            </div>
          </div>

          {/* Real-time Countdown Slots */}
          <div className="grid grid-cols-4 gap-2 mt-4 relative z-10">
            {[
              { label: 'Days', value: timeLeft.days, highlight: true },
              { label: 'Hours', value: timeLeft.hours, highlight: false },
              { label: 'Mins', value: timeLeft.minutes, highlight: false },
              { label: 'Secs', value: timeLeft.seconds, highlight: false }
            ].map((unit, idx) => (
              <div 
                key={unit.label} 
                className={`rounded-2xl p-2.5 flex flex-col items-center justify-center border transition-all duration-300 ${
                  unit.highlight 
                    ? 'bg-linear-to-b from-rose-500 to-red-600 border-transparent text-white shadow-xs shadow-rose-500/20' 
                    : 'bg-white border-slate-100 text-slate-800'
                }`}
              >
                <span className={`text-xl font-black tracking-tight ${unit.highlight ? 'text-white' : 'text-slate-800 font-mono'}`}>
                  {String(unit.value).padStart(2, '0')}
                </span>
                <span className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${unit.highlight ? 'text-rose-100/90' : 'text-slate-400'}`}>
                  {unit.label}
                </span>
              </div>
            ))}
          </div>


        </motion.div>
      ) : (
        <motion.div
          variants={cardVariants} whileHover="hover" whileTap="tap"
          className="bg-linear-to-br from-emerald-500/10 via-emerald-500/[0.02] to-slate-50 border border-emerald-500/20 rounded-3xl p-5 shadow-2xs text-left relative overflow-hidden"
        >
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">All Clear! No Upcoming Exams</h3>
              <p className="text-[10px] font-semibold text-slate-400">
                Excellent work keeping up with your studies. Enjoy the breathing room!
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. Today's Schedule Card */}
      <motion.div 
        variants={cardVariants} whileHover="hover" whileTap="tap"
        onClick={() => {
          onNavigate('routine');
        }}
        className="glass-card border border-slate-100 rounded-3xl p-5 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer text-left relative overflow-hidden"
      >
        {isRoutineUploaded && (
          <div className="absolute top-0 right-12 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Green Badge with bell/notices icon */}
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-slate-800">Weekly Schedule</h3>
                {isRoutineUploaded && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Active
                  </span>
                )}
              </div>
              <span className="text-[10px] font-black tracking-wider uppercase text-slate-400">
                {selectedRoutineDay} • {todayRoutineClasses.length === 0 ? 'NO CLASSES' : `${todayRoutineClasses.length} CLASSES`}
              </span>
            </div>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsRoutinePopupOpen(true);
            }}
            className="p-1.5 rounded-xl hover:bg-slate-100 active:scale-95 transition-all text-slate-400 hover:text-slate-700 cursor-pointer"
            title="Upload/Update Class Routine"
          >
            <ChevronRight className="w-5 h-5 shrink-0" />
          </button>
        </div>

        {/* Day-of-Week Switcher Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none mt-4">
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
            const isSelected = selectedRoutineDay.toLowerCase() === day.toLowerCase();
            const hasClasses = (profile.routineClasses || []).some(cls => cls.day.toLowerCase() === day.toLowerCase());
            return (
              <button
                key={day}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRoutineDay(day);
                }}
                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-500 border-slate-100/80 hover:bg-slate-100'
                }`}
              >
                {day.substring(0, 3)}
                {hasClasses && (
                  <span className={`w-1 h-1 rounded-full ml-1 inline-block ${isSelected ? 'bg-white' : 'bg-indigo-500 animate-pulse'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Floating Class Reminders Test Alert */}
        {profile.classReminders !== false && todayRoutineClasses.length > 0 && (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              const targetClass = todayRoutineClasses[0];
              window.dispatchEvent(new CustomEvent('simulate-class-reminder', {
                detail: {
                  courseCode: targetClass.courseCode,
                  courseName: targetClass.courseName,
                  room: targetClass.room,
                  time: targetClass.time
                }
              }));
            }}
            className="mt-3 flex items-center justify-between px-3.5 py-2.5 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/30 rounded-2xl cursor-pointer active:scale-98 transition-all group"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
              <span className="text-[9px] text-indigo-700 font-black uppercase tracking-wider">
                Reminders Active • Simulated Alarm
              </span>
            </div>
            <span className="text-[8px] text-indigo-600 font-black uppercase bg-indigo-100/50 px-2 py-0.5 rounded-md group-hover:bg-indigo-100 transition-colors">
              TEST REMINDER (15M)
            </span>
          </div>
        )}

        {/* Floating details / Free Day block */}
        <div className="flex flex-col gap-2 mt-3.5 text-[10px] font-black">
          {todayRoutineClasses.length === 0 ? (
            <div className="flex items-center justify-center gap-2 text-indigo-500 bg-indigo-50/50 py-2.5 rounded-2xl uppercase tracking-widest border border-indigo-100/10">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>FREE DAY FOR {selectedRoutineDay}!</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-indigo-500 bg-indigo-50/50 py-2.5 rounded-2xl uppercase tracking-widest border border-indigo-100/10">
                <Clock className="w-3.5 h-3.5 animate-pulse text-indigo-500" />
                <span>STUDY SESSIONS ON {selectedRoutineDay}!</span>
              </div>
              <div className="space-y-2 mt-2">
                {todayRoutineClasses.map((cls, idx) => {
                  const matchingCourse = profile.courses.find(
                    c => c.code.toLowerCase().trim() === cls.courseCode.toLowerCase().trim()
                  );

                  return (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-slate-50/50 border border-slate-100/80 hover:border-indigo-100 transition-all gap-2 text-left">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black tracking-wider uppercase text-indigo-600 bg-indigo-50 border border-indigo-100/30 px-2 py-0.5 rounded-md">
                            {cls.courseCode}
                          </span>
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">
                            Room {cls.room}
                          </span>
                        </div>
                        
                        <div>
                          <span className="text-xs font-black text-slate-800 block">
                            {cls.courseName}
                          </span>
                          {matchingCourse && (
                            <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                              Attendance: <span className={matchingCourse.attendance < 80 ? 'text-rose-500 font-black' : 'text-emerald-600 font-black'}>{matchingCourse.attendance}%</span> ({matchingCourse.lecturesAttended}/{matchingCourse.lecturesTotal})
                            </span>
                          )}
                        </div>

                        {/* Interactive Attendance Action Buttons right above the room number/info area */}
                        <div className="flex items-center gap-1.5 pt-1.5">
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
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end border-t sm:border-t-0 sm:border-l border-slate-100 pt-1.5 sm:pt-0 sm:pl-3 shrink-0">
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block sm:hidden">Time</span>
                        <span className="text-[10px] font-mono font-black text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">
                          {cls.time.split('-')[0].trim()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* 4. AI & UTILITY MODULES section header */}
      <motion.div 
        variants={cardVariants} whileHover="hover" whileTap="tap"
        className="pt-2 text-left"
      >
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-100/80 pb-2">
          AI & UTILITY MODULES
        </span>
      </motion.div>

      {/* 5. 3x2 Grid (Six modular cards) */}
      <motion.div 
        variants={cardVariants} whileHover="hover" whileTap="tap"
        className="grid grid-cols-3 gap-3 md:gap-4"
      >
        {/* Module 1: NotePad */}
        <button 
          onClick={() => onNavigate('notepad')}
          className="glass-card hover:bg-slate-50 border border-slate-100 hover:border-pink-200 rounded-3xl p-4 flex flex-col items-center justify-center text-center gap-2.5 transition-all duration-200 group cursor-pointer shadow-3xs"
        >
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md shadow-pink-500/10 transition-transform group-hover:scale-105 active:scale-95">
            <ClipboardList className="w-6 h-6" />
          </div>
          <span className="text-[10px] md:text-xs font-black text-slate-700 uppercase tracking-tight">
            NotePad
          </span>
        </button>

        {/* Module 2: AI Notes */}
        <button 
          onClick={() => onNavigate('notes')}
          className="glass-card hover:bg-slate-50 border border-slate-100 hover:border-indigo-200 rounded-3xl p-4 flex flex-col items-center justify-center text-center gap-2.5 transition-all duration-200 group cursor-pointer shadow-3xs"
        >
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/10 transition-transform group-hover:scale-105 active:scale-95">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="text-[10px] md:text-xs font-black text-slate-700 uppercase tracking-tight">
            AI Notes
          </span>
        </button>

        {/* Module 3: Analytics */}
        <button 
          onClick={() => onNavigate('analytics')}
          className="glass-card hover:bg-slate-50 border border-slate-100 hover:border-blue-200 rounded-3xl p-4 flex flex-col items-center justify-center text-center gap-2.5 transition-all duration-200 group cursor-pointer shadow-3xs"
        >
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/10 transition-transform group-hover:scale-105 active:scale-95">
            <BarChart2 className="w-6 h-6" />
          </div>
          <span className="text-[10px] md:text-xs font-black text-slate-700 uppercase tracking-tight">
            Analytics
          </span>
        </button>

        {/* Module 4: Expenses */}
        <button 
          onClick={() => onNavigate('expenses')}
          className="glass-card hover:bg-slate-50 border border-slate-100 hover:border-emerald-200 rounded-3xl p-4 flex flex-col items-center justify-center text-center gap-2.5 transition-all duration-200 group cursor-pointer shadow-3xs"
        >
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/10 transition-transform group-hover:scale-105 active:scale-95">
            <CreditCard className="w-6 h-6" />
          </div>
          <span className="text-[10px] md:text-xs font-black text-slate-700 uppercase tracking-tight">
            expenses
          </span>
        </button>

        {/* Module 5: AI Tutor */}
        <button 
          onClick={() => onNavigate('coach')}
          className="glass-card hover:bg-slate-50 border border-slate-100 hover:border-amber-200 rounded-3xl p-4 flex flex-col items-center justify-center text-center gap-2.5 transition-all duration-200 group cursor-pointer shadow-3xs"
        >
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/10 transition-transform group-hover:scale-105 active:scale-95">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="text-[10px] md:text-xs font-black text-slate-700 uppercase tracking-tight">
            Ai Tutor
          </span>
        </button>

        {/* Module 6: Lecture Assistant */}
        <button 
          onClick={() => onNavigate('lecture')}
          className="glass-card hover:bg-slate-50 border border-slate-100 hover:border-rose-200 rounded-3xl p-4 flex flex-col items-center justify-center text-center gap-2.5 transition-all duration-200 group cursor-pointer shadow-3xs"
        >
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/10 transition-transform group-hover:scale-105 active:scale-95">
            <Rocket className="w-6 h-6" />
          </div>
          <span className="text-[10px] md:text-xs font-black text-slate-700 uppercase tracking-tight">
            Lecture Asst
          </span>
        </button>
      </motion.div>

      {/* 6. Active AI Insights & Warnings Banner (Yellow Warning Container) */}
      <motion.div 
        variants={cardVariants} whileHover="hover" whileTap="tap"
        className="glass-card border border-slate-100 rounded-3xl p-5 shadow-2xs space-y-4 text-left"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-50 rounded-xl text-amber-500 shrink-0 select-none">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
              Active AI Insights & Warnings
            </h3>
            <div className="text-xs text-slate-600 leading-relaxed font-light">
              {lowAttendanceCourses.length > 0 ? (
                <p>
                  Your attendance in <strong className="font-bold text-brand-primary">{lowAttendanceCourses.map(c => c.code).join(', ')}</strong> is below our safe target threshold (<strong className="text-rose-500 font-bold">&lt;80%</strong>). High priority warning compiled. AI recommends attending all remaining classes to secure the target CGPA of <strong className="text-brand-secondary font-bold">{profile.targetCgpa}</strong>.
                </p>
              ) : (
                <p>
                  Perfect! All registered classes possess attendance above the <strong className="font-semibold text-emerald-600">80%</strong> safety barrier. Your CGPA is currently on track to hit the target cumulative average of <strong className="font-semibold text-brand-primary">{profile.targetCgpa}</strong> by Semester 7.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Warning Badge Block */}
        <div className="bg-amber-50 border border-amber-100/60 text-[10px] font-black text-amber-800 tracking-wider uppercase py-2.5 rounded-xl text-center select-none">
          Diagnostic Level: High Attention
        </div>
      </motion.div>

      {/* Academic Milestones Card */}
      <motion.div 
        variants={cardVariants} whileHover="hover" whileTap="tap"
        className="glass-card border border-slate-100 rounded-3xl p-5 shadow-2xs text-left"
      >
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100/80 mb-6">
          <BarChart2 className="w-5 h-5 text-indigo-500" />
          <h3 className="text-sm font-black text-slate-800 tracking-tight">
            Academic Milestones
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Column 1: Current CGPA */}
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100/50 mx-auto">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="h-8 flex items-center justify-center mt-3">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 leading-tight">
                Current CGPA
              </span>
            </div>
            <span className="text-[11px] md:text-xs font-black text-slate-800 mt-1 block">
              {profile.cgpa.toFixed(2)} / 4.00
            </span>
            
            {/* Thermometer Bar */}
            <div className="relative w-14 h-36 bg-slate-100/70 border border-slate-150/40 rounded-xl overflow-hidden flex flex-col justify-end mt-4 mx-auto p-0.5 shadow-3xs">
              <div 
                className="bg-linear-to-t from-indigo-600 to-violet-500 w-full rounded-lg transition-all duration-500"
                style={{ height: `${(profile.cgpa / 4.0) * 100}%` }}
              />
            </div>
            
            <div className="flex justify-between w-14 mx-auto mt-1.5 text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">
              <span>0</span>
              <span>4.00</span>
            </div>
          </div>

          {/* Column 2: Target CGPA */}
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100/50 mx-auto">
              <Target className="w-5 h-5" />
            </div>
            <div className="h-8 flex items-center justify-center mt-3">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 leading-tight">
                Target CGPA
              </span>
            </div>
            <span className="text-[11px] md:text-xs font-black text-slate-800 mt-1 block">
              {profile.targetCgpa.toFixed(2)} / 4.00
            </span>
            
            {/* Thermometer Bar */}
            <div className="relative w-14 h-36 bg-slate-100/70 border border-slate-150/40 rounded-xl overflow-hidden flex flex-col justify-end mt-4 mx-auto p-0.5 shadow-3xs">
              <div 
                className="bg-linear-to-t from-teal-500 to-cyan-400 w-full rounded-lg transition-all duration-500"
                style={{ height: `${(profile.targetCgpa / 4.0) * 100}%` }}
              />
            </div>
            
            <div className="flex justify-between w-14 mx-auto mt-1.5 text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">
              <span>0</span>
              <span>4.00</span>
            </div>
          </div>

          {/* Column 3: Overall Attendance */}
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/50 mx-auto">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="h-8 flex items-center justify-center mt-3">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 leading-tight">
                Overall Attendance
              </span>
            </div>
            <span className="text-[11px] md:text-xs font-black text-slate-800 mt-1 block">
              {profile.attendance}%
            </span>
            
            {/* Thermometer Bar */}
            <div className="relative w-14 h-36 bg-slate-100/70 border border-slate-150/40 rounded-xl overflow-hidden flex flex-col justify-end mt-4 mx-auto p-0.5 shadow-3xs">
              <div 
                className="bg-linear-to-t from-emerald-500 to-green-400 w-full rounded-lg transition-all duration-500"
                style={{ height: `${profile.attendance}%` }}
              />
            </div>
            
            <div className="flex justify-between w-14 mx-auto mt-1.5 text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 7. Degree Credits Roadmap Section */}
      <motion.div 
        variants={cardVariants} whileHover="hover" whileTap="tap"
        className="glass-card border border-slate-100 rounded-3xl p-5 shadow-2xs text-left space-y-4"
      >
        <div className="flex items-center justify-between pb-1 border-b border-slate-100/80">
          <div>
            <h3 className="text-sm font-black text-slate-800 tracking-tight">
              Degree Credits Roadmap
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Visualizing progress towards graduation requirements.
            </p>
          </div>
          <div className="bg-indigo-50/75 border border-indigo-100/40 px-3.5 py-1.5 rounded-2xl text-center select-none shrink-0">
            <span className="block text-xs font-black text-indigo-700">
              {profile.creditsCompleted} / {profile.creditsTotal}
            </span>
            <span className="block text-[8px] font-extrabold uppercase tracking-wider text-indigo-500">
              Completed
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="relative w-full h-4 bg-slate-100/70 border border-slate-200 rounded-full p-0.5 shadow-3xs overflow-hidden flex items-center">
            <div 
              className="h-full rounded-full bg-linear-to-r from-blue-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${(profile.creditsCompleted / profile.creditsTotal) * 100}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-400 uppercase tracking-wider pl-1 pr-1">
            <span>Start (0 Cr)</span>
            <span>Midpoint ({profile.creditsTotal / 2} Cr)</span>
            <span>Graduation ({profile.creditsTotal} Cr)</span>
          </div>
        </div>

        {/* Three Status Sub-cards */}
        <div className="space-y-2.5 pt-1">
          {/* Card 1: Remaining Credits */}
          <div className="border border-slate-150/60 rounded-2xl p-3 flex flex-col items-center justify-center text-center glass-card shadow-3xs">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              REMAINING CREDITS
            </span>
            <span className="text-xl font-black text-slate-800 mt-1">
              {profile.creditsTotal - profile.creditsCompleted}
            </span>
          </div>

          {/* Card 2: Degree Completion */}
          <div className="border border-slate-150/60 rounded-2xl p-3 flex flex-col items-center justify-center text-center glass-card shadow-3xs">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              DEGREE COMPLETION
            </span>
            <span className="text-xl font-black text-indigo-600 mt-1">
              {((profile.creditsCompleted / profile.creditsTotal) * 100).toFixed(1)}%
            </span>
          </div>

          {/* Card 3: Semester Baseline */}
          <div className="border border-slate-150/60 rounded-2xl p-3 flex flex-col items-center justify-center text-center glass-card shadow-3xs">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              SEMESTER BASELINE
            </span>
            <span className="text-xl font-black text-emerald-600 mt-1">
              Active ({profile.courses.length} Courses)
            </span>
          </div>
        </div>
      </motion.div>

      {/* 8. Academic Course Enrollments Section */}
      <motion.div 
        variants={cardVariants} whileHover="hover" whileTap="tap"
        className="glass-card border border-slate-100 rounded-3xl p-5 shadow-2xs text-left space-y-4"
      >
        <div className="pb-1 border-b border-slate-100/80">
          <h3 className="text-sm font-black text-slate-800 tracking-tight">
            Academic Course Enrollments
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            Current active enrollment parameters for academic year 2026.
          </p>
        </div>

        <div className="space-y-3">
          {profile.courses.map(course => (
            <div key={course.id} className="border border-slate-150/60 rounded-2xl p-4 glass-card shadow-3xs space-y-3">
              {/* Top Row: Course Code & Name */}
              <div className="flex items-center gap-3">
                <span className="bg-indigo-50 border border-indigo-100/40 text-indigo-600 font-mono text-[10px] font-black rounded-lg px-2.5 py-1 shrink-0">
                  {course.code}
                </span>
                <span className="text-xs font-black text-slate-800 truncate">
                  {course.name}
                </span>
              </div>

              {/* Middle Row: Attendance & Grade */}
              <div className="flex items-center justify-between bg-slate-50/50 px-3 py-2.5 rounded-xl border border-slate-100/50">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                    Attendance
                  </span>
                  <span className={`text-[11px] font-bold ${course.attendance < 80 ? 'text-rose-500' : 'text-emerald-600'}`}>
                    {course.attendance}% ({course.lecturesAttended}/{course.lecturesTotal})
                  </span>
                </div>
                <div className="glass-card border border-slate-150 rounded-lg px-2.5 py-1 select-none">
                  <span className="text-[10px] font-black text-slate-700">
                    Grade: {course.grade}
                  </span>
                </div>
              </div>

              {/* Bottom Row: Syllabus Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-wider">
                  <span>Course Syllabus Progress</span>
                  <span>{course.progress}% Completed</span>
                </div>
                <div className="relative h-3.5 w-full bg-slate-100/70 border border-slate-200 rounded-full p-0.5 shadow-3xs overflow-hidden flex items-center">
                  <div 
                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 8. Recent Activity Card */}
      <motion.div 
        variants={cardVariants} whileHover="hover" whileTap="tap"
        className="glass-card border border-slate-100 rounded-3xl p-5 shadow-2xs text-left space-y-4"
      >
        {/* Header - Title and Left Show All Link */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-100/80">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Recent Activity
            </span>
          </div>
          <button 
            onClick={() => onNavigate('activities')}
            className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-600 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Show All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Real Activities */}
        {activities.length === 0 ? (
          <div className="py-4 text-center text-slate-400 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider">No activities logged yet</p>
            <p className="text-[9px] font-light">Your actions will be tracked here in real-time!</p>
          </div>
        ) : (
          <div className="space-y-3 divide-y divide-slate-50">
            {activities.slice(0, 3).map((act, idx) => {
              // Custom badge configuration
              const getModuleIcon = (mod: string) => {
                switch (mod.toLowerCase()) {
                  case 'notepad': return { bg: 'bg-pink-50 text-pink-500', icon: ClipboardList };
                  case 'ai notes': return { bg: 'bg-indigo-50 text-indigo-500', icon: BookOpen };
                  case 'analytics': return { bg: 'bg-blue-50 text-blue-500', icon: BarChart2 };
                  case 'expenses': return { bg: 'bg-emerald-50 text-emerald-500', icon: CreditCard };
                  case 'ai tutor': return { bg: 'bg-amber-50 text-amber-500', icon: GraduationCap };
                  case 'lecture assistant': return { bg: 'bg-rose-50 text-rose-500', icon: Rocket };
                  case 'calendar': return { bg: 'bg-purple-50 text-purple-500', icon: Calendar };
                  default: return { bg: 'bg-slate-50 text-slate-500', icon: Bell };
                }
              };
              const cfg = getModuleIcon(act.module);
              const Icon = cfg.icon;

              return (
                <div key={act.id} className={`flex items-start justify-between gap-3 ${idx > 0 ? 'pt-3' : ''}`}>
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className={`w-7.5 h-7.5 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-bold text-slate-700 truncate">{act.title}</p>
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">{act.module}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold font-mono text-indigo-500 shrink-0 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {act.formattedTime}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* NotePad Quick Draft Modal Overlay */}
      <AnimatePresence>
        {isNotepadOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotepadOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full sm:max-w-md glass-card rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[85vh] z-10"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-linear-to-r from-pink-50/50 to-white">
                <div className="flex items-center gap-2 text-pink-600">
                  <ClipboardList className="w-5 h-5" />
                  <span className="text-sm font-black uppercase tracking-wider">NotePad Scratchpad</span>
                </div>
                <button 
                  onClick={() => setIsNotepadOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Editor */}
              <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">
                  Write down your quick thoughts here. Saved automatically in local workspace.
                </p>
                <textarea
                  value={notepadText}
                  onChange={(e) => setNotepadText(e.target.value)}
                  placeholder="Type a quick note, lecture keypoint or link..."
                  className="w-full flex-1 min-h-[160px] p-3 border border-slate-100 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 placeholder:text-slate-300 resize-none bg-slate-50/30 text-slate-700"
                />
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-2.5">
                <button
                  onClick={handleCopy}
                  disabled={!notepadText}
                  className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:border-slate-300 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer glass-card text-slate-600 disabled:opacity-50"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (confirm('Clear entire scratchpad note?')) {
                        setNotepadText('');
                      }
                    }}
                    disabled={!notepadText}
                    className="px-3.5 py-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => {
                      setIsNotepadOpen(false);
                      onTrackActivity("Updated NotePad draft scratchpad", "NotePad");
                    }}
                    className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    Save & Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      <RoutineUploadModal 
        isOpen={isRoutinePopupOpen} 
        onClose={() => setIsRoutinePopupOpen(false)} 
        profile={profile} 
        onUpdateProfile={onUpdateProfile} 
        onSyncRoutineEvents={onSyncRoutineEvents} 
      />
    </motion.div>
  );
}