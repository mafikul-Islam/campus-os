import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NoteDocument, ChatMessage } from '../types';
import { BookOpen, UploadCloud, FileText, Brain, Sparkles, Send, RefreshCw, Layers, Check, CheckCircle2, ChevronRight, HelpCircle, Cloud, Laptop, Paperclip, Mic, Image, FileUp, Download, Trash2, X, ArrowLeft } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface NotesViewProps {
  notes: NoteDocument[];
  onAddNote: (note: NoteDocument) => void;
  onUpdateNoteResult: (id: string, resultType: string, data: any) => void;
  onBack?: () => void;
}

export default function NotesView({ notes, onAddNote, onUpdateNoteResult, onBack }: NotesViewProps) {
  const [selectedNote, setSelectedNote] = useState<NoteDocument | null>(notes[0] || null);
  const [activeTab, setActiveTab] = useState<'content' | 'summary' | 'explain' | 'mcq' | 'flashcard' | 'examNotes'>('content');
  
  // Note Creation State
  const [newNoteName, setNewNoteName] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // New Slide Source Upload states
  const localFileInputRef = useRef<HTMLInputElement>(null);
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);
  const [uploadDropdownOpen, setUploadDropdownOpen] = useState(false);

  // AI Chat voice/image attachment simulation states
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; type: string } | null>(null);

  const driveFiles = [
    { name: "CSE301_Lecture4_Normalization_Theory.pdf", size: "1.8 MB", date: "2026-07-01", content: `Boyce-Codd Normal Form (BCNF) is an advanced normal form used in database normalization. A relation schema R is in BCNF with respect to a set F of functional dependencies if for all functional dependencies in F+ of the form X -> Y, where X is a subset of R and Y is a subset of R, at least one of the following holds:\n1. X -> Y is a trivial functional dependency (Y is a subset of X)\n2. X is a superkey for schema R.\nIn simple terms, BCNF requires that the left-hand side of every non-trivial functional dependency must be a superkey. There are no transitivities or partial dependencies. BCNF is stricter than 3NF, and any relation in BCNF is also in 3NF.` },
    { name: "CSE302_Lecture8_Parser_Constructors.ppt", size: "3.4 MB", date: "2026-06-28", content: `Syntax analysis (parsing) is the second phase of a compiler. It takes the token stream from the lexical analyzer and structures it as a hierarchical parse tree. Parser constructors like LL(1), LR(1), and LALR(1) are widely used to automate this process. An LL(1) parser is a top-down parser that parses input from left to right, performing a leftmost derivation with 1 token lookahead. An LR(1) parser is a bottom-up parser that parses input from left to right, performing a rightmost derivation in reverse with 1 token lookahead. LR(1) parsers are extremely powerful and can handle almost all programming language grammars.` },
    { name: "CSE312_AI_Adversarial_Search_AlphaBeta.pdf", size: "1.5 MB", date: "2026-07-05", content: `Alpha-Beta Pruning is an optimization technique for the minimax search algorithm. It seeks to decrease the number of nodes that are evaluated by the minimax algorithm in its search tree. It is used in two-player games (such as Chess, Checkers, and Tic-Tac-Toe). The algorithm maintains two values, alpha and beta, which represent the minimum score that the maximizing player is assured of and the maximum score that the minimizing player is assured of respectively. When beta becomes less than or equal to alpha, the parent branch can be pruned, because the opponent would never allow this path to be taken in optimal play.` },
    { name: "Varendra_CSE_Syllabus_2026.pdf", size: "4.2 MB", date: "2026-01-15", content: `Syllabus for Computer Science & Engineering (CSE) - Varendra University. Course structure includes:\n- CSE 101: Structured Programming Language (3 Credits)\n- CSE 201: Object Oriented Programming (3 Credits)\n- CSE 301: Advanced Database Systems (3 Credits)\n- CSE 302: Compiler Design (3 Credits)\n- CSE 304: Software Engineering Lab (1.5 Credits)\n- CSE 312: Artificial Intelligence (3 Credits)\n- CSE 401: Computer Networks (3 Credits)\nGrading system is based on letter grades with corresponding grade points: A+ (4.00, 80%+), A (3.75, 75%-79%), A- (3.50, 70%-74%), B+ (3.25, 65%-69%), B (3.00, 60%-64%), B- (2.75, 55%-59%), C+ (2.50, 50%-54%), C (2.25, 45%-49%), D (2.00, 40%-44%), F (0.00, <40%).` }
  ];

  const handleSelectDriveFile = (file: typeof driveFiles[0]) => {
    setIsUploading(true);
    setIsDrivePickerOpen(false);
    setUploadDropdownOpen(false);
    setTimeout(() => {
      const newNote: NoteDocument = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        content: file.content,
        type: 'note',
        date: new Date().toLocaleDateString(),
        size: file.size
      };

      onAddNote(newNote);
      setSelectedNote(newNote);
      setIsUploading(false);
      setActiveTab('content');
    }, 1200);
  };

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadDropdownOpen(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      let content = '';
      if (file.name.endsWith('.txt')) {
        content = event.target?.result as string;
      } else {
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        content = `Extracted Text Content from Slide [${file.name}]:\n\n` +
                  `Subject Study: Academic syllabus notes regarding ${baseName.replace(/_/g, " ")}.\n\n` +
                  `Key Highlights:\n` +
                  `1. Core definition and foundations of ${baseName.replace(/_/g, " ")}.\n` +
                  `2. Systematic structures, attributes, and critical relational integrity rules.\n` +
                  `3. Functional dependencies (FDs), key constraints, and multi-valued dependencies.\n` +
                  `4. Primary use cases, design trade-offs, and professor annotations.\n\n` +
                  `Additional notes: This document was uploaded locally from device storage on ${new Date().toLocaleDateString()}. Make sure to run AI actions (Summary, Professor Explain, Exam Notes, Lab Quiz MCQs, and Flashcards) to generate dynamic interactive assets.`;
      }

      setTimeout(() => {
        const newNote: NoteDocument = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          content: content,
          type: 'note',
          date: new Date().toLocaleDateString(),
          size: `${Math.round(file.size / 1024 * 10) / 10} KB`
        };

        onAddNote(newNote);
        setSelectedNote(newNote);
        setIsUploading(false);
        setActiveTab('content');
      }, 1200);
    };

    if (file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDownloadPdf = () => {
    if (!selectedNote) return;
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Campus OS - Study Material Output", 15, 20);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Document: ${selectedNote.name}`, 15, 28);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 34);
    
    doc.setLineWidth(0.5);
    doc.line(15, 38, 195, 38);
    
    let contentText = '';
    let title = '';
    
    if (activeTab === 'summary') {
      title = 'Core Summary';
      contentText = selectedNote.actionsResult?.summary || '';
    } else if (activeTab === 'explain') {
      title = 'Professor Explanation';
      contentText = selectedNote.actionsResult?.explain || '';
    } else if (activeTab === 'examNotes') {
      title = 'Exam Notes';
      contentText = selectedNote.actionsResult?.examNotes || '';
    } else if (activeTab === 'mcq') {
      title = 'Quiz MCQs (Lab Quiz)';
      const mcqs = selectedNote.actionsResult?.mcqs || [];
      contentText = mcqs.map((q, idx) => {
        return `Q${idx + 1}: ${q.question}\nOptions:\n${q.options.map((opt, oIdx) => `  [${String.fromCharCode(65 + oIdx)}] ${opt}`).join('\n')}\nCorrect Answer: Option ${String.fromCharCode(65 + q.answer)}\nExplanation: ${q.explanation}\n\n`;
      }).join('\n');
    } else if (activeTab === 'flashcard') {
      title = 'Flash Cards';
      const flashcards = selectedNote.actionsResult?.flashcards || [];
      contentText = flashcards.map((fc, idx) => {
        return `Card ${idx + 1}:\nQuestion: ${fc.question}\nAnswer: ${fc.answer}\n\n`;
      }).join('\n');
    } else {
      title = 'Original Content';
      contentText = selectedNote.content;
    }
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(title, 15, 46);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    const splitText = doc.splitTextToSize(contentText, 180);
    
    let y = 54;
    const pageHeight = doc.internal.pageSize.height;
    
    for (let i = 0; i < splitText.length; i++) {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(splitText[i], 15, y);
      y += 6;
    }
    
    doc.save(`Campus_OS_${title.replace(/\s+/g, '_')}_${selectedNote.name.replace(/\.[^/.]+$/, '')}.pdf`);
  };

  const handleStartVoiceRecording = () => {
    setIsRecordingVoice(true);
    setTimeout(() => {
      setUserInput("Explain Boyce-Codd Normal Form with a real-world relational database scenario.");
      setIsRecordingVoice(false);
    }, 2500);
  };

  const triggerAttachedFile = () => {
    setAttachedFile({
      name: "diagram_of_normal_forms.png",
      type: "image/png"
    });
  };

  // Note Action triggers
  const [isPerformingAction, setIsPerformingAction] = useState(false);

  // MCQ / Flashcard Play states
  const [selectedMcqAnswers, setSelectedMcqAnswers] = useState<{ [index: number]: number }>({});
  const [flippedCards, setFlippedCards] = useState<{ [index: number]: boolean }>({});

  // Chat interface state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: 'Hello! Ask me any specific technical questions about your uploaded materials. I am fully grounded in the document text.', timestamp: new Date().toLocaleTimeString() }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteName || !newNoteContent) return;

    setIsUploading(true);
    setTimeout(() => {
      const newNote: NoteDocument = {
        id: Math.random().toString(36).substr(2, 9),
        name: newNoteName.endsWith('.txt') || newNoteName.endsWith('.pdf') ? newNoteName : `${newNoteName}.txt`,
        content: newNoteContent,
        type: 'note',
        date: new Date().toLocaleDateString(),
        size: `${Math.round(newNoteContent.length / 1024 * 10) / 10} KB`
      };

      onAddNote(newNote);
      setSelectedNote(newNote);
      setIsUploading(false);
      setNewNoteName('');
      setNewNoteContent('');
      setActiveTab('content');
    }, 1200);
  };

  const triggerNoteAction = async (action: 'summarize' | 'explain' | 'examNotes' | 'flashcards' | 'mcqs') => {
    if (!selectedNote) return;
    setIsPerformingAction(true);

    try {
      const res = await fetch("/api/gemini/notes-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          content: selectedNote.content,
          docName: selectedNote.name,
        })
      });

      const data = await res.json();
      if (data.success) {
        onUpdateNoteResult(selectedNote.id, action, data.result);
        
        // Map action key to corresponding active tab
        const tabMap: { [key: string]: any } = {
          summarize: 'summary',
          explain: 'explain',
          examNotes: 'examNotes',
          flashcards: 'flashcard',
          mcqs: 'mcq'
        };
        setActiveTab(tabMap[action]);
        
        // Update local state copy to render immediately
        const refreshed = { ...selectedNote };
        refreshed.actionsResult = refreshed.actionsResult || {};
        if (action === 'summarize') refreshed.actionsResult.summary = data.result;
        if (action === 'explain') refreshed.actionsResult.explain = data.result;
        if (action === 'examNotes') refreshed.actionsResult.examNotes = data.result;
        if (action === 'flashcards') refreshed.actionsResult.flashcards = data.result;
        if (action === 'mcqs') refreshed.actionsResult.mcqs = data.result;
        setSelectedNote(refreshed);
      }
    } catch (e) {
      console.error("Failed notes action:", e);
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleSendChat = async () => {
    if ((!userInput.trim() && !attachedFile) || !selectedNote) return;

    let displayContent = userInput;
    if (attachedFile) {
      displayContent = `[📎 Attached ${attachedFile.name}]\n${userInput}`;
    }

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: displayContent,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setUserInput('');
    setAttachedFile(null);
    setIsChatSending(true);

    try {
      const res = await fetch("/api/gemini/notes-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          documentContext: selectedNote.content,
          docName: selectedNote.name
        })
      });

      const data = await res.json();
      if (data.success) {
        setChatMessages(prev => [...prev, {
          id: Math.random().toString(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    } catch (e) {
      console.error("Doc chat error:", e);
    } finally {
      setIsChatSending(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto font-sans">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 rounded-xl border border-slate-200 glass-card text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-3xs"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <BookOpen className="w-8 h-8 text-brand-primary" />
          AI Notes Analyzer
        </h1>
        <p className="text-slate-500 font-light mt-1">
          Upload textbook notes, research PDFs, or handwritten transcripts to generate interactive study structures.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Note Document Selection & Creation */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Note List Container */}
          <div className="glass-card rounded-3xl p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Uploaded Notes</h2>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    setSelectedNote(note);
                    setActiveTab('content');
                    setSelectedMcqAnswers({});
                    setFlippedCards({});
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedNote?.id === note.id
                      ? 'bg-brand-primary/5 border-brand-primary/30 text-brand-primary glow-purple'
                      : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <FileText className={`w-5 h-5 shrink-0 ${selectedNote?.id === note.id ? 'text-brand-primary' : 'text-slate-400'}`} />
                    <div className="truncate">
                      <h4 className="text-sm font-bold text-slate-800 truncate">{note.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{note.size || '1.2 KB'} • {note.date}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Upload / Add Note form */}
          <div className="glass-card rounded-3xl p-5 shadow-xs bg-linear-to-b from-white to-slate-50 relative">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-brand-primary" /> Slide Workspace
            </h3>

            {/* Main Upload Dropdown Trigger Button */}
            <div className="relative mb-4">
              <button
                type="button"
                onClick={() => setUploadDropdownOpen(!uploadDropdownOpen)}
                className="w-full py-3 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-brand-primary/10"
              >
                <FileUp className="w-4.5 h-4.5" />
                Upload Slide (PDF/PNG/Doc)
              </button>

              <AnimatePresence>
                {uploadDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 right-0 mt-2 glass-card border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsDrivePickerOpen(true);
                        setUploadDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Cloud className="w-4 h-4 text-blue-500" />
                      Select Slide from Google Drive
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        localFileInputRef.current?.click();
                      }}
                      className="w-full px-4 py-3 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Laptop className="w-4 h-4 text-emerald-500" />
                      Select Local Device File (PDF/PNG/Doc)
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Hidden native input */}
            <input
              type="file"
              ref={localFileInputRef}
              onChange={handleLocalFileChange}
              accept=".pdf,.doc,.docx,.png,.txt"
              className="hidden"
            />

            {/* Quick divider */}
            <div className="flex items-center my-3.5">
              <div className="grow h-px bg-slate-200" />
              <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">or Paste slide text</span>
              <div className="grow h-px bg-slate-200" />
            </div>

            {/* Manual paste accordion/form */}
            <form onSubmit={handleCreateNote} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Slide Title (e.g. Chapter 4: B-Trees)"
                  value={newNoteName}
                  onChange={(e) => setNewNoteName(e.target.value)}
                  className="w-full px-4 py-2 glass-card border border-slate-200 rounded-xl text-[11px] font-medium focus:ring-1 focus:ring-brand-primary focus:outline-hidden"
                  required={newNoteContent.length > 0}
                />
              </div>

              <div>
                <textarea
                  rows={3}
                  placeholder="Paste textbook or slide text notes..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full px-4 py-2.5 glass-card border border-slate-200 rounded-xl text-[11px] font-medium focus:ring-1 focus:ring-brand-primary placeholder:text-slate-400 leading-relaxed focus:outline-hidden"
                  required={newNoteName.length > 0}
                />
              </div>

              <button
                type="submit"
                disabled={isUploading || !newNoteName || !newNoteContent}
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Compiling Slides...
                  </>
                ) : (
                  "Compile Paste Workspace"
                )}
              </button>
            </form>

            {/* Drive Picker Modal overlay */}
            <AnimatePresence>
              {isDrivePickerOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="glass-card rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Cloud className="w-5 h-5 text-blue-500 animate-pulse" />
                        <h4 className="text-sm font-extrabold text-slate-800">Select Google Drive Slides</h4>
                      </div>
                      <button
                        onClick={() => setIsDrivePickerOpen(false)}
                        className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                      {driveFiles.map((df, index) => (
                        <div
                          key={index}
                          onClick={() => handleSelectDriveFile(df)}
                          className="p-3 border border-slate-100 rounded-2xl hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-indigo-500" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{df.name}</p>
                              <span className="text-[10px] text-slate-400">{df.size} • Last edited {df.date}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Right Side: AI Active Workspace & Chat Tab */}
        <div className="lg:col-span-8 space-y-6">
          {selectedNote ? (
            <div className="space-y-6">
              
              {/* Note Command Center Controls */}
              <div className="glass-card rounded-3xl p-4 shadow-sm glow-purple">
                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setActiveTab('content')}
                      className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-colors ${
                        activeTab === 'content' ? 'bg-slate-800 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      Original Text
                    </button>
                    <button
                      onClick={() => {
                        if (!selectedNote.actionsResult?.summary) triggerNoteAction('summarize');
                        else setActiveTab('summary');
                      }}
                      className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors ${
                        activeTab === 'summary' ? 'bg-brand-primary text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Summary
                    </button>
                    <button
                      onClick={() => {
                        if (!selectedNote.actionsResult?.explain) triggerNoteAction('explain');
                        else setActiveTab('explain');
                      }}
                      className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors ${
                        activeTab === 'explain' ? 'bg-brand-primary text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Brain className="w-3.5 h-3.5" /> Professor Explain
                    </button>
                    <button
                      onClick={() => {
                        if (!selectedNote.actionsResult?.examNotes) triggerNoteAction('examNotes');
                        else setActiveTab('examNotes');
                      }}
                      className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors ${
                        activeTab === 'examNotes' ? 'bg-brand-primary text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" /> Exam Notes
                    </button>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        if (!selectedNote.actionsResult?.mcqs) triggerNoteAction('mcqs');
                        else setActiveTab('mcq');
                      }}
                      className={`px-3 py-2 text-xs font-bold rounded-xl border cursor-pointer transition-colors ${
                        activeTab === 'mcq' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      Quiz MCQs (Lab Quiz)
                    </button>
                    <button
                      onClick={() => {
                        if (!selectedNote.actionsResult?.flashcards) triggerNoteAction('flashcards');
                        else setActiveTab('flashcard');
                      }}
                      className={`px-3 py-2 text-xs font-bold rounded-xl border cursor-pointer transition-colors ${
                        activeTab === 'flashcard' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      Flash Cards
                    </button>
                  </div>
                </div>
              </div>

              {/* Note Content Panel */}
              <div className="glass-card rounded-3xl p-6 min-h-[320px] shadow-sm relative overflow-hidden">
                {/* Download PDF floating button */}
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={handleDownloadPdf}
                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                    title="Download active AI output as PDF to device offline storage"
                  >
                    <Download className="w-4 h-4" />
                    <span>Save PDF</span>
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {isPerformingAction ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 glass-card backdrop-blur-xs flex flex-col items-center justify-center space-y-3"
                    >
                      <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
                      <p className="text-xs font-bold text-slate-700">Gemini Reasoning Engine Processing Notes...</p>
                    </motion.div>
                  ) : null}

                  {activeTab === 'content' && (
                    <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-400" /> Original Study Document
                      </h2>
                      <div className="text-xs text-slate-600 font-normal leading-relaxed whitespace-pre-wrap max-h-[350px] overflow-y-auto">
                        {selectedNote.content}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'summary' && (
                    <motion.div key="summary" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-brand-primary" /> AI Compiled Core Summary
                      </h2>
                      <div className="text-xs text-slate-600 font-normal leading-relaxed whitespace-pre-wrap max-h-[350px] overflow-y-auto bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                        {selectedNote.actionsResult?.summary || "No summary generated yet."}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'explain' && (
                    <motion.div key="explain" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-indigo-500" /> Professor Explanation
                      </h2>
                      <div className="text-xs text-slate-600 font-normal leading-relaxed whitespace-pre-wrap max-h-[350px] overflow-y-auto bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                        {selectedNote.actionsResult?.explain || "No explanation compiled yet."}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'examNotes' && (
                    <motion.div key="examNotes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-indigo-500" /> Academic Exam Cheat Sheets
                      </h2>
                      <div className="text-xs text-slate-600 font-normal leading-relaxed whitespace-pre-wrap max-h-[350px] overflow-y-auto bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                        {selectedNote.actionsResult?.examNotes || "No exam notes compiled yet."}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'mcq' && selectedNote.actionsResult?.mcqs && (
                    <motion.div key="mcqs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-indigo-600" /> Interactive MCQ Diagnostics
                      </h2>
                      <div className="space-y-6 max-h-[380px] overflow-y-auto pr-1">
                        {selectedNote.actionsResult.mcqs.map((q, qIdx) => {
                          const hasAnswered = selectedMcqAnswers[qIdx] !== undefined;
                          const selectedAns = selectedMcqAnswers[qIdx];

                          return (
                            <div key={qIdx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                              <h4 className="text-xs font-bold text-slate-700 leading-relaxed">
                                <span className="text-indigo-600 mr-1 font-extrabold">Q{qIdx + 1}.</span> {q.question}
                              </h4>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.options.map((opt, oIdx) => {
                                  const isSelected = selectedAns === oIdx;
                                  const isCorrect = q.answer === oIdx;

                                  let optionStyle = "bg-white border-slate-200 text-slate-600 hover:bg-slate-50";
                                  if (hasAnswered) {
                                    if (isCorrect) optionStyle = "bg-emerald-50 border-emerald-300 text-emerald-800";
                                    else if (isSelected) optionStyle = "bg-rose-50 border-rose-300 text-rose-800";
                                    else optionStyle = "bg-white border-slate-200 text-slate-400 opacity-60";
                                  } else if (isSelected) {
                                    optionStyle = "bg-indigo-50 border-indigo-300 text-indigo-800";
                                  }

                                  return (
                                    <button
                                      key={oIdx}
                                      disabled={hasAnswered}
                                      onClick={() => {
                                        setSelectedMcqAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
                                      }}
                                      className={`p-2.5 text-xs text-left font-medium border rounded-xl transition-all cursor-pointer ${optionStyle}`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>

                              {hasAnswered && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2 text-[11px] text-slate-500 leading-relaxed">
                                  <strong className="text-slate-700">AI Explanation:</strong> {q.explanation}
                                </motion.div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'flashcard' && selectedNote.actionsResult?.flashcards && (
                    <motion.div key="flashcards" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-indigo-600" /> Active Recall Study Cards
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[380px] overflow-y-auto pr-1">
                        {selectedNote.actionsResult.flashcards.map((card, cIdx) => {
                          const isFlipped = flippedCards[cIdx];

                          return (
                            <div 
                              key={cIdx}
                              onClick={() => setFlippedCards(prev => ({ ...prev, [cIdx]: !prev[cIdx] }))}
                              className="perspective-[1000px] cursor-pointer h-32"
                            >
                              <div className={`relative w-full h-full duration-500 transform-style-3d ${isFlipped ? 'rotate-x-180' : ''}`}>
                                
                                {/* Front: Question */}
                                <div className="absolute inset-0 bg-linear-to-tr from-brand-primary/5 to-white border border-brand-primary/10 rounded-2xl p-4 flex flex-col justify-between backface-hidden shadow-xs">
                                  <span className="text-[9px] font-extrabold text-brand-primary uppercase tracking-wider">Question Card {cIdx+1}</span>
                                  <p className="text-xs font-bold text-slate-800 leading-relaxed text-center">{card.question}</p>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">Click to reveal Answer</span>
                                </div>

                                {/* Back: Answer */}
                                <div className="absolute inset-0 bg-slate-800 border border-slate-700 text-white rounded-2xl p-4 flex flex-col justify-between rotate-x-180 backface-hidden shadow-md">
                                  <span className="text-[9px] font-extrabold text-amber-400 uppercase tracking-wider">Study Answer</span>
                                  <p className="text-xs font-light leading-relaxed text-center">{card.answer}</p>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">Click to flip back</span>
                                </div>

                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Gemini Chat Grounding Area */}
              <div className="glass-card rounded-3xl p-6 shadow-sm flex flex-col h-[380px] justify-between glow-blue">
                <div className="border-b border-slate-100 pb-2 mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-brand-secondary animate-pulse" />
                    <h3 className="text-sm font-bold text-slate-800">Discuss Material with Gemini</h3>
                  </div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-bold">Document Grounding Node</span>
                </div>

                {/* Messages scrollarea */}
                <div className="grow overflow-y-auto space-y-4 pr-1 mb-4 text-xs">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-3.5 leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-slate-800 text-white rounded-tr-xs' 
                          : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-xs'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isChatSending && (
                    <div className="flex justify-start">
                      <div className="bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl rounded-tl-xs p-3.5 flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-secondary" />
                        AI is compiling answers grounded on materials...
                      </div>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Voice / Attachment Simulation indicator */}
                {isRecordingVoice && (
                  <div className="bg-red-50 border border-red-150 text-red-600 rounded-xl p-2 px-3 flex items-center justify-between mb-2 text-xs shrink-0 animate-pulse">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping shrink-0" />
                      <span className="font-bold">Listening to voice input... Speak now</span>
                    </div>
                    <span className="text-[10px] bg-red-200 px-2 py-0.5 rounded-md font-bold">Transcription active</span>
                  </div>
                )}

                {attachedFile && (
                  <div className="bg-slate-100 border border-slate-200 text-slate-700 rounded-xl p-2 px-3 flex items-center justify-between mb-2 text-xs shrink-0">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="font-medium truncate">{attachedFile.name} (Ready to send)</span>
                    </div>
                    <button
                      onClick={() => setAttachedFile(null)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Chat input box */}
                <div className="flex gap-2 shrink-0">
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2 grow">
                    {/* Attach File Button */}
                    <button
                      onClick={triggerAttachedFile}
                      disabled={isChatSending || isRecordingVoice}
                      className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 cursor-pointer transition-colors"
                      title="Attach Slide screenshot or image diagram"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    {/* Voice Dictate Button */}
                    <button
                      onClick={handleStartVoiceRecording}
                      disabled={isChatSending || isRecordingVoice}
                      className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-red-600 cursor-pointer transition-colors"
                      title="Dictate message using voice"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                    
                    <input
                      type="text"
                      placeholder="Discuss with voice, text, images or PDF..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                      disabled={isChatSending || isRecordingVoice}
                      className="grow px-2 py-3 bg-transparent border-0 text-xs font-medium focus:outline-hidden disabled:opacity-50"
                    />
                  </div>

                  <button
                    onClick={handleSendChat}
                    disabled={isChatSending || (!userInput.trim() && !attachedFile)}
                    className="p-3 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-xl shadow-xs cursor-pointer flex items-center justify-center shrink-0 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Send className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <p className="text-center py-24 text-slate-400 font-light">Please create or select a note document to begin AI analysis.</p>
          )}
        </div>

      </div>

    </div>
  );
}
