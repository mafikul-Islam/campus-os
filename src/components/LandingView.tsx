import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Calendar, BookOpen, CreditCard, Brain, Shield, Rocket, ArrowRight, Activity, Cpu } from 'lucide-react';
import CampusLogo from './CampusLogo';

interface LandingViewProps {
  onGetStarted: () => void;
}

export default function LandingView({ onGetStarted }: LandingViewProps) {
  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const floatVariants = {
    animate: {
      y: [0, -12, 0],
      transition: {
        duration: 5,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  };

  return (
    <div id="landing-page" className="min-h-screen bg-transparent backdrop-blur-md relative overflow-hidden font-sans select-none selection:bg-brand-primary/20">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-brand-secondary/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] w-[350px] h-[350px] rounded-full bg-indigo-200/20 blur-[100px] pointer-events-none" />

      {/* Header / Navbar */}
      <nav className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 flex items-center justify-between relative z-10 gap-2">
        <div className="flex items-center space-x-2 md:space-x-3 shrink-0">
          <CampusLogo className="w-8 h-8 md:w-10 md:h-10" animate={true} />
          <div>
            <span className="text-lg md:text-xl font-bold tracking-tight text-slate-900 bg-linear-to-r from-brand-primary to-brand-primary-dark bg-clip-text text-transparent">Campus OS</span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-sm font-medium text-slate-600 hover:text-brand-primary transition-colors">Features</a>
          <a href="#about" className="text-sm font-medium text-slate-600 hover:text-brand-primary transition-colors">OS Blueprint</a>
          <span className="text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            v2.0 Active
          </span>
        </div>

        <button 
          onClick={onGetStarted}
          className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-xs md:text-sm font-medium text-slate-900 rounded-xl group bg-linear-to-br from-brand-primary to-brand-secondary group-hover:from-brand-primary group-hover:to-brand-secondary hover:text-white focus:ring-4 focus:outline-hidden focus:ring-purple-200 cursor-pointer shadow-md shadow-brand-primary/10 transition-transform active:scale-95 shrink-0"
        >
          <span className="relative px-3 py-1.5 md:px-5 md:py-2.5 transition-all ease-in duration-75 glass-card rounded-xl group-hover:bg-opacity-0 text-slate-800 group-hover:text-white font-bold tracking-tight">
            Launch Platform
          </span>
        </button>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Text content */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 flex flex-col space-y-8"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-linear-to-r from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/20 px-4 py-2 rounded-full w-fit">
              <Sparkles className="w-4 h-4 text-brand-primary animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-xs font-bold tracking-wide text-brand-primary-dark uppercase">Next-Gen Intelligent Student Hub</span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]"
            >
              Your Entire University Life, <br />
              <span className="bg-linear-to-r from-brand-primary via-indigo-500 to-brand-secondary bg-clip-text text-transparent animate-gradient">
                Powered by AI
              </span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-lg text-slate-600 max-w-xl leading-relaxed font-light"
            >
              Manage classes, notes, deadlines, documents, expenses and academic progress with your personal AI university assistant. Engineered on Google Gemini.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4"
            >
              <button 
                onClick={onGetStarted}
                className="inline-flex items-center justify-center px-8 py-4 bg-linear-to-r from-brand-primary to-brand-primary-dark hover:from-brand-primary-dark hover:to-brand-primary text-white font-bold rounded-2xl shadow-xl shadow-brand-primary/20 hover:shadow-brand-primary/35 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group cursor-pointer"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform" />
              </button>
              
              <a 
                href="#features"
                className="inline-flex items-center justify-center px-8 py-4 glass-card hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-300"
              >
                Explore Features
              </a>
            </motion.div>

            {/* Quick trust metrics */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200 max-w-lg"
            >
              <div>
                <span className="block text-2xl font-extrabold text-slate-800">4.0 GPA</span>
                <span className="text-xs text-slate-500">Intelligent Guidance</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-slate-800">100%</span>
                <span className="text-xs text-slate-500">Automated OCR</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-slate-800">Server</span>
                <span className="text-xs text-slate-500">Gemini Grounded</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Interactive Graphic Representation */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative flex justify-center"
          >
            {/* Main Interactive Floating Canvas */}
            <motion.div 
              variants={floatVariants}
              animate="animate"
              className="w-full max-w-[420px] aspect-[4/5] rounded-[32px] glass-card border border-slate-200/80 p-6 shadow-2xl relative overflow-hidden glow-purple bg-linear-to-b from-white to-slate-50"
            >
              {/* Inner Dashboard Simulation */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-red-400"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                  <span className="w-3 h-3 rounded-full bg-green-400"></span>
                </div>
                <div className="text-xs font-bold text-slate-400 font-mono">CAMPUS_COACH_LIVE</div>
              </div>

              {/* Float Widget 1: Schedule Notification */}
              <div className="bg-linear-to-r from-brand-primary to-indigo-600 rounded-2xl p-4 text-white mb-4 shadow-lg shadow-brand-primary/20 relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-24 h-24 rounded-full glass-card/10 blur-xl"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wide uppercase opacity-90">Today's Focus</span>
                  <Activity className="w-4 h-4 text-white animate-pulse" />
                </div>
                <h4 className="text-lg font-bold mt-1">Database Systems</h4>
                <p className="text-xs opacity-80 mt-1">09:30 AM • Room CS-402</p>
              </div>

              {/* Float Widget 2: AI Coach Suggestion */}
              <div className="glass-card rounded-2xl p-4 border border-slate-100 shadow-xs mb-4 flex items-start space-x-3 hover:shadow-md transition-shadow">
                <div className="w-8 h-8 rounded-full bg-brand-secondary/15 flex items-center justify-center text-brand-secondary shrink-0">
                  <Brain className="w-4.5 h-4.5 animate-bounce" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800">AI Coach Coach recommendation</h5>
                  <p className="text-[11px] text-slate-500 mt-1">"You have 3 free hours today. Normalization concepts (3NF, BCNF) are crucial for your upcoming mid-term."</p>
                </div>
              </div>

              {/* Float Widget 3: Circular Progress Rings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">GPA TRACK</span>
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="28" cy="28" r="24" stroke="rgba(108, 99, 255, 0.1)" strokeWidth="4" fill="transparent"></circle>
                      <circle cx="28" cy="28" r="24" stroke="#6C63FF" strokeWidth="4" fill="transparent" strokeDasharray="150" strokeDashoffset="35" strokeLinecap="round" className="transition-all duration-1000"></circle>
                    </svg>
                    <span className="absolute text-xs font-extrabold text-slate-800">3.85</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">ATTENDANCE</span>
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="28" cy="28" r="24" stroke="rgba(66, 133, 254, 0.1)" strokeWidth="4" fill="transparent"></circle>
                      <circle cx="28" cy="28" r="24" stroke="#4285F4" strokeWidth="4" fill="transparent" strokeDasharray="150" strokeDashoffset="18" strokeLinecap="round" className="transition-all duration-1000"></circle>
                    </svg>
                    <span className="absolute text-xs font-extrabold text-slate-800">88%</span>
                  </div>
                </div>
              </div>

              {/* Floating Mini Decorative Badge */}
              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-12 right-[-20px] bg-amber-400 text-slate-900 text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-lg border border-white flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                Active Recall AI Ready
              </motion.div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="bg-white border-t border-slate-100 py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-sm font-bold tracking-widest text-brand-primary uppercase mb-3">Modular Ecosystem</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              One Single Platform. <br />Every University Workflow Solved.
            </h3>
            <p className="text-slate-500 mt-4 font-light leading-relaxed">
              Ditch the 10 legacy spreadsheets, calendars, and PDF readers. Campus OS integrates everything with a server-side intelligence framework.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 hover:border-brand-primary/10 hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-300 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-6">
                <Brain className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">AI Student Coach</h4>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                A personal mentor monitoring attendance, study schedules, budget trends, and active exams to provide high-yield suggestions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 hover:border-brand-primary/10 hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-300 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-brand-secondary/10 text-brand-secondary flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">AI Notes Analyzer</h4>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Upload PDFs, lecture transcripts, and photos. Instantly construct study guides, active recall flashcards, and exam-level MCQs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 hover:border-brand-primary/10 hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-300 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Smart AI Calendar</h4>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Inject routine tables or images and let Campus OS extract and render study schedules, assignments, and exam calendars automatically.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 hover:border-brand-primary/10 hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-300 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6">
                <CreditCard className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">AI Expense Tracker</h4>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Add financial transactions via natural voice or quick text. Instantly structures spending models and recommends budget edits.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 hover:border-brand-primary/10 hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-300 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-6">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Academic Analytics</h4>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Interactive charts illustrating CGPA curves, historical progress, attendance safe zones, and performance diagnostics.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 hover:border-brand-primary/10 hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-300 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-6">
                <Rocket className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Google Drive & Sheets Integration</h4>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Mock connect Google Drive and Sheets to pull assignments, lecture material, and synchronize schedule structures instantly.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-100 bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 text-xs font-medium">
          <p>© 2026 Campus OS. Built with premium Material and SaaS UI principles for Google AI Hackathon.</p>
        </div>
      </footer>
    </div>
  );
}
