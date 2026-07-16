import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Sparkles, FileText, UploadCloud, RefreshCw, CheckCircle, Brain, Calendar, ArrowLeft } from 'lucide-react';

interface LectureAssistantViewProps {
  onTrackActivity?: (title: string, module: string) => void;
  onBack?: () => void;
}

export default function LectureAssistantView({ onTrackActivity, onBack }: LectureAssistantViewProps) {
  const [lectureTitle, setLectureTitle] = useState('Lecture 4: Database Anomalies');
  const [transcript, setTranscript] = useState(`Today we are talking about database anomalies. Specifically insertion, deletion, and update anomalies that happen when you have flat tables with redundantly stored records. If we have a table with StudentID, StudentName, ClassTaken, and ProfessorRoom, and a student drops out, deleting their row might delete the professor's room mapping. That is a deletion anomaly. If we update a professor's room, we must update all rows carrying that professor, otherwise we create inconsistencies - an update anomaly. To solve this, we decomposite relations into smaller ones. This is the foundation of normalization...`);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedResult, setProcessedResult] = useState<any | null>(null);

  const handleProcessTranscript = async () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/gemini/lecture-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          title: lectureTitle
        })
      });

      const data = await res.json();
      if (data.success && data.result) {
        setProcessedResult(data.result);
        if (onTrackActivity) {
          onTrackActivity(`Processed lecture notes: "${lectureTitle}"`, "Lecture Assistant");
        }
      }
    } catch (e) {
      console.error("Lecture assistant error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const loadExampleTranscript = () => {
    setLectureTitle("Lecture 7: Deep Neural Networks");
    setTranscript("Let's discuss backpropagation in multi-layer perceptrons. We use gradients of the loss function with respect to the weights to tune parameters. By chain rule, the gradient at layer L is computed using the error terms at layer L+1 multiplied by the activation derivative of layer L. Stochastic Gradient Descent then moves weights in the opposite direction of the gradient. Learning rates control step sizes. If it is too large, optimization oscillates or diverges. If it's too small, it converges extremely slowly...");
    setProcessedResult(null);
  };

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-5xl mx-auto font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-2 rounded-xl border border-slate-200 glass-card text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-3xs"
                title="Back"
                id="back-button-lecture"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <Rocket className="w-8 h-8 text-brand-primary" />
            AI Lecture Assistant
          </h1>
          <p className="text-slate-500 font-light mt-1">
            Convert recording scripts or lecture transcripts into structured study assets using server-side Gemini.
          </p>
        </div>

        <div>
          <button
            onClick={loadExampleTranscript}
            className="px-4 py-2 border border-slate-200 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-xl glass-card hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Load Neural Nets Transcript
          </button>
        </div>
      </div>

      {/* Control Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Input transcript */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-3xl p-6 shadow-sm bg-linear-to-b from-white to-slate-50 border border-brand-primary/10">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-brand-primary" /> Paste Recording Transcript
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Lecture Title</label>
                <input
                  type="text"
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                  placeholder="e.g. Database Chapter 3: Anomaly types"
                  className="w-full px-4 py-2.5 glass-card border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-brand-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Raw Audio Transcript / Outline</label>
                <textarea
                  rows={10}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste lecture recorder text, transcript outlines, or transcription blocks..."
                  className="w-full px-4 py-3 glass-card border border-slate-200 rounded-2xl text-xs font-medium focus:ring-1 focus:ring-brand-primary placeholder:text-slate-400 leading-relaxed focus:outline-hidden"
                />
              </div>

              <button
                onClick={handleProcessTranscript}
                disabled={isProcessing || !transcript.trim()}
                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-brand-primary" />
                    Generating Study Package...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Process with Gemini AI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Rendered outputs */}
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[350px] space-y-4 shadow-sm"
              >
                <RefreshCw className="w-10 h-10 text-brand-primary animate-spin" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Compiling Study Material</h4>
                  <p className="text-xs text-slate-400 font-light mt-1 max-w-sm">
                    Gemini model is parsing semantic logs, generating revision blocks, extracting concept arrays, and constructing customized calendars.
                  </p>
                </div>
              </motion.div>
            ) : processedResult ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* 1. Concepts Highlight pills */}
                <div className="glass-card rounded-3xl p-5 shadow-xs border-l-4 border-l-brand-secondary">
                  <span className="text-[10px] uppercase font-extrabold text-brand-secondary tracking-widest block mb-3">Extracted Core Terminology</span>
                  <div className="flex flex-wrap gap-2">
                    {processedResult.keyConcepts?.map((concept: string) => (
                      <span key={concept} className="text-xs font-bold text-slate-700 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/50 flex items-center gap-1">
                        <Brain className="w-3.5 h-3.5 text-brand-primary" />
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2. Structured Revision Guide */}
                <div className="glass-card rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="text-md font-bold text-slate-800 border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
                    <FileText className="w-5 h-5 text-brand-primary" />
                    AI Core Revision guide
                  </h3>
                  <div className="text-xs text-slate-600 leading-relaxed font-light whitespace-pre-wrap max-h-[250px] overflow-y-auto bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    {processedResult.summary}
                  </div>
                </div>

                {/* 3. Extracted Study Guide / Plan */}
                <div className="glass-card rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="text-md font-bold text-slate-800 border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
                    <Calendar className="w-5 h-5 text-brand-primary" />
                    Custom Study Roadmap
                  </h3>
                  <div className="text-xs text-slate-600 leading-relaxed font-light whitespace-pre-wrap max-h-[200px] overflow-y-auto bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    {processedResult.studyPlan}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="glass-card rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[350px] text-slate-400 font-light">
                <Brain className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
                <p className="text-sm">Ready to compile. Submit transcripts to construct study blueprints.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
