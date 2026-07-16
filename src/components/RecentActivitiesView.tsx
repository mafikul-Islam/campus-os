import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Clock, 
  Trash2, 
  ClipboardList, 
  BookOpen, 
  BarChart2, 
  CreditCard, 
  GraduationCap, 
  Rocket, 
  Calendar,
  Settings,
  Bell,
  Sparkles
} from 'lucide-react';

interface ActivityItem {
  id: string;
  title: string;
  module: string;
  timestamp: string;
  formattedTime: string;
  formattedDate: string;
}

interface RecentActivitiesViewProps {
  activities: ActivityItem[];
  onBack: () => void;
  onClearActivities: () => void;
}

export default function RecentActivitiesView({ activities, onBack, onClearActivities }: RecentActivitiesViewProps) {
  
  // Helper to choose color-coding and icons based on module type
  const getModuleConfig = (module: string) => {
    switch (module.toLowerCase()) {
      case 'notepad':
        return { color: 'bg-pink-500 text-white', icon: ClipboardList, border: 'border-pink-100' };
      case 'ai notes':
      case 'notes':
        return { color: 'bg-indigo-500 text-white', icon: BookOpen, border: 'border-indigo-100' };
      case 'analytics':
        return { color: 'bg-blue-500 text-white', icon: BarChart2, border: 'border-blue-100' };
      case 'expenses':
        return { color: 'bg-emerald-500 text-white', icon: CreditCard, border: 'border-emerald-100' };
      case 'ai tutor':
      case 'coach':
        return { color: 'bg-amber-500 text-white', icon: GraduationCap, border: 'border-amber-100' };
      case 'lecture assistant':
      case 'lecture':
        return { color: 'bg-rose-500 text-white', icon: Rocket, border: 'border-rose-100' };
      case 'calendar':
        return { color: 'bg-purple-500 text-white', icon: Calendar, border: 'border-purple-100' };
      default:
        return { color: 'bg-slate-500 text-white', icon: Bell, border: 'border-slate-100' };
    }
  };

  // Group activities by formattedDate
  const groupedActivities = activities.reduce((groups: { [key: string]: ActivityItem[] }, activity) => {
    const date = activity.formattedDate;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {});

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6 font-sans bg-slate-50/40 min-h-screen pb-20 text-left">
      
      {/* Back Header - Clean & Elegant */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:glass-card border border-transparent hover:border-slate-100 transition-all cursor-pointer shadow-3xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        {activities.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Clear entire tracking history? This is irreversible.')) {
                onClearActivities();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Logs</span>
          </button>
        )}
      </div>

      {/* Main Container */}
      <div className="glass-card border border-slate-100 rounded-3xl p-5 shadow-xs space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            <h1 className="text-lg font-black text-slate-800 uppercase tracking-tight">Real-Time Activity Log</h1>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Real activity is tracked below with precise times. Entries older than 1 week (7 days) are auto-removed.
          </p>
        </div>

        {activities.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400 border border-slate-100">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No recent actions logged</p>
            <p className="text-[11px] text-slate-400 font-light max-w-xs mx-auto">
              Perform some action like saving notepad text, updating your profile, logging an expense, or analyzing a note to begin tracking!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedActivities).map((date) => (
              <div key={date} className="space-y-3">
                {/* Date Group Header */}
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl inline-block">
                  {date}
                </h3>

                {/* Group Activities */}
                <div className="space-y-2.5 border-l-2 border-slate-100 pl-4 ml-3">
                  {groupedActivities[date].map((activity, idx) => {
                    const cfg = getModuleConfig(activity.module);
                    const Icon = cfg.icon;

                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="flex items-start justify-between gap-4 p-3 hover:bg-slate-50/50 rounded-2xl transition-all border border-transparent hover:border-slate-100"
                      >
                        <div className="flex items-start gap-3">
                          {/* Circle Icon Badge */}
                          <div className={`w-8 h-8 rounded-full ${cfg.color} flex items-center justify-center shrink-0 shadow-xs mt-0.5`}>
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-700 leading-snug">
                              {activity.title}
                            </span>
                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-slate-400">
                              <span>{activity.module}</span>
                              <span>•</span>
                              <span className="text-indigo-500">{activity.formattedTime}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
