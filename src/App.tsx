import React, { useState, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';
import { initAuth, logout } from './firebase';
import AuthView from './components/AuthView';
import AIAssistantBot from './components/AIAssistantBot';

interface UserProfile {
  name: string;
  email: string;
}

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setProfile({
          name: user.displayName || 'Student',
          email: user.email || ''
        });
        setLoading(false);
      },
      () => {
        setProfile(null);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logout();
    setProfile(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return <AuthView onSuccess={(p) => setProfile(p || { name: 'Student', email: '' })} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 relative font-sans">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
            AI
          </div>
          <h1 className="text-sm font-extrabold text-slate-800">Study Assistant</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 py-1.5 px-3 rounded-full">
            <User className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700">{profile.name}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-24 px-6 max-w-4xl mx-auto h-[calc(100vh-2rem)]">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-800 mb-2">Welcome back, {profile.name.split(' ')[0]}</h2>
          <p className="text-slate-500 font-medium">Your AI Study Assistant is ready to help you excel.</p>
        </div>

        {/* Instead of floating, let's render the bot prominently in the center */}
        <div className="glass-card bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden h-[600px] relative">
           {/* We pass a custom prop to make it fill the container if we want, but for now we'll just adapt AIAssistantBot to full width or absolute fill */}
           <AIAssistantBot userProfile={profile} fullScreenMode={true} />
        </div>
      </main>
    </div>
  );
}
