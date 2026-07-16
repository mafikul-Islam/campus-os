import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, ChatMessage } from '../types';
import { Sparkles, Brain, Send, RefreshCw, Star, Compass, Zap, BookOpen, AlertCircle, ArrowLeft } from 'lucide-react';

interface CoachViewProps {
  profile: UserProfile;
  onTrackActivity?: (title: string, module: string) => void;
  onBack?: () => void;
}

export default function CoachView({ profile, onTrackActivity, onBack }: CoachViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: `Hello ${profile.name}! I am your Campus OS Academic Coach. I have analyzed your current profile at ${profile.university}:
      
* **Current CGPA**: ${profile.cgpa} (Targeting: ${profile.targetCgpa})
* **Active Courses**: ${profile.courses.map(c => c.code).join(', ')}
* **Overall Attendance**: ${profile.attendance}%

How can I help boost your study habits or coordinate your schedule today?`, 
      timestamp: new Date().toLocaleTimeString() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    if (onTrackActivity) {
      onTrackActivity(`Consulted AI Coach: "${textToSend.substring(0, 32)}${textToSend.length > 32 ? '...' : ''}"`, "AI Tutor");
    }

    try {
      const res = await fetch("/api/gemini/coach-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userProfile: profile
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, {
          id: Math.random().toString(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    } catch (e) {
      console.error("Coach chat error:", e);
    } finally {
      setIsSending(false);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const presetPrompts = [
    { title: "Review Study Plan", text: "Create a detailed 3-day high-yield study sheet for my database exam next week." },
    { title: "Improve GPA Tactics", text: "What specific methods should I adopt to raise my GPA from " + profile.cgpa + " to " + profile.targetCgpa + "?" },
    { title: "Attendance Recovery", text: "Suggest a plan to recover attendance in courses currently below 80%." },
  ];

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-5xl mx-auto font-sans">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 rounded-xl border border-slate-200 glass-card text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-3xs"
              title="Back"
              id="back-button-coach"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <Brain className="w-8 h-8 text-brand-primary" />
          AI Tutor
        </h1>
        <p className="text-slate-500 font-light mt-1">
          Your direct server-grounded personal academic mentor. Synthesizes deadlines, scores, and habits daily.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Avatar representation + Recommendations */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Animated Float Avatar Card */}
          <div className="glass-card rounded-3xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden bg-linear-to-b from-brand-primary/5 to-white glow-purple border border-brand-primary/10">
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 rounded-full bg-linear-to-tr from-brand-primary to-brand-secondary flex items-center justify-center text-white shadow-xl shadow-brand-primary/25 relative border-4 border-white mb-4"
            >
              <Sparkles className="w-10 h-10 animate-pulse" />
              <div className="absolute -inset-1 rounded-full border-2 border-white/20 animate-spin" style={{ animationDuration: '6s' }}></div>
            </motion.div>

            <h3 className="text-lg font-extrabold text-slate-800">Campus OS Coach</h3>
            <span className="text-[10px] uppercase font-bold tracking-wider text-brand-primary px-2.5 py-1 rounded-full bg-brand-primary/10 mt-1.5 border border-brand-primary/10">Mentor Mode Active</span>

            <p className="text-xs text-slate-500 leading-relaxed font-light mt-3">
              "We monitor your active grades, attendance safety ratios, and schedule parameters to compile optimized pathways."
            </p>
          </div>

          {/* Quick Stats overview for Mentor */}
          <div className="glass-card rounded-3xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-brand-secondary" /> Academic Diagnostic Logs
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="text-slate-500">CGPA Target Gap</span>
                <span className="font-bold text-brand-primary">{(profile.targetCgpa - profile.cgpa).toFixed(2)} Points</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="text-slate-500">Attendance Status</span>
                <span className={`font-bold ${profile.attendance < 75 ? 'text-rose-500' : 'text-emerald-600'}`}>{profile.attendance}%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="text-slate-500">Workload weight</span>
                <span className="font-bold text-indigo-500">{profile.courses.length} Active Courses</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Chat and Shortcuts */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Chat Window */}
          <div className="glass-card rounded-3xl p-6 shadow-sm h-[480px] flex flex-col justify-between glow-blue relative">
            
            {/* Header chat indicator */}
            <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-brand-secondary" />
                <h3 className="text-sm font-bold text-slate-800">Direct Chat with Academic Coach</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">100% Grounded Session</span>
            </div>

            {/* Messages box */}
            <div className="grow overflow-y-auto space-y-4 pr-1 mb-4 scroll-smooth text-xs">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-slate-800 text-white rounded-tr-xs'
                      : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-xs markdown-body'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl rounded-tl-xs p-4 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-secondary" />
                    AI Coach is synthesizing academic advice...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Presets and Chat input */}
            <div className="space-y-4">
              
              {/* Presets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {presetPrompts.map((p) => (
                  <button
                    key={p.title}
                    onClick={() => handleSend(p.text)}
                    disabled={isSending}
                    className="p-2.5 text-[10px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl transition-all text-left truncate disabled:opacity-50 cursor-pointer"
                  >
                    {p.title}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask for study timetables, grade boosting methods, or exam reviews..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isSending}
                  className="grow px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-brand-primary focus:outline-hidden disabled:opacity-50"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isSending || !input.trim()}
                  className="p-3.5 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-xl shadow-xs cursor-pointer flex items-center justify-center shrink-0 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
