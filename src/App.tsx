import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, CalendarEvent, Expense, NoteDocument } from './types';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { subscribeUserProfile, updateUserProfile } from './services/userService';

// Importing Views
import LandingView from './components/LandingView';
import DashboardView from './components/DashboardView';
import CalendarView from './components/CalendarView';
import NotesView from './components/NotesView';
import ChatsView from './components/ChatsView';
import DocumentsView from './components/DocumentsView';
import AnalyticsView from './components/AnalyticsView';
import ExpensesView from './components/ExpensesView';
import CoachView from './components/CoachView';
import LectureAssistantView from './components/LectureAssistantView';
import SettingsView from './components/SettingsView';
import SplashScreen from './components/SplashScreen';
import ProfileView from './components/ProfileView';
import AboutDevelopersView from './components/AboutDevelopersView';
import CampusLogo from './components/CampusLogo';
import AuthView from './components/AuthView';
import RecentActivitiesView from './components/RecentActivitiesView';
import NotepadView from './components/NotepadView';
import RoutineView from './components/RoutineView';
import AIAssistantBot from './components/AIAssistantBot';

// Icons
import { LayoutDashboard, Calendar as CalendarIcon, BookOpen, FolderOpen, BarChart2, CreditCard, Brain, Rocket, Settings, Menu, X, Cpu, LogOut, ArrowLeft, User, Users, MessageSquare, AlertTriangle } from 'lucide-react';

// Default mock initial state to load app dynamically
const defaultProfile: UserProfile = {
  name: "Abir Mahmud Pritam",
  university: "Varendra University",
  major: "Computer Science & Engineering",
  cgpa: 3.65,
  targetCgpa: 3.85,
  creditsCompleted: 82,
  creditsTotal: 120,
  attendance: 84,
  studentId: "231311070",
  batch: "32nd Batch",
  section: "B",
  semester: "8th Semester",
  avatarUrl: "/images/dev1.jpeg",
  universityLogoUrl: "/images/vu.png",
  departmentLogoUrl: "/images/cse.vu.jpeg",
  classReminders: true,
  deadlineReminders: true,
  courses: [
    { id: 'c1', name: "Advanced Database Systems", code: "CSE 301", attendance: 80, grade: "A", progress: 65, lecturesTotal: 24, lecturesAttended: 19 },
    { id: 'c2', name: "Compiler Design", code: "CSE 302", attendance: 88, grade: "A-", progress: 70, lecturesTotal: 24, lecturesAttended: 21 },
    { id: 'c3', name: "Software Engineering Lab", code: "CSE 304", attendance: 92, grade: "A", progress: 85, lecturesTotal: 12, lecturesAttended: 11 },
    { id: 'c4', name: "Artificial Intelligence", code: "CSE 312", attendance: 76, grade: "B+", progress: 50, lecturesTotal: 24, lecturesAttended: 18 }
  ]
};

const defaultEvents: CalendarEvent[] = [
  { id: 'e1', title: "Advanced Database Systems", type: "Extra Class", date: "2026-07-13", time: "09:30 - 11:00", room: "CS-402", course: "CSE 301", color: "blue" },
  { id: 'e2', title: "Software Engineering Lab", type: "Extra Class", date: "2026-07-13", time: "13:00 - 15:30", room: "Lab-2", course: "CSE 304", color: "indigo" },
  { id: 'e3', title: "Compiler Design Recitation", type: "Extra Class", date: "2026-07-14", time: "10:00 - 11:30", room: "Auditorium", course: "CSE 302", color: "indigo" },
  { id: 'e4', title: "Artificial Intelligence Seminar", type: "Extra Class", date: "2026-07-14", time: "11:30 - 13:00", room: "CS-402", course: "CSE 312", color: "purple" },
  { id: 'e5', title: "Database Normalization Exam", type: "Exam", date: "2026-07-15", time: "10:00 - 12:00", room: "Exam Hall A", course: "CSE 301", color: "red" },
  { id: 'e6', title: "Compiler Lab 1 Submission", type: "Assignment", date: "2026-07-16", time: "23:59", course: "CSE 302", color: "amber" }
];

