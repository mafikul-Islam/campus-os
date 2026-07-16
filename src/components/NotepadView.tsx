import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';
import { jsPDF } from 'jspdf';
import { 
  ArrowLeft, 
  Plus, 
  Pin, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Search, 
  FileText, 
  Clock, 
  Check,
  Sparkles,
  BookOpen,
  Download
} from 'lucide-react';

export interface NotepadNote {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: number;
}

interface NotepadViewProps {
  onBack?: () => void;
}

export default function NotepadView({ onBack }: NotepadViewProps) {
  const [screen, setScreen] = useState<'list' | 'add' | 'edit'>('list');
  const [notes, setNotes] = useState<NotepadNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Success message feedback
  const [feedback, setFeedback] = useState<string | null>(null);

  // Fetch notes with onSnapshot for real-time syncing
  useEffect(() => {
    const q = query(collection(db, 'notepad_notes'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotes: NotepadNote[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetchedNotes.push({
          id: docSnap.id,
          title: data.title || '',
          content: data.content || '',
          isPinned: !!data.isPinned,
          createdAt: data.createdAt || Date.now(),
        });
      });
      setNotes(fetchedNotes);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notes from Firestore:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const triggerFeedback = (message: string) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Add a new note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteContent.trim()) return;

    try {
      const newNote = {
        title: noteTitle.trim() || 'Untitled Note',
        content: noteContent.trim(),
        isPinned: false,
        createdAt: Date.now()
      };

      await addDoc(collection(db, 'notepad_notes'), newNote);
      
      // Reset form and return to list
      setNoteTitle('');
      setNoteContent('');
      setScreen('list');
      triggerFeedback('Note successfully saved!');
    } catch (err) {
      console.error("Error adding note to Firestore:", err);
    }
  };

  // Edit note - load into form
  const startEditNote = (note: NotepadNote) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setScreen('edit');
  };

  // Update existing note
  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNoteId) return;

    try {
      const noteDocRef = doc(db, 'notepad_notes', editingNoteId);
      await updateDoc(noteDocRef, {
        title: noteTitle.trim() || 'Untitled Note',
        content: noteContent.trim(),
        updatedAt: Date.now()
      });

      setNoteTitle('');
      setNoteContent('');
      setEditingNoteId(null);
      setScreen('list');
      triggerFeedback('Note successfully updated!');
    } catch (err) {
      console.error("Error updating note in Firestore:", err);
    }
  };

  // Delete note
  const handleDeleteNote = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await deleteDoc(doc(db, 'notepad_notes', id));
      triggerFeedback('Note deleted successfully');
    } catch (err) {
      console.error("Error deleting note from Firestore:", err);
    }
  };

  // Toggle pin
  const handleTogglePin = async (note: NotepadNote) => {
    try {
      const noteDocRef = doc(db, 'notepad_notes', note.id);
      await updateDoc(noteDocRef, {
        isPinned: !note.isPinned
      });
      triggerFeedback(note.isPinned ? 'Note unpinned' : 'Note pinned to top!');
    } catch (err) {
      console.error("Error pinning note in Firestore:", err);
    }
  };

  // Sort notes: pinned ones first, then by creation date descending
  const processedNotes = [...notes]
    .filter(note => 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.createdAt - a.createdAt;
    });

  // Format date helper
  const formatNoteDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleDownloadPDF = (title: string, content: string) => {
    try {
      const doc = new jsPDF();
      
      // Page styling
      doc.setFillColor(248, 250, 252); // Soft background off-white
      doc.rect(0, 0, 210, 297, "F");
      
      // Header Banner
      doc.setFillColor(108, 99, 255); // Purple brand color
      doc.rect(0, 0, 210, 40, "F");
      
      // Title text inside banner
      doc.setTextColor(255, 255, 255);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(22);
      doc.text("CAMPUS OS STUDY GUIDE", 15, 22);
      
      // Subtitle
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.text("AUTO-GENERATED ACADEMIC REVISION MATERIAL", 15, 30);
      
      // Content Box Frame
      doc.setDrawColor(226, 232, 240); // slate-200 border
      doc.setFillColor(255, 255, 255); // White background
      doc.roundedRect(10, 48, 190, 235, 3, 3, "FD");
      
      // Document Title
      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.text(title.toUpperCase(), 15, 60);
      
      // Divider line
      doc.setDrawColor(108, 99, 255);
      doc.setLineWidth(0.5);
      doc.line(15, 65, 195, 65);
      
      // Date footer in content block
      doc.setTextColor(148, 163, 184); // slate-400
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(8);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 71);
      
      // Body Text Formatting (with auto word wrap)
      doc.setTextColor(51, 65, 85); // slate-700
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10.5);
      
      const splitText = doc.splitTextToSize(content, 180);
      let yOffset = 80;
      const pageHeight = 270;
      
      splitText.forEach((line: string) => {
        if (yOffset > pageHeight) {
          doc.addPage();
          // Reset page setup
          doc.setFillColor(248, 250, 252);
          doc.rect(0, 0, 210, 297, "F");
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(10, 10, 190, 275, 3, 3, "FD");
          yOffset = 25;
        }
        doc.text(line, 15, yOffset);
        yOffset += 6.5; // Line spacing
      });
      
      // Save document
      doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_study_guide.pdf`);
      triggerFeedback('PDF study guide downloaded!');
    } catch (e) {
      console.error("PDF generation failed:", e);
      triggerFeedback('Failed to generate PDF. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 text-left font-sans">
      
      {/* Toast Alert Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{feedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen 1: Notes List */}
      {screen === 'list' && (
        <div className="max-w-md mx-auto p-4 md:p-6 space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBack && (
                <button 
                  onClick={onBack}
                  className="p-2 rounded-xl border border-slate-200 glass-card text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer shadow-3xs"
                  id="notepad-back-button"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                  My NotePad
                </h1>
                <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest">
                  Firestore Connected
                </p>
              </div>
            </div>

            <button 
              onClick={() => {
                setNoteTitle('');
                setNoteContent('');
                setScreen('add');
              }}
              className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Note
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search saved notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 glass-card border border-slate-200/80 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-400 transition-all placeholder:text-slate-400 text-slate-700"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Loading Indicator */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
              <span className="text-xs font-bold uppercase tracking-wider">Syncing with Cloud...</span>
            </div>
          ) : processedNotes.length === 0 ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-16 h-16 bg-pink-50 text-pink-400 flex items-center justify-center rounded-3xl mx-auto border border-pink-100/50">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-700">No Notes Found</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto font-light leading-relaxed">
                  {searchQuery ? "No notes matched your search query. Try another keyword!" : "Write down lecture highlights, personal goals or study targets and secure them in the cloud!"}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {processedNotes.map((note) => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white border p-4.5 rounded-3xl shadow-3xs flex flex-col justify-between gap-3 relative overflow-hidden group transition-all duration-200 ${
                    note.isPinned 
                      ? 'border-pink-200 bg-linear-to-b from-pink-50/20 to-white shadow-2xs' 
                      : 'border-slate-150/80 hover:border-slate-300'
                  }`}
                >
                  {/* Top line with title and Pin */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-sm text-slate-800 leading-tight truncate">
                        {note.title}
                      </h3>
                      
                      {/* Timestamp showing exactly when it was written */}
                      <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 mt-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-300 shrink-0" />
                        {formatNoteDate(note.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleTogglePin(note)}
                        className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                          note.isPinned 
                            ? 'bg-pink-500/10 text-pink-600' 
                            : 'text-slate-300 hover:text-slate-500 hover:bg-slate-50'
                        }`}
                        title={note.isPinned ? 'Unpin note' : 'Pin note'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Body Text */}
                  <p className="text-xs text-slate-500 font-medium leading-relaxed whitespace-pre-wrap line-clamp-4">
                    {note.content}
                  </p>

                  {/* Actions line */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleDownloadPDF(note.title, note.content)}
                      className="mr-auto px-2.5 py-1.5 bg-pink-50 hover:bg-pink-100/80 text-pink-600 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 font-extrabold text-[10px]"
                      title="Download Study Guide PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Study PDF
                    </button>
                    <button
                      onClick={() => startEditNote(note)}
                      className="px-3 py-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-bold text-xs"
                      title="Edit note"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="px-3 py-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-bold text-xs"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Floating Icon to Add New Note */}
          <div className="fixed bottom-28 right-6 z-30 lg:bottom-6">
            <button
              onClick={() => {
                setNoteTitle('');
                setNoteContent('');
                setScreen('add');
              }}
              className="w-14 h-14 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 hover:shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer glow-pink"
              title="Add New Note"
              id="notepad-floating-add-btn"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
          </div>

        </div>
      )}

      {/* Screen 2: Add New Note */}
      {screen === 'add' && (
        <div className="max-w-md mx-auto p-4 md:p-6 space-y-6">
          
          {/* Header */}
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <button 
              onClick={() => setScreen('list')}
              className="p-2 rounded-xl border border-slate-200 glass-card text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">
                Create New Note
              </h1>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Notepad Workspace</span>
            </div>
          </div>

          <form onSubmit={handleAddNote} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Note Title</label>
              <input
                type="text"
                placeholder="Enter an inspiring title..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full px-4 py-3 glass-card border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500 placeholder:text-slate-300 text-slate-800"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Your Thoughts</label>
              <textarea
                placeholder="Start writing down your ideas, study guidelines, class details..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full min-h-[280px] p-4 glass-card border border-slate-200 rounded-3xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500 placeholder:text-slate-300 text-slate-700 resize-none leading-relaxed"
                required
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setScreen('list')}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs rounded-xl transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-xs hover:shadow-md flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                Save to Cloud
              </button>
            </div>
          </form>

        </div>
      )}

      {/* Screen 3: Edit Note */}
      {screen === 'edit' && (
        <div className="max-w-md mx-auto p-4 md:p-6 space-y-6">
          
          {/* Header */}
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <button 
              onClick={() => setScreen('list')}
              className="p-2 rounded-xl border border-slate-200 glass-card text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">
                Edit Note Details
              </h1>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono">Document #{editingNoteId?.substring(0, 5)}</span>
            </div>
          </div>

          <form onSubmit={handleUpdateNote} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Note Title</label>
              <input
                type="text"
                placeholder="Enter an inspiring title..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full px-4 py-3 glass-card border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500 placeholder:text-slate-300 text-slate-800"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Your Thoughts</label>
              <textarea
                placeholder="Start writing down your ideas, study guidelines, class details..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full min-h-[280px] p-4 glass-card border border-slate-200 rounded-3xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500 placeholder:text-slate-300 text-slate-700 resize-none leading-relaxed"
                required
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setScreen('list')}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs rounded-xl transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-xs hover:shadow-md flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                Update Cloud
              </button>
            </div>
          </form>

        </div>
      )}

    </div>
  );
}
