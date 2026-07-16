export interface NoteDocument {
  id: string;
  name: string;
  content: string;
  type: 'pdf' | 'ppt' | 'doc' | 'image' | 'note';
  date: string;
  size?: string;
  actionsResult?: {
    summary?: string;
    explain?: string;
    examNotes?: string;
    flashcards?: { question: string; answer: string }[];
    mcqs?: { question: string; options: string[]; answer: number; explanation: string }[];
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'Extra Class' | 'Exam' | 'Assignment' | 'Project' | 'Personal';
  date: string;
  time: string;
  room?: string;
  course?: string;
  color?: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: 'Food' | 'Transport' | 'Education' | 'Entertainment' | 'Others';
  description: string;
  date: string;
}

export interface CourseDetail {
  id: string;
  name: string;
  code: string;
  attendance: number; // percentage
  grade?: string;
  progress: number; // percentage completed
  lecturesTotal: number;
  lecturesAttended: number;
}

export interface RoutineClass {
  id: string;
  day: string;
  courseName: string;
  courseCode: string;
  time: string;
  room: string;
  teacher: string;
}

export interface UserProfile {
  name: string;
  university: string;
  major: string;
  cgpa: number;
  targetCgpa: number;
  creditsCompleted: number;
  creditsTotal: number;
  attendance: number; // overall percentage
  courses: CourseDetail[];
  studentId?: string;
  batch?: string;
  section?: string;
  semester?: string;
  avatarUrl?: string;
  universityLogoUrl?: string;
  departmentLogoUrl?: string;
  classReminders?: boolean;
  deadlineReminders?: boolean;
  routineClasses?: RoutineClass[];
  routineUploaded?: boolean;
  publicDriveFolderUrl?: string;
  publicDriveFolderId?: string;
  mfaEnabled?: boolean;
  mfaPhoneNumber?: string;
  mfaMethod?: 'sms' | 'app';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
