import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { 
  Moon, 
  Bell, 
  ChevronRight, 
  Code2, 
  LogOut, 
  Lock, 
  Camera, 
  Check, 
  X, 
  Star, 
  Bookmark, 
  Edit3,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  ShieldCheck,
  Percent,
  Eye,
  Upload,
  AlertCircle,
  Loader2,
  KeyRound,
  CheckCircle2,
  Fingerprint,
  ArrowLeft,
  User,
  Mail,
  Phone,
  RefreshCw
} from 'lucide-react';
import { auth } from '../firebase';
import { sendEmailVerification, verifyBeforeUpdateEmail, updatePassword } from 'firebase/auth';


interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile) => void;
  onSignOut?: () => void;
  onNavigate?: (page: string) => void;
  onBack?: () => void;
}

export default function ProfileView({ profile, onUpdateProfile, onSignOut, onNavigate, onBack }: ProfileViewProps) {
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Photo viewer and file uploader states
  const [photoOptionsOpen, setPhotoOptionsOpen] = useState(false);
  const [isViewingPhoto, setIsViewingPhoto] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2-Step Verification states
  const [isTwoStepModalOpen, setIsTwoStepModalOpen] = useState(false);
  const [isTwoStepEnabled, setIsTwoStepEnabled] = useState(profile.mfaEnabled || false);
  const [enrollPhoneNumber, setEnrollPhoneNumber] = useState(profile.mfaPhoneNumber || '');
  const [mfaSetupStep, setMfaSetupStep] = useState<'start' | 'otp' | 'success'>('start');
  const [mfaOtp, setMfaOtp] = useState('');
  const [sentMfaOtp, setSentMfaOtp] = useState('');
  const [mfaSetupError, setMfaSetupError] = useState('');

  // Email verification states
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailVerified, setEmailVerified] = useState(auth.currentUser?.emailVerified || false);

  // Email change states
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState(auth.currentUser?.email || '');
  const [emailChangeSuccess, setEmailChangeSuccess] = useState(false);
  const [emailChangeError, setEmailChangeError] = useState('');

  // Password loading state
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Keep MFA state synced with incoming profile
  useEffect(() => {
    setIsTwoStepEnabled(profile.mfaEnabled || false);
    if (profile.mfaPhoneNumber) {
      setEnrollPhoneNumber(profile.mfaPhoneNumber);
    }
  }, [profile.mfaEnabled, profile.mfaPhoneNumber]);

  // Sync email verified status on load
  useEffect(() => {
    if (auth.currentUser) {
      setEmailVerified(auth.currentUser.emailVerified);
    }
  }, []);

  // Edit form states
  const [editedName, setEditedName] = useState(profile.name);
  const [editedUniversity, setEditedUniversity] = useState(profile.university || 'Varendra University');
  const [editedMajor, setEditedMajor] = useState(profile.major);
  const [editedStudentId, setEditedStudentId] = useState(profile.studentId || 'N/A');
  const [editedBatch, setEditedBatch] = useState(profile.batch || 'N/A');
  const [editedSection, setEditedSection] = useState(profile.section || 'N/A');
  const [editedSemester, setEditedSemester] = useState(profile.semester || 'N/A');
  const [editedAvatarUrl, setEditedAvatarUrl] = useState(profile.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=300&h=300&q=80');
  
  // Extra academic stats for syncing with other views if needed
  const [editedCgpa, setEditedCgpa] = useState(profile.cgpa);
  const [editedTargetCgpa, setEditedTargetCgpa] = useState(profile.targetCgpa);
  const [editedCreditsCompleted, setEditedCreditsCompleted] = useState(profile.creditsCompleted);
  const [editedCreditsTotal, setEditedCreditsTotal] = useState(profile.creditsTotal);
  const [editedAttendance, setEditedAttendance] = useState(profile.attendance);

  // File Upload Event Handler with max 2 MB Firestore simulation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: max 2 MB (2 * 1024 * 1024 bytes)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image size exceeds 2 MB limit. Please select a smaller photo.');
      setPhotoOptionsOpen(true);
      return;
    }

    setUploadError('');
    setIsUploading(true);
    setUploadProgress(10);

    // Simulate Firestore upload progress increments for realistic premium user experience
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 150);

    const reader = new FileReader();
    reader.onloadend = () => {
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        
        const base64String = reader.result as string;
        
        // Directly update profile & trigger persistence in localStorage/Firestore simulation
        onUpdateProfile({
          ...profile,
          avatarUrl: base64String
        });

        setIsUploading(false);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }, 600);
    };

    reader.onerror = () => {
      clearInterval(interval);
      setIsUploading(false);
      setUploadError('Failed to read image file. Please try another photo.');
    };

    reader.readAsDataURL(file);
  };

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Handle toggles

  const handleToggleClassReminders = () => {
    onUpdateProfile({
      ...profile,
      classReminders: profile.classReminders === undefined ? false : !profile.classReminders
    });
  };

  const handleToggleDeadlineReminders = () => {
    onUpdateProfile({
      ...profile,
      deadlineReminders: profile.deadlineReminders === undefined ? false : !profile.deadlineReminders
    });
  };

  // Save profile edits
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name: editedName,
      university: editedUniversity,
      major: editedMajor,
      studentId: editedStudentId,
      batch: editedBatch,
      section: editedSection,
      semester: editedSemester,
      avatarUrl: editedAvatarUrl,
      cgpa: Number(editedCgpa),
      targetCgpa: Number(editedTargetCgpa),
      creditsCompleted: Number(editedCreditsCompleted),
      creditsTotal: Number(editedCreditsTotal),
      attendance: Number(editedAttendance)
    });
    setIsEditModalOpen(false);
  };

  // 1. Email Verification Functions
  const handleSendVerificationEmail = async () => {
    if (!auth.currentUser) return;
    setVerifyingEmail(true);
    setEmailError('');
    try {
      await sendEmailVerification(auth.currentUser);
      setEmailVerificationSent(true);
      setTimeout(() => setEmailVerificationSent(false), 5000);
    } catch (error: any) {
      console.error("Failed to send verification email:", error);
      if (error.code === 'auth/too-many-requests') {
        setEmailError("Too many requests. Please wait a moment before trying again.");
      } else {
        setEmailError(error.message || "Failed to send verification email.");
      }
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleCheckVerificationStatus = async () => {
    if (!auth.currentUser) return;
    setVerifyingEmail(true);
    try {
      await auth.currentUser.reload();
      setEmailVerified(auth.currentUser.emailVerified);
      if (auth.currentUser.emailVerified) {
        alert("Success! Your email address has been verified.");
      } else {
        alert("Your email address is still unverified. Please check your inbox (including spam) for the verification link.");
      }
    } catch (error: any) {
      console.error("Failed to reload user:", error);
      alert("Failed to check status: " + (error.message || error));
    } finally {
      setVerifyingEmail(false);
    }
  };

  // 2. Email Change Function
  const handleChangeEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      setEmailChangeError('Please enter a valid email address.');
      return;
    }
    setEmailChangeError('');
    setVerifyingEmail(true);
    try {
      if (auth.currentUser) {
        await verifyBeforeUpdateEmail(auth.currentUser, newEmail.trim());
        setEmailChangeSuccess(true);
        setTimeout(() => {
          setEmailChangeSuccess(false);
          setIsEmailModalOpen(false);
        }, 4000);
      }
    } catch (error: any) {
      console.error("Failed to verify/update email:", error);
      if (error.code === 'auth/requires-recent-login') {
        setEmailChangeError('This action requires a recent login. Please sign out and sign in again before updating your email.');
      } else {
        setEmailChangeError(error.message || 'Failed to update email address.');
      }
    } finally {
      setVerifyingEmail(false);
    }
  };

  // 3. Password Submission actual Firebase handler
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setPasswordError('Please fill in all fields.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password should be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setPasswordError('');
    setLoadingPassword(true);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        setPasswordSuccess(true);
        setTimeout(() => {
          setPasswordSuccess(false);
          setIsPasswordModalOpen(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }, 2000);
      } else {
        throw new Error('No authenticated user found.');
      }
    } catch (error: any) {
      console.error("Failed to change password:", error);
      if (error.code === 'auth/requires-recent-login') {
        setPasswordError('For security, this action requires a recent login. Please log out and log back in to change your password.');
      } else {
        setPasswordError(error.message || 'Failed to update password.');
      }
    } finally {
      setLoadingPassword(false);
    }
  };

  // 4. MFA Setup Functions
  const handleSendMfaOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollPhoneNumber || enrollPhoneNumber.trim().length < 8) {
      setMfaSetupError('Please enter a valid phone number including area code.');
      return;
    }
    setMfaSetupError('');
    
    // Generate an OTP code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSentMfaOtp(generatedCode);
    setMfaSetupStep('otp');

    // Trigger standard browser alert/toast to make it incredibly easy for the user to copy
    setTimeout(() => {
      alert(`[SMS GATEWAY SIMULATOR]\nVerification code sent to ${enrollPhoneNumber}:\n\nYour 2-Step Verification Code is: ${generatedCode}`);
    }, 500);
  };

  const handleVerifyMfaSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaOtp !== sentMfaOtp) {
      setMfaSetupError('Incorrect verification code. Please check the code and try again.');
      return;
    }
    
    setMfaSetupError('');
    onUpdateProfile({
      ...profile,
      mfaEnabled: true,
      mfaPhoneNumber: enrollPhoneNumber.trim(),
      mfaMethod: 'sms'
    });
    setMfaSetupStep('success');
    setIsTwoStepEnabled(true);
  };

  const handleDisableMfa = () => {
    if (confirm("Are you sure you want to disable 2-Step Verification? Your account will be less secure.")) {
      onUpdateProfile({
        ...profile,
        mfaEnabled: false,
        mfaPhoneNumber: undefined,
        mfaMethod: undefined
      });
      setIsTwoStepEnabled(false);
      setMfaSetupStep('start');
      setMfaOtp('');
      setSentMfaOtp('');
      alert("2-Step Verification has been disabled.");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-sans text-slate-800 pb-24 bg-gradient-to-tr from-pink-50/50 via-indigo-50/20 to-blue-50/40 p-4 md:p-8">
      
      {/* Decorative Blur Spheres to match the gorgeous mockup */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-pink-300/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
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
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <User className="w-8 h-8 text-brand-primary" />
              Student Profile
            </h1>
            <p className="text-slate-500 font-light mt-1">
              Verify credentials, configure advanced preferences, and secure account states.
            </p>
          </div>
        </div>

        {/* Main Grid: Responsive 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* ================= LEFT SIDE: PROFILE CARD & ACCOUNT SETTINGS ================= */}
          <div className="space-y-6">
            
            {/* 1. Main Student Profile Card */}
            <div className="glass-card/80 backdrop-blur-md border border-slate-100 rounded-[3rem] p-8 shadow-sm text-center space-y-6 relative overflow-hidden">
              
              {/* Profile Photo with double rounded ring border */}
              <div className="flex justify-center pt-2">
                <div className="relative group">
                  <div className="w-36 h-36 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-md bg-slate-100 relative">
                    <img 
                      src={profile.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=300&h=300&q=80'} 
                      alt={profile.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <button 
                    onClick={() => setPhotoOptionsOpen(true)}
                    className="absolute bottom-1 right-1 w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all cursor-pointer hover:scale-105"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  
                  {/* Hidden Input element for uploading local storage pictures (max 2MB limit check done in handleFileChange) */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
              </div>

              {/* Name & Student Badge */}
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                  {profile.name}
                </h1>
                
                {/* student badge */}
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-cyan-50 text-cyan-600 text-[10px] font-black uppercase tracking-wider rounded-full border border-cyan-100/50 shadow-3xs">
                  <Bookmark className="w-3.5 h-3.5 text-cyan-500 fill-cyan-500/10" />
                  <span>Student</span>
                </div>
              </div>

              {/* 2x2 Student Coordinates Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/60 border border-slate-100/80 px-4 py-3 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Student ID
                  </span>
                  <span className="text-xs font-black text-slate-700">
                    {profile.studentId || 'N/A'}
                  </span>
                </div>
                
                <div className="bg-slate-50/60 border border-slate-100/80 px-4 py-3 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Batch
                  </span>
                  <span className="text-xs font-black text-slate-700">
                    {profile.batch || 'N/A'}
                  </span>
                </div>

                <div className="bg-slate-50/60 border border-slate-100/80 px-4 py-3 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Section
                  </span>
                  <span className="text-xs font-black text-slate-700">
                    {profile.section || 'N/A'}
                  </span>
                </div>

                <div className="bg-slate-50/60 border border-slate-100/80 px-4 py-3 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Semester
                  </span>
                  <span className="text-xs font-black text-slate-700">
                    {profile.semester || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Department & University Badges */}
              <div className="space-y-2.5 pt-2">
                {/* Department Capsule */}
                <div className="border border-emerald-100 bg-emerald-50/20 px-4 py-2.5 rounded-full flex items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div 
                      className="w-8 h-8 rounded-full overflow-hidden border border-emerald-200 glass-card flex items-center justify-center shrink-0 shadow-3xs"
                    >
                      {profile.departmentLogoUrl ? (
                        <img 
                          src={profile.departmentLogoUrl} 
                          alt="Department Logo" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-[10px] font-black text-emerald-600 uppercase">D</span>
                      )}
                    </div>
                    <span className="text-[11px] font-extrabold text-emerald-800 truncate">
                      {profile.major || 'Department Name'}
                    </span>
                  </div>
                </div>

                {/* University Capsule */}
                <div className="border border-emerald-100 bg-emerald-50/20 px-4 py-2.5 rounded-full flex items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div 
                      className="w-8 h-8 rounded-full overflow-hidden border border-emerald-200 glass-card flex items-center justify-center shrink-0 shadow-3xs"
                    >
                      {profile.universityLogoUrl ? (
                        <img 
                          src={profile.universityLogoUrl} 
                          alt="University Logo" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-[10px] font-black text-emerald-600 uppercase">U</span>
                      )}
                    </div>
                    <span className="text-[11px] font-extrabold text-emerald-800 truncate">
                      {profile.university || 'University Name'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Student ID Verified Card (Digital ID Verified from image) - Placed below Department & University */}
              <div id="digital-id-verified-card" className="border border-slate-800 rounded-[1.5rem] p-4 flex items-center gap-3.5 text-left glass-card/80 backdrop-blur-xs shadow-2xs">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100 shadow-3xs">
                  <svg className="w-5.5 h-5.5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.9c0-.737.545-1.365 1.282-1.444A13.917 13.917 0 0010 2a13.916 13.916 0 006.552 1.456c.737.08 1.282.707 1.282 1.444v3.136a10.938 10.938 0 01-5.093 9.188.75.75 0 01-.74 0A10.938 10.938 0 012.166 8.035V4.9zm10.53 3.33a.75.75 0 00-1.06-1.06L9 9.88 8.364 9.244a.75.75 0 00-1.06 1.06l1.1 1.1a.75.75 0 001.06 0l3.232-3.233z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800 tracking-tight leading-tight">
                    Digital ID Verified
                  </h4>
                  <p className="text-xs text-slate-400 font-semibold leading-normal mt-0.5">
                    Campus OS cryptographic validation pass.
                  </p>
                </div>
              </div>

            </div>

            {/* 2. Account Settings Menu */}
            <div className="space-y-3 text-left">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3 block">
                Account Settings
              </span>

              <div className="glass-card/80 backdrop-blur-md border border-slate-100 rounded-3xl p-3.5 space-y-1.5 shadow-2xs">
                {/* Email Verification Row */}
                <div className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50/80 transition-all text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-bold text-slate-700 block">
                        Email Verification
                      </span>
                      <span className="text-xs font-semibold text-slate-400 block truncate max-w-[140px] sm:max-w-[200px]">
                        {auth.currentUser?.email || 'No email associated'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    {emailVerified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider rounded-full border border-emerald-100 shadow-3xs">
                        <Check className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={handleSendVerificationEmail}
                          disabled={verifyingEmail}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full transition-all disabled:opacity-50"
                        >
                          {verifyingEmail ? 'Sending...' : 'Verify Now'}
                        </button>
                        <button
                          onClick={handleCheckVerificationStatus}
                          disabled={verifyingEmail}
                          title="Check Verification Status"
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100/80 transition-all"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${verifyingEmail ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Change Email Row */}
                <button 
                  onClick={() => setIsEmailModalOpen(true)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50/80 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-700 block group-hover:text-slate-900 transition-colors">
                        Change Email Address
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 2-Step Verification Row */}
                <button 
                  onClick={() => setIsTwoStepModalOpen(true)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50/80 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-700 block group-hover:text-slate-900 transition-colors">
                        2-Step Verification
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 shrink-0">
                    {profile.mfaEnabled ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider rounded-full border border-emerald-100 shadow-3xs">
                        <Check className="w-3 h-3" /> Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wider rounded-full border border-amber-100 shadow-3xs">
                        Disabled
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* Change Password Row */}
                <button 
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50/80 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-700 block group-hover:text-slate-900 transition-colors">
                        Change Password
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

          </div>

          {/* ================= RIGHT SIDE: SETTINGS & PREFERENCES ================= */}
          <div className="space-y-6">
            
            {/* 3. Settings & Preferences Menu */}
            <div className="space-y-3 text-left">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3 block">
                Settings & Preferences
              </span>

              <div className="glass-card/80 backdrop-blur-md border border-slate-100 rounded-[2.5rem] p-5 space-y-4 shadow-sm">

                {/* Class Reminders Toggle */}
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center shrink-0">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-700 block">
                        Class Reminders
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        {profile.classReminders !== false ? 'On' : 'Off'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Switch toggle */}
                  <button 
                    onClick={handleToggleClassReminders}
                    className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-300 cursor-pointer outline-hidden shrink-0 ${
                      profile.classReminders !== false ? 'bg-indigo-500' : 'bg-slate-200'
                    }`}
                  >
                    <div className={`w-5.5 h-5.5 rounded-full bg-white shadow-xs transition-transform duration-300 ${
                      profile.classReminders !== false ? 'translate-x-5.5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="h-px bg-slate-100/80" />

                {/* Deadline Reminders Toggle */}
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div className="pr-2">
                      <span className="text-sm font-bold text-slate-700 block">
                        Deadline Reminders
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium block leading-tight">
                        Reminds 1 day before CT / Assignment
                      </span>
                    </div>
                  </div>
                  
                  {/* Switch toggle */}
                  <button 
                    onClick={handleToggleDeadlineReminders}
                    className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-300 cursor-pointer outline-hidden shrink-0 ${
                      profile.deadlineReminders !== false ? 'bg-indigo-500' : 'bg-slate-200'
                    }`}
                  >
                    <div className={`w-5.5 h-5.5 rounded-full bg-white shadow-xs transition-transform duration-300 ${
                      profile.deadlineReminders !== false ? 'translate-x-5.5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="h-px bg-slate-100/80" />

                {/* About Developers Link */}
                <button 
                  onClick={() => onNavigate && onNavigate('about_developers')}
                  className="w-full flex items-center justify-between py-1 rounded-2xl hover:bg-slate-50/50 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-700 block group-hover:text-slate-900 transition-colors">
                        About Developers
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                </button>

              </div>
            </div>

            {/* 4. Giant Logout / Sign Out Button */}
            {onSignOut && (
              <button 
                onClick={onSignOut}
                className="w-full glass-card hover:bg-slate-50 text-rose-500 font-black text-sm uppercase tracking-wider py-4.5 rounded-[2rem] shadow-xs border border-slate-100 flex items-center justify-center gap-2.5 transition-all cursor-pointer hover:shadow-md hover:scale-[1.01]"
              >
                <LogOut className="w-5 h-5 text-rose-500" />
                <span>Sign Out</span>
              </button>
            )}

          </div>

        </div>

      </div>

      {/* ================= PHOTO OPTIONS MODAL OVERLAY ================= */}
      <AnimatePresence>
        {photoOptionsOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-[2.5rem] border border-slate-100 shadow-2xl p-6 w-full max-w-sm text-center space-y-6 relative"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                  Profile Photo
                </span>
                <button 
                  onClick={() => setPhotoOptionsOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {uploadError && (
                <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100 flex items-start gap-2 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {isUploading ? (
                <div className="py-8 space-y-4">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Uploading Photo</h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Syncing secure Firestore connection {uploadProgress}%</p>
                  </div>
                  <div className="relative w-full h-3.5 bg-slate-100/70 border border-slate-200 rounded-full p-0.5 shadow-3xs overflow-hidden flex items-center">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {/* View Photo Option */}
                  <button
                    onClick={() => {
                      setIsViewingPhoto(true);
                      setPhotoOptionsOpen(false);
                    }}
                    className="w-full flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-150/60 hover:border-indigo-100 transition-all text-left group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/50 group-hover:scale-105 transition-transform">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-black text-slate-700 block group-hover:text-indigo-600 transition-colors">
                        1. View Photo
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold block">
                        Display your current profile picture
                      </span>
                    </div>
                  </button>

                  {/* Upload Photo Option */}
                  <button
                    onClick={() => {
                      setPhotoOptionsOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="w-full flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-150/60 hover:border-emerald-100 transition-all text-left group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/50 group-hover:scale-105 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-black text-slate-700 block group-hover:text-emerald-600 transition-colors">
                        2. Upload a Photo
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold block">
                        Pick from local storage (max 2 MB)
                      </span>
                    </div>
                  </button>
                </div>
              )}

              <button
                onClick={() => setPhotoOptionsOpen(false)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 text-xs font-black uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= VIEW PHOTO MODAL OVERLAY ================= */}
      <AnimatePresence>
        {isViewingPhoto && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-sm w-full glass-card/10 p-2.5 rounded-[3.5rem] border border-white/20 shadow-2xl"
            >
              {/* Profile Image Display */}
              <div className="w-full aspect-square rounded-[3rem] overflow-hidden border-4 border-white shadow-lg bg-slate-100">
                <img 
                  src={profile.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=300&h=300&q=80'} 
                  alt={profile.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Close Button overlay */}
              <button
                onClick={() => setIsViewingPhoto(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900 transition-all cursor-pointer border border-white/20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center pt-4 pb-2">
                <h4 className="text-sm font-black text-white uppercase tracking-wider">{profile.name}</h4>
                <p className="text-xs text-white/60 font-bold mt-0.5">{profile.studentId || 'N/A'}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= 2-STEP VERIFICATION MODAL OVERLAY ================= */}
      <AnimatePresence>
        {isTwoStepModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-[2.5rem] border border-slate-100 shadow-2xl p-6 md:p-8 w-full max-w-md text-left space-y-6 animate-none"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/50">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-md font-black text-slate-800 tracking-tight leading-none">
                      2-Step Verification
                    </h3>
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 mt-1 block">
                      Secure Student Credentials
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsTwoStepModalOpen(false)}
                  className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Banner */}
              <div className={`p-4 rounded-2xl flex items-center gap-3.5 border transition-all duration-300 ${
                profile.mfaEnabled 
                  ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' 
                  : 'bg-amber-50/50 border-amber-100 text-amber-800'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  profile.mfaEnabled 
                    ? 'bg-emerald-100 border-emerald-200 text-emerald-600' 
                    : 'bg-amber-100 border-amber-200 text-amber-600'
                }`}>
                  <Fingerprint className="w-5.5 h-5.5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest leading-none">
                    Status: {profile.mfaEnabled ? 'Active Protection' : 'Inactive'}
                  </h4>
                  <p className="text-[10px] font-semibold text-slate-400 leading-normal mt-1">
                    {profile.mfaEnabled 
                      ? `SMS Verification is active on ${profile.mfaPhoneNumber}. Every login will require verification.` 
                      : 'Enable SMS 2-Step Verification to defend your university records.'}
                  </p>
                </div>
              </div>

              {/* MFA Interactive Setup Flows */}
              {profile.mfaEnabled ? (
                // Enabled state
                <div className="space-y-4">
                  <div className="bg-slate-50/80 border border-slate-100 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-black text-slate-700">SMS MFA (Mobile)</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md">
                        Primary
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-bold">
                      Phone Number: <span className="font-extrabold text-slate-800">{profile.mfaPhoneNumber}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleDisableMfa}
                    className="w-full py-3 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 text-xs font-black uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
                  >
                    Disable 2-Step Verification
                  </button>
                </div>
              ) : (
                // Setup states
                <div>
                  {mfaSetupStep === 'start' && (
                    <form onSubmit={handleSendMfaOtp} className="space-y-4">
                      {mfaSetupError && (
                        <div className="p-3 bg-rose-50 text-rose-500 rounded-xl text-xs font-bold border border-rose-100">
                          {mfaSetupError}
                        </div>
                      )}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block pl-1">
                          Phone Number (with Country Code)
                        </label>
                        <input 
                          type="text" 
                          value={enrollPhoneNumber}
                          onChange={(e) => setEnrollPhoneNumber(e.target.value)}
                          placeholder="+880 1700-000000"
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:glass-card focus:border-emerald-500 outline-hidden transition-all"
                        />
                        <span className="text-[10px] text-slate-400 font-medium block pl-1">
                          Enter your mobile number where verification codes will be dispatched.
                        </span>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer"
                      >
                        Send Verification Code
                      </button>
                    </form>
                  )}

                  {mfaSetupStep === 'otp' && (
                    <form onSubmit={handleVerifyMfaSetup} className="space-y-4">
                      {mfaSetupError && (
                        <div className="p-3 bg-rose-50 text-rose-500 rounded-xl text-xs font-bold border border-rose-100">
                          {mfaSetupError}
                        </div>
                      )}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block pl-1">
                          Enter 6-Digit Code
                        </label>
                        <input 
                          type="text" 
                          maxLength={6}
                          value={mfaOtp}
                          onChange={(e) => setMfaOtp(e.target.value)}
                          placeholder="000000"
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-black text-center tracking-widest text-slate-700 focus:glass-card focus:border-emerald-500 outline-hidden transition-all font-mono"
                        />
                        <span className="text-[10px] text-slate-400 font-medium block text-center mt-1">
                          Type the verification code dispatched to <span className="font-bold text-slate-600">{enrollPhoneNumber}</span>.
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setMfaSetupStep('start')}
                          className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer"
                        >
                          Verify & Enable
                        </button>
                      </div>
                    </form>
                  )}

                  {mfaSetupStep === 'success' && (
                    <div className="py-6 text-center space-y-4">
                      <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-100 shadow-3xs">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">MFA Activated</h4>
                        <p className="text-xs text-slate-400 font-semibold leading-normal mt-1">
                          Campus OS has enabled 2-Step SMS Verification successfully.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setIsTwoStepModalOpen(false);
                          setMfaSetupStep('start');
                        }}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
                      >
                        Got It
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Actions Footer */}
              {mfaSetupStep !== 'success' && (
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsTwoStepModalOpen(false);
                      setMfaSetupStep('start');
                      setMfaOtp('');
                      setSentMfaOtp('');
                      setMfaSetupError('');
                    }}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer w-full text-center"
                  >
                    Close Settings
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= EMAIL CHANGE MODAL OVERLAY ================= */}
      <AnimatePresence>
        {isEmailModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-[2.5rem] border border-slate-100 shadow-2xl p-6 md:p-8 w-full max-w-md text-left space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">
                    Change Email Address
                  </h3>
                </div>
                <button 
                  onClick={() => setIsEmailModalOpen(false)}
                  className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form / Success Status */}
              {emailChangeSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight font-sans">Verification Dispatched</h4>
                  <p className="text-xs text-slate-400 font-semibold leading-normal">
                    We have dispatched a verification email to <span className="font-bold text-slate-600">{newEmail}</span>. Please click the link inside to verify and execute the update!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleChangeEmailSubmit} className="space-y-4">
                  {emailChangeError && (
                    <div className="p-3 bg-rose-50 text-rose-500 rounded-xl text-xs font-bold border border-rose-100">
                      {emailChangeError}
                    </div>
                  )}

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block pl-1">
                      New Email Address
                    </label>
                    <input 
                      type="email" 
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="student@university.edu"
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:glass-card focus:border-blue-500 outline-hidden transition-all"
                    />
                    <span className="text-[10px] text-slate-400 font-medium block pl-1 mt-1">
                      For safety, we will dispatch a verification link to confirm the new address before performing the profile sync.
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsEmailModalOpen(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={verifyingEmail}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {verifyingEmail ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Verify & Update
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= PASSWORD CHANGE MODAL OVERLAY ================= */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-[2.5rem] border border-slate-100 shadow-2xl p-6 md:p-8 w-full max-w-md text-left space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">
                    Change Password
                  </h3>
                </div>
                <button 
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              {passwordSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Password Updated</h4>
                  <p className="text-xs text-slate-400 font-medium">Your cryptographic password has been updated successfully!</p>
                </div>
              ) : (
                <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                  {passwordError && (
                    <div className="p-3 bg-rose-50 text-rose-500 rounded-xl text-xs font-bold border border-rose-100">
                      {passwordError}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block pl-1">
                      Current Password
                    </label>
                    <input 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:glass-card focus:border-purple-500 outline-hidden transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block pl-1">
                      New Password
                    </label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:glass-card focus:border-purple-500 outline-hidden transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block pl-1">
                      Confirm New Password
                    </label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:glass-card focus:border-purple-500 outline-hidden transition-all"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsPasswordModalOpen(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loadingPassword}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {loadingPassword ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Save Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
