import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Folder, 
  FileText, 
  Search, 
  Cloud, 
  RefreshCw, 
  Grid, 
  List, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  ArrowLeft, 
  LogOut, 
  Sparkles, 
  Eye, 
  ExternalLink, 
  Calendar, 
  HardDrive,
  Maximize2,
  X,
  BookOpen,
  ChevronRight,
  Bookmark
} from 'lucide-react';
import { initAuth, connectGoogleDrive, logout, getAccessToken } from '../firebase';
import { User } from 'firebase/auth';
import { DriveFile, fetchGoogleDriveFiles, fetchPresentationText } from '../services/googleDrive';

import { UserProfile } from '../types';

interface DocumentsViewProps {
  onBack?: () => void;
  profile?: UserProfile;
  onUpdateProfile?: (profile: UserProfile) => void;
}

export default function DocumentsView({ onBack, profile, onUpdateProfile }: DocumentsViewProps) {
  // Authentication states
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Drive and API states
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active view states
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(1);

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
        setNeedsAuth(false);
        fetchDriveFiles(currentToken, profile?.publicDriveFolderId);
      },
      () => {
        setNeedsAuth(true);
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, [profile?.publicDriveFolderId]);

  // Handle Sign In
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMessage(null);
    try {
      const result = await connectGoogleDrive();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setNeedsAuth(false);
        fetchDriveFiles(result.accessToken, profile?.publicDriveFolderId);
      }
    } catch (err: any) {
      console.error('Google Drive sign-in failed:', err);
      setErrorMessage(err.message || 'OAuth authentication failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    if (window.confirm('Disconnect Google Drive and log out?')) {
      await logout();
      setFiles([]);
      setSelectedFile(null);
      setAiSummary(null);
    }
  };

  // Fetch presentation files from Google Drive
  const fetchDriveFiles = async (accessToken: string, folderId?: string) => {
    setLoadingFiles(true);
    setErrorMessage(null);
    try {
      const filesList = await fetchGoogleDriveFiles(accessToken, folderId);
      setFiles(filesList);
    } catch (err: any) {
      console.error('Error fetching Google Drive files:', err);
      if (err.message === 'UNAUTHORIZED') {
        // Token expired, re-trigger login state
        setNeedsAuth(true);
      } else {
        setErrorMessage('Could not load your slides. Ensure you have granted Google Drive read permissions.');
      }
    } finally {
      setLoadingFiles(false);
    }
  };

  // AI Summarization: Reads the slide deck content via Slides API and summarizes it
  const handleAiSummarize = async (file: DriveFile) => {
    if (!token) return;
    setLoadingSummary(true);
    setAiSummary(null);
    try {
      let extractedText = '';

      if (file.mimeType === 'application/vnd.google-apps.presentation') {
        extractedText = await fetchPresentationText(file.id, token);
      } else {
        // PDF fallback
        extractedText = `Document Name: ${file.name}\nType: PDF Document.\nPlease review this PDF slide file for core learning concepts.`;
      }

      if (!extractedText.trim()) {
        extractedText = `No direct slide text found or could be read in presentation: "${file.name}". Generate outline instead.`;
      }

      // Call server-side Gemini Proxy for Summarization
      const apiResponse = await fetch('/api/gemini/notes-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'summarize',
          content: extractedText,
          docName: file.name,
        }),
      });

      if (!apiResponse.ok) {
        throw new Error('Failed to contact Gemini summarizer server.');
      }

      const apiData = await apiResponse.json();
      setAiSummary(apiData.result || 'No summary could be constructed at this time.');
    } catch (err: any) {
      console.error('Error compiling AI slide summary:', err);
      setAiSummary(`Could not compile AI summary: ${err.message || 'Request failed'}`);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Filter local file items based on search input
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // File categories for visual filters
  const getFileTypeLabel = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.presentation') {
      return 'Google Slides';
    }
    if (mimeType === 'application/pdf') {
      return 'PDF Document';
    }
    return 'Other Slide';
  };

  // Format date helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto font-sans text-left">
      
      {/* 1. Header with back controls and connection state */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-3">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-2.5 rounded-2xl border border-slate-200 glass-card text-slate-500 hover:text-slate-800 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer shadow-3xs"
                title="Back to Dashboard"
                id="slide-manager-back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Folder className="w-8 h-8 text-blue-500 shrink-0" />
                AI Slide Manager
              </h1>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">
                Powered by Google Drive & Slides API
              </p>
            </div>
          </div>
          <p className="text-slate-500 text-xs font-medium mt-2 max-w-2xl leading-relaxed">
            Directly browse, view, and analyze slides from your Google Drive with zero local storage overhead. Powered with secure Google Slides text extraction and automated Gemini insights.
          </p>
        </div>

        {/* Connection state button */}
        {!needsAuth && user && (
          <div className="flex items-center gap-3">
            <div className="glass-card border border-slate-200 rounded-2xl p-2.5 flex items-center gap-2.5 shadow-3xs">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-6 h-6 rounded-full referrerPolicy='no-referrer'" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="text-left leading-none">
                <p className="text-[11px] font-black text-slate-800 truncate max-w-[120px]">{user.displayName || 'Connected Student'}</p>
                <p className="text-[9px] font-bold text-slate-400 truncate max-w-[120px]">{user.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 cursor-pointer transition-all active:scale-95 flex items-center justify-center shadow-3xs"
              title="Sign Out & Disconnect"
              id="drive-disconnect-btn"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Error Message banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-700 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Google API Connection Notice</p>
            <p className="font-medium opacity-90">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* 3. Authentication state screen */}
      {needsAuth ? (
        <div className="glass-card border border-slate-150 rounded-3xl p-8 md:p-12 text-center max-w-xl mx-auto space-y-6 shadow-3xs">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto border border-blue-100/50">
            <Cloud className="w-10 h-10 animate-bounce" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-800">Connect Google Workspace</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
              To browse slides directly from your Google Drive, we need your permission. You can connect using any Google Workspace account of your choice securely via official Firebase OAuth credentials.
            </p>
          </div>

          <div className="pt-2">
            {/* Styled Google Sign in Button conforming to rules */}
            <button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-3 mx-auto shadow-md shadow-slate-950/15 hover:shadow-lg hover:bg-slate-800 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              id="google-sign-in-button"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting Securely...</span>
                </>
              ) : (
                <>
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 shrink-0">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  <span>Connect Google Drive</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-[11px] text-slate-400 font-medium">
            🔒 Fully encrypted. Campus OS accesses your presentation slides in <span className="font-bold text-slate-600">Read-Only</span> mode and never alters your Google Workspace directories.
          </div>
        </div>
      ) : (
        /* 4. Authenticated Drive View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main workspace (Grid listing of slides) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Toolbar search and fetch */}
            <div className="flex flex-col gap-3 glass-card border border-slate-150 p-3 rounded-2xl shadow-3xs">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter lecture slides by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/50 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 focus:glass-card transition-all text-slate-700 placeholder:text-slate-400"
                  />
                </div>

                <button
                  onClick={() => fetchDriveFiles(token!, profile?.publicDriveFolderId)}
                  disabled={loadingFiles}
                  className="w-full sm:w-auto px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingFiles ? 'animate-spin' : ''}`} />
                  <span>Sync List</span>
                </button>
              </div>

              {/* Public Drive Folder Link input */}
              <div className="flex flex-col sm:flex-row items-center gap-3 border-t border-slate-100 pt-3">
                <div className="relative flex-1 w-full">
                  <Folder className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Paste a public Google Drive folder URL to fetch slides from..."
                    value={profile?.publicDriveFolderUrl || ''}
                    onChange={(e) => {
                      const url = e.target.value;
                      const match = url.match(/folders\/([a-zA-Z0-9-_]+)/) || url.match(/id=([a-zA-Z0-9-_]+)/);
                      const folderId = match ? match[1] : undefined;
                      if (onUpdateProfile && profile) {
                        onUpdateProfile({
                          ...profile,
                          publicDriveFolderUrl: url,
                          publicDriveFolderId: folderId
                        });
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/50 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 focus:glass-card transition-all text-slate-700 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* List vs Grid files */}
            {loadingFiles ? (
              <div className="py-24 text-center space-y-4">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Listing Workspace files...</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="glass-card border border-slate-150 rounded-3xl p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 flex items-center justify-center rounded-2xl mx-auto border border-slate-100">
                  <HardDrive className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm text-slate-700">No Slides Found</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    We couldn't find any presentation files (.gslides) or PDF slides in your Google Drive root folders.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredFiles.map((file) => {
                  const isSelected = selectedFile?.id === file.id;
                  const isSlides = file.mimeType === 'application/vnd.google-apps.presentation';

                  return (
                    <motion.div
                      key={file.id}
                      onClick={() => {
                        setSelectedFile(file);
                        setAiSummary(null);
                      }}
                      whileHover={{ y: -2 }}
                      className={`bg-white border p-4.5 rounded-2xl shadow-3xs cursor-pointer flex flex-col justify-between gap-4 transition-all ${
                        isSelected 
                          ? 'border-blue-500 ring-2 ring-blue-500/10' 
                          : 'border-slate-150 hover:border-slate-200'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className={`p-2.5 rounded-xl shrink-0 ${
                            isSlides ? 'bg-amber-50 text-amber-500' : 'bg-rose-50 text-rose-500'
                          }`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-50 border border-slate-150 text-slate-400">
                            {isSlides ? 'Slides' : 'PDF'}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-extrabold text-sm text-slate-800 line-clamp-2 leading-snug">
                            {file.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-2.5 text-[10px] font-bold text-slate-400">
                            <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-300" />
                            <span>Created {formatDate(file.createdTime)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[10px] font-bold font-mono text-slate-400">
                          {file.size ? `${(parseInt(file.size) / (1024 * 1024)).toFixed(1)} MB` : 'Cloud Doc'}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-black text-blue-600 flex items-center gap-1 hover:underline">
                            View Workspace
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Side panel: Slide Viewer and Summarizer */}
          <div className="lg:col-span-4 space-y-6">
            
            {selectedFile ? (
              <div className="glass-card border border-slate-150 rounded-3xl p-5 space-y-5 shadow-sm sticky top-6">
                
                {/* Panel Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">Active Slide Panel</span>
                    <h2 className="text-sm font-black text-slate-800 line-clamp-2 leading-tight">{selectedFile.name}</h2>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedFile(null);
                      setAiSummary(null);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Embedded Viewer Core */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                    Interactive Slides Viewer
                  </span>

                  <div className="relative aspect-video w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-200">
                    {selectedFile.mimeType === 'application/vnd.google-apps.presentation' ? (
                      <iframe
                        src={`https://docs.google.com/presentation/d/${selectedFile.id}/embed?start=false&loop=false&delayms=3000`}
                        className="w-full h-full border-0"
                        allowFullScreen
                        title="Google Slides Viewer"
                      />
                    ) : (
                      // PDF Embed or image preview
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center bg-slate-950 text-white">
                        <FileText className="w-8 h-8 text-rose-400" />
                        <span className="text-xs font-bold truncate max-w-full px-2">{selectedFile.name}</span>
                        <p className="text-[10px] text-slate-400 font-medium">Inline PDF viewer requires direct browser access.</p>
                        <a
                          href={selectedFile.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-[10px] font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Open PDF in New Tab
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 font-mono">ID: {selectedFile.id.substring(0, 10)}...</span>
                    
                    <a
                      href={selectedFile.webViewLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-black text-blue-500 hover:text-blue-600 flex items-center gap-1"
                    >
                      <span>Google Slide App</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* AI Study summarization option */}
                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                      Gemini Slide Summarizer
                    </span>
                    
                    {!aiSummary && (
                      <button
                        onClick={() => handleAiSummarize(selectedFile)}
                        disabled={loadingSummary}
                        className="px-3.5 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-[10px] font-black tracking-wider uppercase flex items-center gap-1 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {loadingSummary ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            Summarize Slide
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {loadingSummary && (
                    <div className="p-4 bg-pink-50/50 border border-pink-100 rounded-2xl space-y-2 text-center py-6">
                      <div className="w-6 h-6 border-2 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto" />
                      <p className="text-[11px] font-bold text-pink-600">Extracting slide components & analyzing...</p>
                    </div>
                  )}

                  {aiSummary && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4.5 bg-slate-900 text-slate-100 rounded-2xl space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin text-xs leading-relaxed font-medium"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-bold text-pink-400 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          AI Notes Summary
                        </span>
                        <button
                          onClick={() => handleAiSummarize(selectedFile)}
                          className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 font-bold"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Regenerate
                        </button>
                      </div>

                      <div className="whitespace-pre-wrap text-slate-300 font-sans">
                        {aiSummary}
                      </div>
                    </motion.div>
                  )}
                </div>

              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-8 text-center text-slate-400 py-24 space-y-2">
                <Bookmark className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="font-bold text-xs text-slate-600">No Slide Selected</h4>
                <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                  Select any slide presentation file from the list to preview slides and extract AI lecture notes instantly.
                </p>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
