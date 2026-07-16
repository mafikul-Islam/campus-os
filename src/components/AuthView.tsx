import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, Lock, User, Hash, GraduationCap, Building2, Chrome, Github, ArrowLeft, Layers, ShieldCheck, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import CampusLogo from './CampusLogo';
import { signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, googleSignIn } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';


interface AuthViewProps {
  onSuccess: (profileDetails?: { 
    name: string; 
    university: string; 
    major: string; 
    batch: string;
    studentId: string;
    section: string;
    semester: string;
    avatarUrl?: string;
  }) => void;
  onBack: () => void;
}

export default function AuthView({ onSuccess, onBack }: AuthViewProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Login Form States
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // MFA Login States
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaCodeInput, setMfaCodeInput] = useState('');
  const [sentMfaCode, setSentMfaCode] = useState('');
  const [mfaPhoneNumber, setMfaPhoneNumber] = useState('');
  const [pendingRegData, setPendingRegData] = useState<any>(null);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regStudentID, setRegStudentID] = useState('');
  const [regSection, setRegSection] = useState('');
  const [regSemester, setRegSemester] = useState('');
  const [regBatch, setRegBatch] = useState('');
  const [regUniversity, setRegUniversity] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Onboarding States
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardStudentID, setOnboardStudentID] = useState('');
  const [onboardSection, setOnboardSection] = useState('');
  const [onboardSemester, setOnboardSemester] = useState('');
  const [onboardBatch, setOnboardBatch] = useState('');
  const [onboardUniversity, setOnboardUniversity] = useState('Varendra University');
  const [onboardMajor, setOnboardMajor] = useState('Computer Science & Engineering');

  const checkAndTriggerMfa = async (firebaseUser: any, defaultRegData?: any): Promise<boolean> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        if (profileData.mfaEnabled && profileData.mfaPhoneNumber) {
          setMfaPhoneNumber(profileData.mfaPhoneNumber);
          const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
          setSentMfaCode(generatedCode);
          setPendingRegData(defaultRegData || null);
          setMfaStep(true);
          
          setTimeout(() => {
            alert(`[2-STEP VERIFICATION GATEWAY]\nVerification code dispatched to ${profileData.mfaPhoneNumber}:\n\nYour Login Verification Code is: ${generatedCode}`);
          }, 500);
          return true; 
        }
      }
    } catch (err) {
      console.error("MFA checking error:", err);
    }
    return false;
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCodeInput.trim() === sentMfaCode) {
      setMfaStep(false);
      onSuccess(pendingRegData || undefined);
    } else {
      setAuthError("Incorrect verification code. Please try again.");
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotError('Please enter a valid email address.');
      return;
    }
    setForgotError(null);
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, forgotEmail.trim());
      setForgotSuccess(true);
      setTimeout(() => {
        setForgotSuccess(false);
        setShowForgotPassword(false);
        setForgotEmail('');
      }, 5000);
    } catch (error: any) {
      console.error("Forgot password request failed:", error);
      let friendlyMessage = "Failed to send reset email. Please try again.";
      if (error.code === 'auth/invalid-email') {
        friendlyMessage = "Please enter a valid email address.";
      } else if (error.code === 'auth/user-not-found') {
        friendlyMessage = "No user registered with this email address.";
      }
      setForgotError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmailOrPhone, loginPassword);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      let pData: any = {};
      if (userDoc.exists()) {
        pData = userDoc.data();
      }

      if (pData.studentId && pData.semester && pData.section) {
        onSuccess({
          name: pData.name || userCredential.user.displayName || "Student",
          university: pData.university || "University",
          major: pData.major || "Computer Science & Engineering",
          batch: pData.batch || "1st Batch",
          studentId: pData.studentId,
          section: pData.section,
          semester: pData.semester,
          avatarUrl: pData.avatarUrl || userCredential.user.photoURL || ""
        });
      } else {
        setPendingRegData({
          name: pData.name || userCredential.user.displayName || "Student",
          avatarUrl: pData.avatarUrl || userCredential.user.photoURL || ""
        });
        setShowOnboarding(true);
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      setAuthError("Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
      const regData = {
        name: regName || "Student",
        university: regUniversity || "Varendra University",
        major: "Computer Science & Engineering",
        batch: regBatch || "32nd Batch",
        studentId: regStudentID || "231311070",
        section: regSection || "B",
        semester: regSemester || "8th Semester",
        avatarUrl: ""
      };
      onSuccess(regData);
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
      const result = await googleSignIn();
      if (result && result.user) {
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        
        let pData: any = {};
        if (userDoc.exists()) {
          pData = userDoc.data();
        }

        if (pData.studentId && pData.semester && pData.section) {
          onSuccess({
            name: pData.name || result.user.displayName || "Google User",
            university: pData.university || "Varendra University",
            major: pData.major || "Computer Science & Engineering",
            batch: pData.batch || "32nd Batch",
            studentId: pData.studentId,
            section: pData.section,
            semester: pData.semester,
            avatarUrl: pData.avatarUrl || result.user.photoURL || ""
          });
        } else {
          setPendingRegData({
            name: pData.name || result.user.displayName || "Google User",
            avatarUrl: pData.avatarUrl || result.user.photoURL || ""
          });
          setShowOnboarding(true);
        }
      }
    } catch (error: any) {
      console.error("Google sign in failed:", error);
      setAuthError("Google Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardStudentID || !onboardSemester || !onboardSection) {
      setAuthError("Please fill in all required fields.");
      return;
    }
    const finalData = {
      name: pendingRegData?.name || "Student",
      university: onboardUniversity || "Varendra University",
      major: onboardMajor || "Computer Science & Engineering",
      batch: onboardBatch || "32nd Batch",
      studentId: onboardStudentID,
      section: onboardSection,
      semester: onboardSemester,
      avatarUrl: pendingRegData?.avatarUrl || ""
    };
    onSuccess(finalData);
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans select-none">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-brand-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-brand-secondary/10 blur-[120px] pointer-events-none" />

      {/* Back button */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 glass-card/80 hover:glass-card border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <CampusLogo className="w-16 h-16 mx-auto drop-shadow-md" animate={true} />
        <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">
          Campus OS
        </h2>
        <p className="mt-1.5 text-xs font-black text-brand-primary uppercase tracking-widest flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          One App. Your Entire University Life.
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
          {!showOnboarding && (
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
          )}

          {/* Tab Content */}
          {showOnboarding ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto bg-brand-primary/10 rounded-full flex items-center justify-center mb-3">
                  <GraduationCap className="w-8 h-8 text-brand-primary" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">Complete Your Profile</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">Please provide your academic details to continue.</p>
              </div>

              <form onSubmit={handleOnboardingSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Student ID *
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Hash className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={onboardStudentID}
                      onChange={(e) => setOnboardStudentID(e.target.value)}
                      placeholder="e.g. 231311070"
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Semester *
                    </label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Layers className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={onboardSemester}
                        onChange={(e) => setOnboardSemester(e.target.value)}
                        placeholder="e.g. 8th"
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Section *
                    </label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={onboardSection}
                        onChange={(e) => setOnboardSection(e.target.value)}
                        placeholder="e.g. B"
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-xs font-black uppercase tracking-wider text-white bg-linear-to-r from-brand-primary to-brand-secondary hover:from-brand-primary-dark hover:to-brand-secondary text-white shadow-md shadow-brand-primary/10 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Complete Registration
                  </button>
                </div>
              </form>
            </motion.div>
          ) : activeTab === 'login' ? (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Email or Phone Number
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4.5 w-4.5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      disabled={loading}
                      value={loginEmailOrPhone}
                      onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                      placeholder="Enter your email or phone"
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

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      defaultChecked
                      disabled={loading}
                      className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-slate-300 rounded-sm"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600 font-bold">
                      Remember me
                    </label>
                  </div>

                  <div className="text-xs">
                    <a href="#" onClick={(e) => e.preventDefault()} className="font-extrabold text-brand-primary hover:text-brand-primary-dark">
                      Forgot password?
                    </a>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-xs font-black uppercase tracking-wider text-white bg-brand-primary hover:bg-brand-primary-dark shadow-md shadow-brand-primary/10 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Login to Dashboard"}
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
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={loading}
                  className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 glass-card hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-extrabold text-slate-700 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                >
                  <Chrome className="w-4 h-4 text-red-500" />
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSuccess()}
                  disabled={loading}
                  className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 glass-card hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-extrabold text-slate-700 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                >
                  <Github className="w-4 h-4 text-slate-900" />
                  <span>GitHub</span>
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Student ID
                    </label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Hash className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        required
                        disabled={loading}
                        value={regStudentID}
                        onChange={(e) => setRegStudentID(e.target.value)}
                        placeholder="e.g. 23131105"
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Section
                    </label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Layers className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        required
                        disabled={loading}
                        value={regSection}
                        onChange={(e) => setRegSection(e.target.value)}
                        placeholder="e.g. A"
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Semester
                    </label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <GraduationCap className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        required
                        disabled={loading}
                        value={regSemester}
                        onChange={(e) => setRegSemester(e.target.value)}
                        placeholder="e.g. 6th"
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Batch
                    </label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Layers className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        required
                        disabled={loading}
                        value={regBatch}
                        onChange={(e) => setRegBatch(e.target.value)}
                        placeholder="e.g. 32nd"
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    University Name
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Building2 className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      disabled={loading}
                      value={regUniversity}
                      onChange={(e) => setRegUniversity(e.target.value)}
                      placeholder="e.g. Varendra University"
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
                    {loading ? "Processing..." : "Register & Continue"}
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
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={loading}
                  className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 glass-card hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-extrabold text-slate-700 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                >
                  <Chrome className="w-4 h-4 text-red-500" />
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSuccess()}
                  disabled={loading}
                  className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 glass-card hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-extrabold text-slate-700 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                >
                  <Github className="w-4 h-4 text-slate-900" />
                  <span>GitHub</span>
                </button>
              </div>
            </motion.div>
          )}

          <div className="mt-6 flex justify-center items-center gap-1 text-[11px] font-semibold text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secure background authentication node</span>
          </div>

        </div>
      </div>
    </div>
  );
}
