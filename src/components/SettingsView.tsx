import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile, CourseDetail } from '../types';
import { User, School, Award, CheckCircle, BookOpen, Trash2, Plus, RefreshCw, Key, Shield, ArrowLeft } from 'lucide-react';

interface SettingsViewProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onBack?: () => void;
}

export default function SettingsView({ profile, onUpdateProfile, onBack }: SettingsViewProps) {
  const [editedName, setEditedName] = useState(profile.name);
  const [editedUniversity, setEditedUniversity] = useState(profile.university);
  const [editedMajor, setEditedMajor] = useState(profile.major);
  const [editedCgpa, setEditedCgpa] = useState(profile.cgpa.toString());
  const [editedTargetCgpa, setEditedTargetCgpa] = useState(profile.targetCgpa.toString());
  const [editedCreditsCompleted, setEditedCreditsCompleted] = useState(profile.creditsCompleted.toString());
  const [editedCreditsTotal, setEditedCreditsTotal] = useState(profile.creditsTotal.toString());
  
  // Courses state
  const [courses, setCourses] = useState<CourseDetail[]>(profile.courses);
  
  // New course state
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseAttendance, setNewCourseAttendance] = useState('90');
  const [newCourseLecturesTotal, setNewCourseLecturesTotal] = useState('24');
  const [newCourseLecturesAttended, setNewCourseLecturesAttended] = useState('22');
  const [newCourseGrade, setNewCourseGrade] = useState('A');

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName || !newCourseCode) return;

    const newCourse: CourseDetail = {
      id: Math.random().toString(36).substr(2, 9),
      name: newCourseName,
      code: newCourseCode,
      attendance: parseFloat(newCourseAttendance) || 100,
      grade: newCourseGrade,
      progress: 0,
      lecturesTotal: parseInt(newCourseLecturesTotal) || 24,
      lecturesAttended: parseInt(newCourseLecturesAttended) || 22,
    };

    const updated = [...courses, newCourse];
    setCourses(updated);
    
    // Clear inputs
    setNewCourseName('');
    setNewCourseCode('');
    setNewCourseAttendance('90');
    setNewCourseLecturesTotal('24');
    setNewCourseLecturesAttended('22');
    setNewCourseGrade('A');
  };

  const handleRemoveCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const handleSave = () => {
    // calculate average attendance across courses
    const overallAttendance = courses.length > 0 
      ? Math.round(courses.reduce((acc, curr) => acc + curr.attendance, 0) / courses.length)
      : 90;

    const updatedProfile: UserProfile = {
      name: editedName,
      university: editedUniversity,
      major: editedMajor,
      cgpa: parseFloat(editedCgpa) || 3.5,
      targetCgpa: parseFloat(editedTargetCgpa) || 3.8,
      creditsCompleted: parseInt(editedCreditsCompleted) || 45,
      creditsTotal: parseInt(editedCreditsTotal) || 120,
      attendance: overallAttendance,
      courses: courses,
    };

    onUpdateProfile(updatedProfile);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4 md:p-8">
      {/* View Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 rounded-xl border border-slate-200 glass-card text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-3xs"
              title="Back"
              id="back-button-settings"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <User className="w-8 h-8 text-brand-primary" />
          Operating System Settings
        </h1>
        <p className="text-slate-500 mt-1 font-light">
          Customize your student parameters, academic weights, and course parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: General Profile Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card rounded-3xl p-6 shadow-sm glow-purple">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <School className="w-5 h-5 text-brand-primary" />
              Academic Student Profile
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">University Name</label>
                <input
                  type="text"
                  value={editedUniversity}
                  onChange={(e) => setEditedUniversity(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm font-medium text-slate-800"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Major / Degree Plan</label>
                <input
                  type="text"
                  value={editedMajor}
                  onChange={(e) => setEditedMajor(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Current CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  value={editedCgpa}
                  onChange={(e) => setEditedCgpa(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  value={editedTargetCgpa}
                  onChange={(e) => setEditedTargetCgpa(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Credits Completed</label>
                <input
                  type="number"
                  value={editedCreditsCompleted}
                  onChange={(e) => setEditedCreditsCompleted(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Total Credits Plan</label>
                <input
                  type="number"
                  value={editedCreditsTotal}
                  onChange={(e) => setEditedCreditsTotal(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
              <div>
                {saveSuccess && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs text-emerald-600 font-bold flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" /> Changes saved instantly
                  </motion.span>
                )}
              </div>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-sm rounded-xl transition-all duration-200 hover:scale-[1.02] cursor-pointer shadow-sm"
              >
                Save Profile
              </button>
            </div>
          </div>

          {/* Connected Services simulation */}
          <div className="glass-card rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-500" />
              Credentials & Sync Integrations
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-brand-primary">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Google Gemini API Key</h4>
                    <p className="text-xs text-slate-500">Auto-configured securely server-side via secrets panel</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-500/10">Connected</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-brand-secondary">
                    <School className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">University Portal Link</h4>
                    <p className="text-xs text-slate-500">Campus OS Local Sync Node (OAuth2 flow)</p>
                  </div>
                </div>
                <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full border border-slate-200">Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Active Courses Editor */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-3xl p-6 shadow-sm glow-blue">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-secondary" />
              Active Course Manager
            </h2>

            {/* Course List */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 mb-6">
              {courses.map((course) => (
                <div key={course.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">{course.code}</h4>
                    <h3 className="text-sm font-bold text-slate-800 mt-0.5">{course.name}</h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <span>Att: <strong className={course.attendance < 75 ? "text-rose-500" : "text-emerald-600"}>{course.attendance}%</strong></span>
                      <span>•</span>
                      <span>Target: <strong className="text-indigo-600">{course.grade || 'A'}</strong></span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveCourse(course.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove Course"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              ))}
              {courses.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-8">No active courses. Add courses below to track.</p>
              )}
            </div>

            {/* Add Course Form */}
            <form onSubmit={handleAddCourse} className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add New Course
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder="Course Name (e.g. Advanced AI)"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-brand-primary"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Course Code (e.g. CSE 304)"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-brand-primary"
                    required
                  />
                </div>
                <div>
                  <select
                    value={newCourseGrade}
                    onChange={(e) => setNewCourseGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-1 focus:ring-brand-primary"
                  >
                    <option value="A">Grade A</option>
                    <option value="A-">Grade A-</option>
                    <option value="B+">Grade B+</option>
                    <option value="B">Grade B</option>
                    <option value="C">Grade C</option>
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Attendance %"
                    value={newCourseAttendance}
                    onChange={(e) => setNewCourseAttendance(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-brand-primary"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Total Lectures"
                    value={newCourseLecturesTotal}
                    onChange={(e) => setNewCourseLecturesTotal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer mt-2"
              >
                Register Course
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
