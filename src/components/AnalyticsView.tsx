import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { Activity, TrendingUp, CheckCircle, Award, Calculator, Plus, Trash2, ClipboardCheck, GraduationCap, ArrowLeft, ChevronDown, ChevronUp, X, Sliders, Target } from 'lucide-react';

interface AnalyticsViewProps {
  profile: UserProfile;
  onBack?: () => void;
}

export default function AnalyticsView({ profile, onBack }: AnalyticsViewProps) {
  
  // Interactive CGPA calculator state
  const [coursesList, setCoursesList] = React.useState<{name: string, code: string, credit: number, gpa: number, semester: number}[]>([
    { name: 'Database Systems', code: 'CSE3201', credit: 3.0, gpa: 4.0, semester: 3 },
    { name: 'English Literature', code: 'ENG101', credit: 2.0, gpa: 4.0, semester: 1 },
    { name: 'Computer Networks', code: 'CSE3202', credit: 3.0, gpa: 3.75, semester: 3 },
    { name: 'Algorithm Design', code: 'CSE2201', credit: 3.0, gpa: 3.5, semester: 2 }
  ]);
  const [courseNameInput, setCourseNameInput] = React.useState('');
  const [courseCodeInput, setCourseCodeInput] = React.useState('');
  const [courseCreditInput, setCourseCreditInput] = React.useState('3.0');
  const [obtainedGpaInput, setObtainedGpaInput] = React.useState('4.00');
  const [selectedSemesterInput, setSelectedSemesterInput] = React.useState('1');
  const [isRulesModalOpen, setIsRulesModalOpen] = React.useState(false);

  // Expanded states for semesters 1 to 8
  const [expandedSemesters, setExpandedSemesters] = React.useState<Record<number, boolean>>({
    1: true,
    2: false,
    3: true,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false
  });

  const toggleSemesterExpanded = (sem: number) => {
    setExpandedSemesters(prev => ({
      ...prev,
      [sem]: !prev[sem]
    }));
  };

  // Previous semesters context
  const [prevCgpaInput, setPrevCgpaInput] = React.useState('3.60');
  const [prevCreditsInput, setPrevCreditsInput] = React.useState('72'); // e.g. 6 completed semesters of ~12 credits each

  // Interactive Target GPA and degree requirements planner
  const [customTargetCgpa, setCustomTargetCgpa] = React.useState(profile.targetCgpa || 3.85);
  const [totalDegreeCredits, setTotalDegreeCredits] = React.useState(profile.creditsTotal || 140);

  // Autocomplete suggestion when user clicks a course name from their profile
  const handleSelectSuggestedCourse = (courseName: string) => {
    const matched = profile.courses.find(c => c.name === courseName);
    setCourseNameInput(courseName);
    if (matched) {
      setCourseCodeInput(matched.code);
    }
  };

  // Add course to current calculation list
  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseNameInput || !courseCodeInput) return;
    
    const creditNum = parseFloat(courseCreditInput) || 3.0;
    const gpaNum = parseFloat(obtainedGpaInput) || 4.0;
    const semNum = parseInt(selectedSemesterInput) || 1;

    setCoursesList(prev => [...prev, {
      name: courseNameInput,
      code: courseCodeInput.toUpperCase(),
      credit: creditNum,
      gpa: gpaNum,
      semester: semNum
    }]);

    // Auto expand when course is added
    setExpandedSemesters(prev => ({
      ...prev,
      [semNum]: true
    }));

    // Reset inputs
    setCourseNameInput('');
    setCourseCodeInput('');
  };

  const handleRemoveCourse = (courseToRemove: typeof coursesList[0]) => {
    setCoursesList(prev => prev.filter(c => c !== courseToRemove));
  };

  // Compute live current semester and cumulative totals
  const currentTotalCredits = coursesList.reduce((sum, c) => sum + c.credit, 0);
  const currentTotalGradePoints = coursesList.reduce((sum, c) => sum + (c.credit * c.gpa), 0);
  const currentSemesterGpa = currentTotalCredits > 0 ? (currentTotalGradePoints / currentTotalCredits) : 0;

  const previousCgpaVal = parseFloat(prevCgpaInput) || 0;
  const previousCreditsVal = parseFloat(prevCreditsInput) || 0;
  
  const totalCompletedCredits = previousCreditsVal + currentTotalCredits;
  const computedTotalCgpa = totalCompletedCredits > 0
    ? ((previousCgpaVal * previousCreditsVal + currentTotalGradePoints) / totalCompletedCredits)
    : previousCgpaVal;

  // Target GPA Predicter dynamic mathematics
  const remainingCredits = Math.max(0, totalDegreeCredits - totalCompletedCredits);
  const currentEarnedPoints = (previousCgpaVal * previousCreditsVal) + currentTotalGradePoints;
  const totalPointsNeededForTarget = customTargetCgpa * totalDegreeCredits;
  const requiredGpa = remainingCredits > 0
    ? (totalPointsNeededForTarget - currentEarnedPoints) / remainingCredits
    : 0;

  // Default semesters base values for progression
  const defaultSemesters = [
    { sem: 1, name: 'Sem 1', gpa: 3.42, credits: 12 },
    { sem: 2, name: 'Sem 2', gpa: 3.61, credits: 12 },
    { sem: 3, name: 'Sem 3', gpa: 3.55, credits: 12 },
    { sem: 4, name: 'Sem 4', gpa: 3.78, credits: 12 },
    { sem: 5, name: 'Sem 5', gpa: 3.82, credits: 12 },
    { sem: 6, name: 'Sem 6', gpa: profile.cgpa || 3.68, credits: 12 },
    { sem: 7, name: 'Sem 7', gpa: 3.70, credits: 12 },
    { sem: 8, name: 'Sem 8', gpa: 3.75, credits: 12 },
  ];

  // Dynamically overlay user-added courses on top of the 8 default semesters
  const finalSemesterData = defaultSemesters.map(defaultSem => {
    const semCourses = coursesList.filter(c => c.semester === defaultSem.sem);
    let semGpa = defaultSem.gpa;
    let semCredits = defaultSem.credits;

    if (semCourses.length > 0) {
      const totalCreds = semCourses.reduce((sum, c) => sum + c.credit, 0);
      const totalPoints = semCourses.reduce((sum, c) => sum + (c.credit * c.gpa), 0);
      semGpa = totalCreds > 0 ? (totalPoints / totalCreds) : 0;
      semCredits = totalCreds;
    }

    return {
      sem: defaultSem.sem,
      name: defaultSem.name,
      gpa: semGpa,
      credits: semCredits
    };
  });

  // Calculate overall cumulative CGPA progression progressively from Semester 1 to 8
  let runningPoints = 0;
  let runningCredits = 0;

  const gpaData = finalSemesterData.map(d => {
    runningPoints += d.gpa * d.credits;
    runningCredits += d.credits;
    const cumGpa = runningCredits > 0 ? (runningPoints / runningCredits) : 0;

    return {
      name: d.name,
      GPA: parseFloat(d.gpa.toFixed(2)),
      Cumulative: parseFloat(cumGpa.toFixed(2)),
      Average: 3.5
    };
  });

  // 2. Attendance data by Course
  const attendanceData = profile.courses.map(course => ({
    name: course.code,
    Attendance: course.attendance,
    Required: 75,
  }));

  // 3. Assignment Completion Status
  const assignmentData = [
    { name: 'Completed', value: 8 },
    { name: 'Pending', value: 2 },
    { name: 'Overdue', value: 1 },
  ];

  const PIE_COLORS = ['#4285F4', '#F4B400', '#DB4437'];

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto font-sans">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 glass-card dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-3xs"
              title="Back"
              id="back-button-analytics"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <Activity className="w-8 h-8 text-brand-primary" />
          Analytics Panel
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-light mt-1">
          Dynamic diagnostic visualizers checking grade trajectories, attendance safe thresholds, and core targets.
        </p>
      </div>

      {/* Dynamic CGPA Calculator Panel */}
      <div className="glass-card rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-850 bg-linear-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/40">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calculator className="w-5.5 h-5.5 text-brand-primary" />
            <div>
              <h2 className="text-md font-extrabold text-slate-800 dark:text-slate-100">Dynamic Semester CGPA Planner & Calculator</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-light">Input your current term grades to preview instant cumulative GPA trajectory impacts.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form and Course Suggestions */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 glass-card dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Fast Course Autocomplete</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.courses.map(c => (
                  <button
                    key={c.code}
                    onClick={() => handleSelectSuggestedCourse(c.name)}
                    className="px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-lg hover:border-brand-primary hover:text-brand-primary transition-all cursor-pointer"
                  >
                    {c.code}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddCourse} className="space-y-3">
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Course Name</label>
                <input
                  type="text"
                  placeholder="e.g. Database Systems"
                  value={courseNameInput}
                  onChange={(e) => setCourseNameInput(e.target.value)}
                  className="w-full px-3 py-2.5 glass-card dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-brand-primary dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Course Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CSE301"
                    value={courseCodeInput}
                    onChange={(e) => setCourseCodeInput(e.target.value)}
                    className="w-full px-3 py-2.5 glass-card dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-brand-primary dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Credits</label>
                  <select
                    value={courseCreditInput}
                    onChange={(e) => setCourseCreditInput(e.target.value)}
                    className="w-full px-3 py-2.5 glass-card dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-brand-primary cursor-pointer dark:text-white"
                  >
                    <option value="1.0">1.0 Credit (Lab)</option>
                    <option value="1.5">1.5 Credits</option>
                    <option value="2.0">2.0 Credits</option>
                    <option value="3.0">3.0 Credits (Lecture)</option>
                    <option value="4.0">4.0 Credits</option>
                  </select>
                </div>
              </div>

              {/* Obtained Grade and Semester side-by-side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Obtained Grade</label>
                  <select
                    value={obtainedGpaInput}
                    onChange={(e) => setObtainedGpaInput(e.target.value)}
                    className="w-full px-3 py-2.5 glass-card dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-brand-primary cursor-pointer dark:text-white"
                  >
                    <option value="4.00">A+ (4.00)</option>
                    <option value="3.75">A (3.75)</option>
                    <option value="3.50">A- (3.50)</option>
                    <option value="3.25">B+ (3.25)</option>
                    <option value="3.00">B (3.00)</option>
                    <option value="2.75">B- (2.75)</option>
                    <option value="2.50">C+ (2.50)</option>
                    <option value="2.25">C (2.25)</option>
                    <option value="2.00">D (2.00)</option>
                    <option value="0.00">F (0.00)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Semester</label>
                  <select
                    value={selectedSemesterInput}
                    onChange={(e) => setSelectedSemesterInput(e.target.value)}
                    className="w-full px-3 py-2.5 glass-card dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-brand-primary cursor-pointer dark:text-white"
                  >
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                    <option value="3">Semester 3</option>
                    <option value="4">Semester 4</option>
                    <option value="5">Semester 5</option>
                    <option value="6">Semester 6</option>
                    <option value="7">Semester 7</option>
                    <option value="8">Semester 8</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] shadow-sm mt-4"
              >
                <Plus className="w-4 h-4" />
                Add Course to Term
              </button>
            </form>
          </div>

          {/* Table of Enrolled items + Multi-semester cumulative settings */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Calculation Rules Button styled similarly to Add Course to Term */}
            <button
              type="button"
              onClick={() => setIsRulesModalOpen(true)}
              className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 text-brand-primary dark:text-brand-primary-light font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-3xs"
            >
              <ClipboardCheck className="w-4 h-4" />
              Calculation Rules
            </button>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 glass-card dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                <label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Prior Semesters CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.00"
                  max="4.00"
                  value={prevCgpaInput}
                  onChange={(e) => setPrevCgpaInput(e.target.value)}
                  className="w-full px-2 py-1 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-brand-primary dark:text-white dark:bg-slate-900"
                />
              </div>
              <div className="p-3 glass-card dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                <label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Completed Credits</label>
                <input
                  type="number"
                  value={prevCreditsInput}
                  onChange={(e) => setPrevCreditsInput(e.target.value)}
                  className="w-full px-2 py-1 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-brand-primary dark:text-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="glass-card dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl p-4 min-h-[220px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-900 pb-2">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Term Course List ({coursesList.length})</span>
                </div>
                
                {coursesList.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-10">No courses added. Use the form to plan your term.</p>
                ) : (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {Array.from({ length: 8 }, (_, i) => i + 1).map(semNum => {
                      const semCourses = coursesList.filter(c => c.semester === semNum);
                      if (semCourses.length === 0) return null;

                      const semCredits = semCourses.reduce((sum, c) => sum + c.credit, 0);
                      const semPoints = semCourses.reduce((sum, c) => sum + (c.credit * c.gpa), 0);
                      const semGpa = semCredits > 0 ? (semPoints / semCredits) : 0;

                      return (
                        <div key={semNum} className="border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden bg-slate-50/40 dark:bg-slate-900/10">
                          {/* Semester Accordion Header */}
                          <button
                            type="button"
                            onClick={() => toggleSemesterExpanded(semNum)}
                            className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded-md">
                                Sem {semNum}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-slate-300 dark:text-slate-700 font-light">-----</span>
                              <span className="text-brand-primary dark:text-brand-primary-light font-extrabold text-[11px]">
                                GPA: {semGpa.toFixed(2)}
                              </span>
                              <span className="text-slate-300 dark:text-slate-700 font-light">-----</span>
                              {expandedSemesters[semNum] ? (
                                <ChevronUp className="w-4 h-4 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                          </button>

                          {/* Expanded list styled perfectly as requested */}
                          {expandedSemesters[semNum] && (
                            <div className="p-3 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850 space-y-2.5">
                              {semCourses.map((c, idx) => (
                                <div 
                                  key={idx} 
                                  className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-100/80 dark:border-slate-800/50 hover:shadow-3xs transition-all"
                                >
                                  <div className="min-w-0 text-left">
                                    <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm leading-tight">{c.name}</p>
                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block mt-1 uppercase tracking-wider">
                                      {c.code} • {c.credit} Credits
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    <span className="font-black text-indigo-600 dark:text-indigo-400 text-xs bg-indigo-50/80 dark:bg-indigo-950/30 px-3 py-1.5 rounded-xl">
                                      GPA {c.gpa.toFixed(2)}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveCourse(c)}
                                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
                                      title="Remove course"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Dynamic Math readout boxes */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-150 dark:border-slate-850">
                <div className="text-center p-2 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-850">
                  <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Term SGPA</span>
                  <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 block mt-0.5">{currentSemesterGpa.toFixed(2)}</span>
                </div>
                <div className="text-center p-2 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-850">
                  <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total Credits</span>
                  <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300 block mt-0.5">{totalCompletedCredits}</span>
                </div>
                <div className="text-center p-2 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 glow-purple">
                  <span className="text-[9px] font-extrabold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider block">New CGPA</span>
                  <span className="text-sm font-black text-brand-primary dark:text-brand-primary-light block mt-0.5">{computedTotalCgpa.toFixed(2)}</span>
                </div>
              </div>

              {/* Target CGPA Predictor & Requirement Simulator */}
              <div className="mt-5 p-4 rounded-2xl bg-linear-to-b from-indigo-500/[0.03] to-slate-50/50 dark:from-indigo-950/10 dark:to-slate-950/40 border border-indigo-500/10 space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-500 animate-pulse" />
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Degree Target CGPA Predictor</h4>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">Predict the remaining efforts required to graduate with your ideal grade.</p>
                  </div>
                </div>

                {/* Range Sliders for interactive prediction */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      <span>Target CGPA</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{customTargetCgpa.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="2.00"
                      max="4.00"
                      step="0.05"
                      value={customTargetCgpa}
                      onChange={(e) => setCustomTargetCgpa(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-200 dark:bg-slate-800 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      <span>Total Degree Credits</span>
                      <span className="text-slate-700 dark:text-slate-300 font-extrabold">{totalDegreeCredits} hrs</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="160"
                      step="5"
                      value={totalDegreeCredits}
                      onChange={(e) => setTotalDegreeCredits(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-200 dark:bg-slate-800 rounded-lg"
                    />
                  </div>
                </div>

                {/* Prediction Output Badge */}
                <div className={`p-3 rounded-xl flex items-center gap-3 border ${
                  requiredGpa > 4.0
                    ? 'bg-rose-500/5 border-rose-500/10 text-rose-700'
                    : requiredGpa > 3.7
                    ? 'bg-amber-500/5 border-amber-500/10 text-amber-700'
                    : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-700'
                }`}>
                  <div className="shrink-0">
                    {requiredGpa > 4.0 ? (
                      <span className="px-2 py-1 rounded-lg bg-rose-500/15 font-black text-rose-600 font-mono text-[11px]">ALERT</span>
                    ) : (
                      <span className="px-2 py-1 rounded-lg bg-indigo-500/15 font-black text-indigo-600 font-mono text-[11px]">PREDICT</span>
                    )}
                  </div>
                  <div className="text-left">
                    {remainingCredits <= 0 ? (
                      <p className="text-[11px] font-bold">You have already completed all credits required for this degree level! 🎉</p>
                    ) : requiredGpa > 4.0 ? (
                      <p className="text-[11px] font-bold leading-tight">
                        Target of <span className="font-extrabold">{customTargetCgpa.toFixed(2)}</span> requires averaging <span className="font-extrabold text-rose-600 font-mono">{requiredGpa.toFixed(2)} GPA</span> across the remaining {remainingCredits} credits, which is mathematically out of range. Try adjusting goals.
                      </p>
                    ) : requiredGpa < 2.0 ? (
                      <p className="text-[11px] font-semibold leading-tight">
                        Excellent trajectory! You only need to average a minimal <span className="font-black text-emerald-600 font-mono">{(Math.max(2.0, requiredGpa)).toFixed(2)} GPA</span> in remaining {remainingCredits} credit hours.
                      </p>
                    ) : (
                      <p className="text-[11px] font-semibold leading-tight">
                        To hit <span className="font-extrabold">{customTargetCgpa.toFixed(2)}</span>, you must average <span className="font-black text-indigo-600 dark:text-indigo-400 font-mono">{requiredGpa.toFixed(2)} GPA</span> (approx. {requiredGpa > 3.7 ? 'A / A+' : 'A- / B+'}) across your remaining {remainingCredits} credit hours.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Line Chart: Cumulative GPA progress spanning all 8 semesters */}
        <div className="lg:col-span-8 glass-card dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-850 p-6 shadow-sm">
          <h3 className="text-md font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-primary" />
            CGPA Trajectory Trend (All 8 Semesters)
          </h3>
          
          <div className="h-[280px] text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gpaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis domain={[2.5, 4.0]} stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#111827', borderRadius: '12px', border: '1px solid #1f2937', color: '#f8fafc' }} />
                <Legend />
                <Line type="monotone" dataKey="GPA" stroke="#4285F4" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Cumulative" stroke="#6C63FF" strokeWidth={3} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Assignment completions */}
        <div className="lg:col-span-4 glass-card dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-850 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-md font-bold text-slate-800 dark:text-slate-200 mb-6">Assignment Completion Ratio</h3>
            
            <div className="h-[180px] flex items-center justify-center text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assignmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {assignmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-slate-100 dark:border-slate-850">
            {assignmentData.map((item, idx) => (
              <div key={item.name} className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850">
                <span className="text-[10px] font-extrabold text-slate-400 block uppercase">{item.name}</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{item.value} Tasks</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart: Attendance metrics */}
        <div className="lg:col-span-12 glass-card dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-850 p-6 shadow-sm">
          <h3 className="text-md font-bold text-slate-800 dark:text-slate-200 mb-6">Attendance Rates by Course Code</h3>
          
          <div className="h-[250px] text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis domain={[0, 100]} stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#111827', borderRadius: '12px', border: '1px solid #1f2937', color: '#f8fafc' }} />
                <Legend />
                <Bar dataKey="Attendance" fill="#6C63FF" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Required" fill="#e2e8f0" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* CALCULATION RULES POP UP MODAL SCREEN */}
      <AnimatePresence>
        {isRulesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRulesModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-2xl glass-card dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl flex items-center justify-center text-brand-primary">
                    <GraduationCap className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h3 className="text-md font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                      Official Grading & Calculation Rules
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">How SGPA and CGPA are precisely calculated</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsRulesModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {/* Rule 1 Card */}
                <div className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20">
                  <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded-md">Rule 1</span>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2">Per Semester GPA Calculation</h4>
                  
                  {/* Formula Render */}
                  <div className="my-4 p-3 glass-card dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-xl flex items-center justify-center font-mono text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">Semester GPA =</span>
                      <div className="flex flex-col items-center">
                        <span className="border-b border-slate-400 pb-0.5">∑(Course Credit × Grade Point)</span>
                        <span className="pt-0.5">∑(Total Course Credits)</span>
                      </div>
                    </div>
                  </div>

                  {/* Formula Legend */}
                  <ul className="space-y-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <span className="text-brand-primary font-bold">•</span>
                      <span><strong>Course Credit:</strong> প্রতিটি course-এর credit hour (যেমন- ৩.০ বা ১.৫ ক্রেডিট)।</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-brand-primary font-bold">•</span>
                      <span><strong>Grade Point:</strong> ঐ course-এর প্রাপ্ত grade অনুযায়ী point (যেমন- A+ এর জন্য ৪.০০)।</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-brand-primary font-bold">•</span>
                      <span><strong>Total Course Credits:</strong> ঐ semester-এর সব course-এর মোট credit।</span>
                    </li>
                  </ul>
                </div>

                {/* Rule 2 Card */}
                <div className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20">
                  <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-brand-primary bg-indigo-50 dark:bg-indigo-950/40 rounded-md">Rule 2</span>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2">Total CGPA (Overall CGPA) Calculation</h4>
                  
                  {/* Formula Render */}
                  <div className="my-4 p-3 glass-card dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-xl flex items-center justify-center font-mono text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">Total CGPA =</span>
                      <div className="flex flex-col items-center">
                        <span className="border-b border-slate-400 pb-0.5">∑(All Course Credit × Grade Point)</span>
                        <span className="pt-0.5">∑(All Completed Credits)</span>
                      </div>
                    </div>
                  </div>

                  {/* Formula Legend */}
                  <ul className="space-y-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <span className="text-brand-primary font-bold">•</span>
                      <span><strong>All Course Credit:</strong> সব semester-এর সব course-এর credit।</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-brand-primary font-bold">•</span>
                      <span><strong>All Completed Credits:</strong> সব completed semester-এর সব course-এর মোট credit।</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-brand-primary font-bold">•</span>
                      <span><span><strong>Weighting:</strong></span> এটি cumulative weighted average, যা সকল সেমেস্টারের ক্রেডিট ও গ্রেডের সমানুপাতিক সমষ্টি নির্ধারণ করে।</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setIsRulesModalOpen(false)}
                  className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-dark text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Close Rules
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
