import React from 'react';
import { motion } from 'motion/react';
import { Github, Linkedin, Globe, Users, GraduationCap, Building2, Calendar, Sparkles, Heart, ArrowLeft } from 'lucide-react';

interface AboutDevelopersViewProps {
  onBack?: () => void;
}

export default function AboutDevelopersView({ onBack }: AboutDevelopersViewProps) {
  const developers = [
    {
      name: "Abir Mahmud Pritam",
      role: "Lead UI/UX Architect & Frontend & Backend Developer, Database Design, Lead Systems Architect",
      dept: "Dept of CSE",
      university: "Varendra University",
      batch: "32nd Batch",
      avatar: "/images/dev1.jpeg",
      bio: "Crafting beautiful interfaces, architecting robust frontend-backend logic, database systems schema design, and end-to-end cloud platform workflows.",
      github: "https://github.com/abir-mahmud-pritam",
      linkedin: "https://linkedin.com/in/abir-mahmud-pritam",
      portfolio: "https://pritam.dev"
    },
    {
      name: "Mafikul Islam",
      role: "Frontend & Backend, Lead Systems Architect and API Integration",
      dept: "Dept of CSE",
      university: "Varendra University",
      batch: "33rd Batch",
      avatar: "/images/dev2.jpg",
      bio: "Focused on high-performance API architectures, full-stack microservices, smart route logic integration, and scalable database systems.",
      github: "https://github.com/mafikul-islam",
      linkedin: "https://linkedin.com/in/mafikul-islam",
      portfolio: "https://mafikul.dev"
    }
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    })
  };

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto font-sans text-slate-800">
      
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 rounded-xl border border-slate-200 glass-card text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-3xs"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="inline-flex items-center gap-1.5 bg-brand-primary/10 px-3 py-1 rounded-full text-brand-primary text-[10px] font-black uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              Engineering Team
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
              About the Developers
            </h1>
          </div>
        </div>
        <p className="text-slate-500 font-light text-xs max-w-sm">
          Meet the core engineering architects behind Campus OS. Empowering university students with modern software utility suites.
        </p>
      </div>

      {/* 2. Developers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto pt-4">
        {developers.map((dev, idx) => (
          <motion.div
            key={dev.name}
            custom={idx}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="glass-card border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xs hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between group"
          >
            {/* Design Accents */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-brand-primary via-indigo-500 to-brand-secondary" />
            <div className="absolute -right-16 -top-16 w-36 h-36 bg-linear-to-tr from-brand-primary/10 to-transparent rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />

            <div className="space-y-6">
              {/* Profile Details Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                {/* Developer Picture */}
                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-150 shadow-sm relative group/avatar">
                  <img
                    src={dev.avatar}
                    alt={dev.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                </div>

                {/* Meta details */}
                <div className="space-y-1.5 min-w-0">
                  <h3 className="text-xl font-extrabold text-slate-800 tracking-tight group-hover:text-brand-primary transition-colors">
                    {dev.name}
                  </h3>
                  <p className="text-xs font-bold text-indigo-600">
                    {dev.role}
                  </p>
                  
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                    <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-[10px] font-bold text-slate-500">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      {dev.dept}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-[10px] font-bold text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {dev.batch}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio & University details */}
              <div className="space-y-3.5 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>University: </span>
                  <span className="text-slate-800 font-bold truncate">{dev.university}</span>
                </div>

                <p className="text-xs font-light text-slate-500 leading-relaxed">
                  {dev.bio}
                </p>
              </div>
            </div>

            {/* Social Links buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-6 border-t border-slate-100 mt-6">
              <a
                href={dev.github}
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-w-[90px] flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl transition-all"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>

              <a
                href={dev.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-w-[90px] flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-100 text-xs font-bold text-indigo-600 hover:text-indigo-800 rounded-xl transition-all"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>

              <a
                href={dev.portfolio}
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-w-[90px] flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100/80 border border-purple-100 text-xs font-bold text-purple-600 hover:text-purple-800 rounded-xl transition-all"
              >
                <Globe className="w-4 h-4" />
                <span>Portfolio</span>
              </a>
            </div>

          </motion.div>
        ))}
      </div>

      {/* Footer Acknowledgement */}
      <div className="pt-12 text-center text-xs text-slate-400 font-light flex items-center justify-center gap-1.5">
        <span>Made with</span>
        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
        <span>and</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>for university life</span>
      </div>

    </div>
  );
}
