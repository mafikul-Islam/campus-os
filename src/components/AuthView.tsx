import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, Chrome, Sparkles, ShieldCheck } from 'lucide-react';
import { auth, googleSignIn } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

interface AuthViewProps {
  onSuccess: (profileDetails?: { 
    name: string; 
    email: string;
  }) => void;
}

export default function AuthView({ onSuccess }: AuthViewProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      onSuccess({ name: cred.user.displayName || "Student", email: cred.user.email || "" });
    } catch (error: any) {
      console.error("Login failed:", error);
      setAuthError(error.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
      onSuccess({ name: regName || "Student", email: cred.user.email || "" });
    } catch (error: any) {
      console.error("Registration failed:", error);
      setAuthError(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const user = await googleSignIn();
      if (user) {
        onSuccess({ name: user.displayName || "Student", email: user.email || "" });
      }
    } catch (error: any) {
      console.error("Google sign in failed:", error);
      setAuthError("Google Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans select-none">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-brand-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-brand-secondary/10 blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Study Assistant
        </h2>
        <p className="mt-1.5 text-xs font-black text-brand-primary uppercase tracking-widest flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          Your Personal Tutor
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card py-8 px-6 shadow-xl border border-slate-200/60 rounded-[28px] sm:px-10">
          
          {authError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 text-xs font-bold leading-normal">
              <span className="shrink-0 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>{authError}</span>
            </div>
          )}

          {/* Custom Tabs Slider Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50 mb-8 relative">
            <button
              onClick={() => setActiveTab('login')}
              disabled={loading}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white text-brand-primary shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
              } disabled:opacity-50`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('register')}
              disabled={loading}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white text-brand-primary shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
              } disabled:opacity-50`}
            >
              Register
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'login' ? (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4.5 w-4.5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      disabled={loading}
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4.5 w-4.5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      required
                      disabled={loading}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-xs font-black uppercase tracking-wider text-white bg-brand-primary hover:bg-brand-primary-dark shadow-md shadow-brand-primary/10 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Login"}
                  </button>
                </div>
              </form>

              {/* Social Login Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-150"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-3 bg-white text-[10px] font-bold text-slate-400 tracking-widest">
                    Or Login With
                  </span>
                </div>
              </div>

              {/* Social login buttons */}
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={loading}
                  className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 glass-card hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-extrabold text-slate-700 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                >
                  <Chrome className="w-4 h-4 text-red-500" />
                  <span>Google</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      disabled={loading}
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Abir Mahmud"
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      disabled={loading}
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. abir@example.com"
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4.5 w-4.5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      required
                      disabled={loading}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-xs font-black uppercase tracking-wider text-white bg-linear-to-r from-brand-primary to-brand-secondary hover:from-brand-primary-dark hover:to-brand-secondary text-white shadow-md shadow-brand-primary/10 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Register"}
                  </button>
                </div>
              </form>

              {/* Social Register Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-150"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-3 bg-white text-[10px] font-bold text-slate-400 tracking-widest">
                    Or Sign Up With
                  </span>
                </div>
              </div>

              {/* Social login buttons */}
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={loading}
                  className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 glass-card hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-extrabold text-slate-700 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                >
                  <Chrome className="w-4 h-4 text-red-500" />
                  <span>Google</span>
                </button>
              </div>
            </motion.div>
          )}

          <div className="mt-6 flex justify-center items-center gap-1 text-[11px] font-semibold text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secure Firebase Authentication</span>
          </div>

        </div>
      </div>
    </div>
  );
}
