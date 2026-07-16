import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CampusLogo from './CampusLogo';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Booting Campus OS...');

  useEffect(() => {
    // Progress interval for nice animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1.25; // Reaches 100 in ~1.6s
      });
    }, 20);

    // Dynamic system loading messages for elite premium feel
    const messages = [
      { t: 0, msg: 'Loading core system modules...' },
      { t: 400, msg: 'Initializing AI Cognitive Hub...' },
      { t: 800, msg: 'Establishing server-side secure tunnels...' },
      { t: 1200, msg: 'Syncing your class schedule and events...' },
      { t: 1600, msg: 'Finalizing digital campus workspace...' },
    ];

    const messageTimeouts = messages.map((m) => 
      setTimeout(() => setStatusText(m.msg), m.t)
    );

    // Call onComplete after 2.3 seconds
    const finishTimeout = setTimeout(() => {
      onComplete();
    }, 2300);

    return () => {
      clearInterval(progressInterval);
      messageTimeouts.forEach(t => clearTimeout(t));
      clearTimeout(finishTimeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#0F172A] flex flex-col items-center justify-center z-50 overflow-hidden font-sans select-none">
      
      {/* Background radial atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.12)_0%,rgba(15,23,42,0)_70%)]" />
      
      {/* Grid Pattern overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Floating dust particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[15%] w-72 h-72 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute bottom-[20%] right-[15%] w-80 h-80 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      {/* Center content */}
      <div className="relative flex flex-col items-center max-w-sm w-full px-6 text-center z-10">
        
        {/* Glowing circular backplate */}
        <div className="absolute -top-12 w-48 h-48 bg-linear-to-tr from-indigo-500/10 via-purple-500/10 to-blue-500/10 rounded-full blur-2xl opacity-60" />

        {/* Logo Container with entering motion */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-28 h-28 relative flex items-center justify-center mb-8"
        >
          <img 
            src="/images/logo1.png" 
            alt="Splash Logo" 
            className="w-24 h-24 object-contain" 
          />
        </motion.div>

        {/* Brand Typography */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="space-y-2.5"
        >
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-1">
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-blue-300 bg-clip-text text-transparent">Campus OS</span>
          </h1>
          
          <p className="text-sm font-light text-slate-400 tracking-wide">
            One App. Your Entire University Life.
          </p>
        </motion.div>

        {/* Dynamic Loading Meter */}
        <div className="w-full mt-12 space-y-4">
          
          {/* Progress outer track */}
          <div className="relative w-full h-4 bg-slate-950/40 border border-slate-700/50 rounded-full p-0.5 shadow-3xs overflow-hidden flex items-center">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>

          {/* Status Subtext */}
          <div className="h-5 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={statusText}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-xs font-medium text-slate-400/90 font-mono tracking-tight"
              >
                {statusText}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 text-[10px] text-slate-500 font-mono tracking-widest uppercase">
        © 2026 Campus OS • All rights reserved
      </div>

    </div>
  );
}