const defaultExpenses: Expense[] = [
  { id: 'ex1', amount: 4.85, category: "Others", description: "Starbucks Iced Latte", date: "2026-07-09" },
  { id: 'ex2', amount: 12.50, category: "Food", description: "Subway footlong lunch", date: "2026-07-10" },
  { id: 'ex3', amount: 2.50, category: "Transport", description: "Metro rail card recharge", date: "2026-07-11" },
  { id: 'ex4', amount: 85.00, category: "Education", description: "Database Systems Textbook", date: "2026-07-12" }
];

const defaultNotes: NoteDocument[] = [
  {
    id: 'n1',
    name: "Database Normalization Principles.txt",
    content: `Database Normalization is the process of structuring a relational database in accordance with a series of normal forms in order to reduce data redundancy and improve data integrity. First Normal Form (1NF) requires that all values in a table are atomic and that there are no repeating groups. Second Normal Form (2NF) requires that the table is in 1NF and all non-prime attributes are fully functionally dependent on the primary key. Third Normal Form (3NF) requires 2NF and that no non-prime attribute is transitively dependent on any candidate key. Boyce-Codd Normal Form (BCNF) is a stronger version where every determinant must be a candidate key.`,
    type: 'note',
    date: "2026-07-12",
    size: "0.6 KB"
  }
];

export default function App() {
  // Navigation states
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activePage, setActivePage] = useState<string>(() => {
    const savedPage = localStorage.getItem('campus_active_page');
    const loggedIn = localStorage.getItem('campus_is_logged_in') === 'true';
    if (loggedIn) {
      return savedPage && savedPage !== 'landing' && savedPage !== 'auth' ? savedPage : 'dashboard';
    }
    return 'landing';
  });
  const [navHistory, setNavHistory] = useState<string[]>(() => {
    const savedPage = localStorage.getItem('campus_active_page');
    const loggedIn = localStorage.getItem('campus_is_logged_in') === 'true';
    if (loggedIn) {
      const initialPage = savedPage && savedPage !== 'landing' && savedPage !== 'auth' ? savedPage : 'dashboard';
      return [initialPage];
    }
    return ['landing'];
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [classNotification, setClassNotification] = useState<{ courseCode: string, courseName: string, room: string, time: string } | null>(null);

  // Core profile/data persistent states
  const [profile, setProfile] = useState<UserProfile>(() => {
    const savedProfile = localStorage.getItem('campus_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed && parsed.name === "Ahnaf Shakil") {
          return defaultProfile;
        }
        return parsed;
      } catch (e) {
        console.error("Error parsing campus_profile from localStorage", e);
      }
    }
    return defaultProfile;
  });
  const [events, setEvents] = useState<CalendarEvent[]>(defaultEvents);
  const [expenses, setExpenses] = useState<Expense[]>(defaultExpenses);
  const [notes, setNotes] = useState<NoteDocument[]>(defaultNotes);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);

  // Background interval checking for regular classes starting in 15 mins
  useEffect(() => {
    // Keep track of which class IDs we have already sent notifications for today to prevent duplicates
    const notifiedClassIds = new Set<string>();

    const checkUpcomingClasses = () => {
      // If notifications are turned off in settings, do absolutely nothing
      if (profile.classReminders === false) {
        return;
      }

      const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const todayDayName = daysMap[new Date().getDay()];
      const todayClasses = profile.routineClasses?.filter(cls => cls.day.toLowerCase() === todayDayName.toLowerCase()) || [];

      if (todayClasses.length === 0) return;

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      todayClasses.forEach(cls => {
        try {
          const startStr = cls.time.split('-')[0].trim(); // E.g. "09:30" or "13:30"
          const [hourStr, minStr] = startStr.split(':');
          const classStartMinutes = parseInt(hourStr) * 60 + parseInt(minStr);

          const diff = classStartMinutes - currentMinutes;

          // If class starts in exactly 15 minutes
          if (diff >= 14 && diff <= 15) {
            const cacheKey = `${cls.id}-${now.toDateString()}`;
            if (!notifiedClassIds.has(cacheKey)) {
              notifiedClassIds.add(cacheKey);
              setClassNotification({
                courseCode: cls.courseCode,
                courseName: cls.courseName,
                room: cls.room,
                time: cls.time
              });
              // Speak the alert using text-to-speech voice
              try {
                const synth = window.speechSynthesis;
                if (synth) {
                  const utterance = new SpeechSynthesisUtterance(`Reminder: Your class ${cls.courseCode} starts in 15 minutes in Room ${cls.room}`);
                  utterance.rate = 1.0;
                  synth.speak(utterance);
                }
              } catch (e) {
                console.log("Audio speech synthesis failed:", e);
              }
            }
          }
        } catch (err) {
          console.error("Error parsing class reminder time:", err);
        }
      });
    };

    // Run every 20 seconds
    const interval = setInterval(checkUpcomingClasses, 20000);
    checkUpcomingClasses();

    // Listen for custom simulation triggers
    const handleSimulate = (e: Event) => {
      if (profile.classReminders === false) {
        alert("Class notifications are disabled in your Profile settings! Please toggle 'Class Reminders' ON first.");
        return;
      }
      
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setClassNotification({
          courseCode: detail.courseCode || "CSE 302",
          courseName: detail.courseName || "Compiler Design",
          room: detail.room || "CS-402",
          time: detail.time || "09:30 - 11:00"
        });

        // Trigger gorgeous voice synthesizer readout
        try {
          const synth = window.speechSynthesis;
          if (synth) {
            const utterance = new SpeechSynthesisUtterance(`Reminder: Your class ${detail.courseCode} starts in 15 minutes in Room ${detail.room}`);
            utterance.rate = 1.0;
            synth.speak(utterance);
          }
        } catch (e) {}
      }
    };

    window.addEventListener('simulate-class-reminder', handleSimulate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('simulate-class-reminder', handleSimulate);
    };
  }, [profile.routineClasses, profile.classReminders]);

  // Activities tracking state with 1-week auto cleanup
  const [activities, setActivities] = useState<any[]>(() => {
    const saved = localStorage.getItem('campus_activities');
    let items = [];
    const defaultActivities = [
      {
        id: 'act-1',
        title: 'Accessed Software Engineering Lab notes',
        module: 'AI Notes',
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        formattedTime: '02:45 PM',
        formattedDate: 'Monday, July 13, 2026'
      },
      {
        id: 'act-2',
        title: 'Logged Starbucks Latte expense ($4.85)',
        module: 'Expenses',
        timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        formattedTime: '12:30 PM',
        formattedDate: 'Monday, July 13, 2026'
      },
      {
        id: 'act-3',
        title: 'Drafted CSE 302 Assignment milestones',
        module: 'NotePad',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        formattedTime: '04:15 PM',
        formattedDate: 'Sunday, July 12, 2026'
      },
      {
        id: 'act-4',
        title: 'Reviewed Advanced Database lecture slides',
        module: 'Lecture Assistant',
        timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        formattedTime: '11:00 AM',
        formattedDate: 'Saturday, July 11, 2026'
      }
    ];

    if (saved) {
      try {
        items = JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing campus_activities from localStorage", e);
        items = defaultActivities;
      }
    } else {
      items = defaultActivities;
    }

    // Filter out activities older than 1 week (7 days)
    const oneWeekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    return items.filter((item: any) => new Date(item.timestamp).getTime() > oneWeekAgo);
  });

  const handleClearActivities = () => {
    setActivities([]);
    localStorage.setItem('campus_activities', JSON.stringify([]));
  };

  const trackActivity = (title: string, module: string) => {
    const now = new Date();
    
    // Get hours, minutes, AM/PM
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    const formattedTime = `${hours}:${minutesStr} ${ampm}`;

    // Get formatted date
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('en-US', options);

    const newActivity = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      module,
      timestamp: now.toISOString(),
      formattedTime,
      formattedDate
    };

    setActivities(prev => {
      const oneWeekAgo = Date.now() - 7 * 24 * 3600 * 1000;
      const filtered = prev.filter((item: any) => new Date(item.timestamp).getTime() > oneWeekAgo);
      const updated = [newActivity, ...filtered].slice(0, 20);
      localStorage.setItem('campus_activities', JSON.stringify(updated));
      return updated;
    });
  };

  // Scroll to top on page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    
    const viewport = document.getElementById('main-scroll-viewport');
    if (viewport) {
      viewport.scrollTop = 0;
    }
  }, [activePage]);

  // Sync non-profile state with localStorage & handle core route initialization
  useEffect(() => {
    const savedEvents = localStorage.getItem('campus_events');
    const savedExpenses = localStorage.getItem('campus_expenses');
    const savedNotes = localStorage.getItem('campus_notes');
    const savedPage = localStorage.getItem('campus_active_page');
    const loggedIn = localStorage.getItem('campus_is_logged_in') === 'true';

    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (e) {
        console.error("Error parsing campus_events from localStorage", e);
      }
    }
    if (savedExpenses) {
      try {
        setExpenses(JSON.parse(savedExpenses));
      } catch (e) {
        console.error("Error parsing campus_expenses from localStorage", e);
      }
    }
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error("Error parsing campus_notes from localStorage", e);
      }
    }
    
    if (loggedIn) {
      const page = savedPage && savedPage !== 'landing' && savedPage !== 'auth' ? savedPage : 'dashboard';
      setActivePage(page);
      setNavHistory([page]);
    } else {
      setActivePage('landing');
      setNavHistory(['landing']);
    }
  }, []);

  // Listen to Auth State and subscribe to student Profile in Firestore
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        // User is logged in, subscribe to Firestore profile doc
        unsubscribeProfile = subscribeUserProfile(
          firebaseUser.uid,
          (dbProfile) => {
            if (dbProfile) {
              setProfile(dbProfile);
              localStorage.setItem('campus_profile', JSON.stringify(dbProfile));
              localStorage.setItem('campus_is_logged_in', 'true');
            } else {
              // Document doesn't exist in Firestore, initialize it
              const pendingProfileStr = localStorage.getItem('campus_pending_profile');
              let baseProfile = defaultProfile;
              if (pendingProfileStr) {
                try {
                  baseProfile = JSON.parse(pendingProfileStr);
                } catch (e) {
                  console.error("Error parsing campus_pending_profile", e);
                }
              }
              localStorage.removeItem('campus_pending_profile');

              const initialProfile: UserProfile = {
                ...baseProfile,
                name: firebaseUser.displayName || baseProfile.name || "Student",
                avatarUrl: firebaseUser.photoURL || baseProfile.avatarUrl || baseProfile.avatarUrl,
              };

              updateUserProfile(firebaseUser.uid, initialProfile)
                .then(() => {
                  setProfile(initialProfile);
                  localStorage.setItem('campus_profile', JSON.stringify(initialProfile));
                  localStorage.setItem('campus_is_logged_in', 'true');
                })
                .catch((err) => {
                  console.error('Failed to initialize user profile in Firestore:', err);
                });
            }
            setLoadingProfile(false);
          },
          (err) => {
            console.error('Error listening to user profile:', err);
            setLoadingProfile(false);
          }
        );
      } else {
        // User is signed out or bypassed Firebase Auth
        const loggedIn = localStorage.getItem('campus_is_logged_in') === 'true';
        if (loggedIn) {
          const savedProfile = localStorage.getItem('campus_profile');
          if (savedProfile) {
            try {
              const parsed = JSON.parse(savedProfile);
              if (parsed && parsed.name !== "Ahnaf Shakil") {
                setProfile(parsed);
              } else {
                setProfile(defaultProfile);
              }
            } catch (e) {
              setProfile(defaultProfile);
            }
          } else {
            setProfile(defaultProfile);
          }
        } else {
          setProfile(defaultProfile);
        }
        setLoadingProfile(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);



  const saveState = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const handleUpdateProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveState('campus_profile', newProfile);
    trackActivity("Updated academic profile", "Profile");
    
    if (auth.currentUser) {
      try {
        await updateUserProfile(auth.currentUser.uid, newProfile);
      } catch (err) {
        console.error('Failed to update profile in Firestore:', err);
      }
    }
  };

  const handleAddEvent = (event: CalendarEvent) => {
    const updated = [...events, event];
    setEvents(updated);
    saveState('campus_events', updated);
    trackActivity(`Added class: ${event.title}`, "Calendar");
  };

  const handleBulkAddEvents = (newEvents: CalendarEvent[]) => {
    const updated = [...events, ...newEvents];
    setEvents(updated);
    saveState('campus_events', updated);
    trackActivity(`Bulk imported ${newEvents.length} calendar classes`, "Calendar");
  };

  const handleSyncRoutineEvents = (newEvents: CalendarEvent[]) => {
    // Filter out previous synced routine events to prevent duplication
    const cleanEvents = events.filter(e => !e.id.startsWith('routine-sync-'));
    const updated = [...cleanEvents, ...newEvents];
    setEvents(updated);
    saveState('campus_events', updated);
    trackActivity(`Synchronized ${newEvents.length} routine classes to calendar`, "Calendar");
  };

  const handleAddExpense = (expense: Expense) => {
    const updated = [expense, ...expenses];
    setExpenses(updated);
    saveState('campus_expenses', updated);
    trackActivity(`Logged expense: ${expense.description} ($${expense.amount.toFixed(2)})`, "Expenses");
  };

  const handleAddNote = (note: NoteDocument) => {
    const updated = [note, ...notes];
    setNotes(updated);
    saveState('campus_notes', updated);
    trackActivity(`Created new study note: ${note.name}`, "AI Notes");
  };

  const handleUpdateNoteResult = (id: string, resultType: string, data: any) => {
    const updated = notes.map(note => {
      if (note.id === id) {
        const actionsResult = note.actionsResult || {};
        const updatedResult = { ...actionsResult, [resultType]: data };
        return { ...note, actionsResult: updatedResult };
      }
      return note;
    });
    setNotes(updated);
    saveState('campus_notes', updated);

    // Track activity
    const noteObj = notes.find(n => n.id === id);
    if (noteObj) {
      const label = resultType === 'summary' ? 'Summary' : resultType === 'explain' ? 'Explanation' : resultType === 'flashcards' ? 'Flashcards' : 'MCQs/Quiz';
      trackActivity(`Generated ${label} for ${noteObj.name}`, "AI Notes");
    }
  };

  const navigateTo = (page: string, replace = false) => {
    if (page === activePage) return;
    setActivePage(page);
    localStorage.setItem('campus_active_page', page);
    setIsMobileMenuOpen(false);
    if (replace) {
      setNavHistory(prev => [...prev.slice(0, -1), page]);
    } else {
      setNavHistory(prev => [...prev, page]);
    }
  };

  const handleBack = () => {
    if (navHistory.length > 1) {
      const newHistory = [...navHistory];
      newHistory.pop(); // remove current page
      const previous = newHistory[newHistory.length - 1];
      setNavHistory(newHistory);
      setActivePage(previous);
      localStorage.setItem('campus_active_page', previous);
    } else {
      navigateTo('dashboard');
    }
  };

  const handleSignOut = () => {
    setIsSignOutModalOpen(true);
  };

  const executeSignOut = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      console.error('Error signing out of Firebase:', err);
    }
    localStorage.removeItem('campus_is_logged_in');
    setIsSignOutModalOpen(false);
    navigateTo('landing');
  };

  // Sidebar Menu Items definition
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Event Calendar', icon: CalendarIcon },
    { id: 'chats', label: 'Chats', icon: MessageSquare },
    { id: 'notes', label: 'AI Notes', icon: BookOpen },
    { id: 'documents', label: 'AI Slide Manager', icon: FolderOpen },
    { id: 'analytics', label: 'Analytics Panel', icon: BarChart2 },
    { id: 'expenses', label: 'Expense Tracker', icon: CreditCard },
    { id: 'coach', label: 'AI Tutor', icon: Brain },
    { id: 'lecture', label: 'Lecture Assistant', icon: Rocket },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about_developers', label: 'About Developers', icon: Users }
  ];

  if (showSplash || loadingProfile) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (activePage === 'landing') {
    return <LandingView onGetStarted={() => navigateTo('auth')} />;
  }

  if (activePage === 'auth') {
    return (
      <AuthView
        onSuccess={(profileDetails) => {
          localStorage.setItem('campus_is_logged_in', 'true');
          if (profileDetails) {
            const updatedProfile = {
              ...profile,
              name: profileDetails.name,
              university: profileDetails.university,
              batch: profileDetails.batch,
              studentId: profileDetails.studentId,
              section: profileDetails.section,
              semester: profileDetails.semester,
              major: profileDetails.major,
            };
            setProfile(updatedProfile);
            saveState('campus_profile', updatedProfile);
            localStorage.setItem('campus_pending_profile', JSON.stringify(updatedProfile));
          }
          navigateTo('dashboard');
        }}
        onBack={() => navigateTo('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col lg:flex-row font-sans antialiased text-slate-800 pb-20 lg:pb-0">
      
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 glass-card border-r border-slate-200/80 shrink-0 sticky top-0 h-screen z-20">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-2.5">
          <CampusLogo className="w-8 h-8" animate={true} />
          <div>
            <span className="font-extrabold text-sm tracking-tight text-slate-800">Campus OS</span>
          </div>
        </div>

        {/* User Mini Profile */}
        <div className="p-4 mx-4 my-4 bg-slate-50 border border-slate-150 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/15 flex items-center justify-center text-brand-primary font-bold text-sm">
            {profile.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-800 truncate">{profile.name}</h4>
            <p className="text-[10px] text-slate-400 font-medium truncate">{profile.major}</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activePage === item.id;

            return (
              <motion.button
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                  isActive 
                    ? 'text-brand-primary' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktopActiveTabBg"
                    className="absolute inset-0 bg-brand-primary/10 rounded-xl border-l-4 border-l-brand-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <IconComponent className={`w-4.5 h-4.5 relative z-10 transition-colors ${isActive ? 'text-brand-primary' : 'text-slate-400 group-hover:text-brand-primary'}`} />
                <span className="relative z-10">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* Exit link */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. PWA MOBILE/TABLET HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass-card border-b border-slate-200/60 flex items-center justify-between px-4 z-30 select-none">
        <div className="flex items-center gap-2">
          <CampusLogo className="w-7 h-7" animate={true} />
          <span className="font-extrabold text-sm tracking-tight text-slate-800">Campus OS</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Notification Indicator */}
          <div className="relative p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>

          {activePage === 'dashboard' && (
            <button
              onClick={() => navigateTo('profile')}
              className="w-9 h-9 rounded-full border border-slate-200 shadow-xs overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer transition-all active:scale-90 hover:opacity-90 shrink-0"
            >
              <img 
                src={profile.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=300&h=300&q=80'} 
                alt={profile.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          )}
        </div>
      </div>

      {/* PWA MOBILE AUXILIARY SLIDE DRAWER (For extra features: Analytics, Expenses, Settings, etc.) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
            />

            {/* Slide Box container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-72 max-w-[85vw] glass-card h-full shadow-2xl border-l border-slate-200/80 flex flex-col justify-between"
            >
              <div className="p-5 pt-8 space-y-6 overflow-y-auto h-full flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <CampusLogo className="w-6.5 h-6.5" animate={false} />
                    <span className="font-extrabold text-sm text-slate-800">Campus OS Suite</span>
                  </div>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* User Mini Profile */}
                <div className="p-3.5 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center font-bold text-xs">
                    {profile.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-extrabold text-slate-800 truncate">{profile.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold truncate uppercase tracking-wider">{profile.major}</p>
                  </div>
                </div>

                {/* Main List of all services (especially auxiliary ones) */}
                <div className="flex-1 space-y-5">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1 font-mono">AI & Utility Modules</span>
                    <nav className="space-y-1">
                      {[
                        menuItems.find(i => i.id === 'notes'),
                        ...menuItems.filter(i => !['dashboard', 'calendar', 'notes', 'documents', 'profile', 'chats'].includes(i.id))
                      ].filter((item): item is NonNullable<typeof item> => !!item).map((item) => {
                        const IconComponent = item.icon;
                        const isActive = activePage === item.id;

                        return (
                          <motion.button
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            key={item.id}
                            onClick={() => navigateTo(item.id)}
                            className={`group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                              isActive 
                                ? 'bg-brand-primary/10 text-brand-primary font-extrabold' 
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                          >
                            <IconComponent className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-brand-primary' : 'text-slate-400 group-hover:text-brand-primary'}`} />
                            <span>{item.label}</span>
                          </motion.button>
                        );
                      })}
                    </nav>
                  </div>
                </div>

                {/* Sign Out Action */}
                <div className="pt-4 border-t border-slate-100 shrink-0">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. MAIN CONTENT WORKSPACE AREA */}
      <main className="flex-1 min-w-0 flex flex-col pt-16 lg:pt-0">
        

        <div className="flex-1 relative overflow-y-auto" id="main-scroll-viewport">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, x: 25, filter: 'blur(8px)', scale: 0.98 }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)', scale: 1 }}
              exit={{ opacity: 0, x: -25, filter: 'blur(8px)', scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="min-h-full"
            >
              {activePage === 'dashboard' && (
                <DashboardView 
                  profile={profile} 
                  events={events} 
                  onNavigate={navigateTo} 
                  activities={activities}
                  onTrackActivity={trackActivity}
                  onSyncRoutineEvents={handleSyncRoutineEvents}
                  onUpdateProfile={handleUpdateProfile}
                />
              )}
              {activePage === 'routine' && (
                <RoutineView 
                  profile={profile}
                  events={events}
                  onBack={handleBack}
                  onSyncRoutineEvents={handleSyncRoutineEvents}
                  onUploadRoutineTrigger={() => {}}
                  onUpdateProfile={handleUpdateProfile}
                />
              )}
              {activePage === 'activities' && (
                <RecentActivitiesView 
                  activities={activities} 
                  onBack={handleBack} 
                  onClearActivities={handleClearActivities} 
                />
              )}
              {activePage === 'calendar' && (
                <CalendarView events={events} onAddEvent={handleAddEvent} onBulkAddEvents={handleBulkAddEvents} onBack={handleBack} />
              )}
              {activePage === 'chats' && (
                <ChatsView profile={profile} onBack={handleBack} />
              )}
              {activePage === 'notes' && (
                <NotesView notes={notes} onAddNote={handleAddNote} onUpdateNoteResult={handleUpdateNoteResult} onBack={handleBack} />
              )}
              {activePage === 'notepad' && (
                <NotepadView onBack={handleBack} />
              )}
              {activePage === 'documents' && (
                <DocumentsView 
                  onBack={handleBack} 
                  profile={profile} 
                  onUpdateProfile={handleUpdateProfile} 
                />
              )}
              {activePage === 'analytics' && (
                <AnalyticsView profile={profile} onBack={handleBack} />
              )}
              {activePage === 'expenses' && (
                <ExpensesView expenses={expenses} onAddExpense={handleAddExpense} onBack={handleBack} />
              )}
              {activePage === 'coach' && (
                <CoachView profile={profile} onTrackActivity={trackActivity} onBack={handleBack} />
              )}
              {activePage === 'lecture' && (
                <LectureAssistantView onTrackActivity={trackActivity} onBack={handleBack} />
              )}
              {activePage === 'profile' && (
                <ProfileView 
                  profile={profile} 
                  onUpdateProfile={handleUpdateProfile} 
                  onSignOut={handleSignOut}
                  onNavigate={navigateTo}
                  onBack={handleBack}
                />
              )}
              {activePage === 'settings' && (
                <SettingsView profile={profile} onUpdateProfile={handleUpdateProfile} onBack={handleBack} />
              )}
              {activePage === 'about_developers' && (
                <AboutDevelopersView onBack={handleBack} />
              )}
            </motion.div>
          </AnimatePresence>

        </div>
      </main>

      {/* 4. PREMIUM PWA MOBILE FLOATING BOTTOM NAVIGATION */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-20 glass-card border-t border-slate-100 shadow-[0_-10px_35px_rgba(108,99,255,0.06)] flex items-center justify-around px-4 z-40 pb-safe">
        {[
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
          { id: 'chats', label: 'Chat', icon: MessageSquare },
          { id: 'documents', label: 'Docs', icon: FolderOpen },
          { id: 'profile', label: 'Profile', icon: User }
        ].map((item) => {
          const IconComponent = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className="group relative py-2 px-3.5 flex flex-col items-center gap-1 cursor-pointer select-none grow min-h-[48px] justify-center"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileBottomIndicator"
                  className="absolute inset-x-2 inset-y-1 bg-brand-primary/10 rounded-2xl"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              
              <IconComponent 
                className={`w-5 h-5 relative z-10 transition-all duration-200 ${
                  isActive 
                    ? 'text-brand-primary scale-110' 
                    : 'text-slate-400 group-hover:text-brand-primary'
                }`} 
              />
              <span className={`text-[9px] font-extrabold relative z-10 tracking-tight transition-all duration-200 ${
                isActive 
                  ? 'text-brand-primary font-black scale-105' 
                  : 'text-slate-500 group-hover:text-slate-800'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* CUSTOM SIGN OUT CONFIRMATION POP UP MODAL SCREEN */}
      <AnimatePresence>
        {isSignOutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSignOutModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-sm glass-card rounded-[2rem] p-6 text-center shadow-2xl border border-slate-100 z-10"
            >
              <div className="mx-auto w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-4 border border-rose-100">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Confirm Sign Out
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                Are you sure you want to sign out of Campus OS? Your unsaved local session data might be cleared.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                   onClick={() => setIsSignOutModalOpen(false)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={executeSignOut}
                  className="px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 15-MINUTE CLASS PUSH NOTIFICATION ALERT */}
        {classNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -30, scale: 0.95, filter: 'blur(5px)' }}
            className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-[9999] bg-slate-900/95 backdrop-blur-xl border border-slate-800 text-white rounded-3xl p-5 shadow-2xl flex gap-4 overflow-hidden"
          >
            {/* Glowing active notification indicator */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
            
            <div className="w-11 h-11 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20 relative">
              <span className="absolute inset-0 rounded-2xl bg-indigo-500 animate-ping opacity-45 pointer-events-none" />
              <svg className="w-5.5 h-5.5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>

            <div className="flex-1 space-y-1 pr-6">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Class Alert</span>
                <span className="w-1 h-1 rounded-full bg-indigo-500" />
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Starts in 15m</span>
              </div>
              <h4 className="text-xs font-black text-white tracking-tight">
                {classNotification.courseCode}: {classNotification.courseName}
              </h4>
              <p className="text-[10px] text-slate-300 font-bold leading-normal">
                Starts at {classNotification.time.split('-')[0].trim()} in <span className="text-rose-400 font-black">Room {classNotification.room}</span>. Let's head over!
              </p>
            </div>

            <button
              onClick={() => setClassNotification(null)}
              className="absolute top-4 right-4 p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global AI Assistant Bot */}
      <AIAssistantBot userProfile={profile} />

    </div>
  );
}
