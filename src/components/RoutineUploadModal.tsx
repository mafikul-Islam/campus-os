import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileSpreadsheet, FileImage, X, Search, FileDown, CheckCircle, Sparkles, Wand2 } from 'lucide-react';
import { UserProfile, CalendarEvent, RoutineClass } from '../types';

interface RoutineUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile?: (profile: UserProfile) => void;
  onSyncRoutineEvents?: (events: CalendarEvent[]) => void;
}

export default function RoutineUploadModal({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onSyncRoutineEvents
}: RoutineUploadModalProps) {
  const sheetInputRef = useRef<HTMLInputElement>(null);
  const pdfPngInputRef = useRef<HTMLInputElement>(null);
  
  const [isRoutineAnalyzing, setIsRoutineAnalyzing] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const handleRoutineFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isSheet: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    onClose();
    setIsRoutineAnalyzing(true);
    setAnalyzingStep(0);

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < 4) {
        currentStep += 1;
        setAnalyzingStep(currentStep);
      }
    }, 1200);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const resultStr = reader.result as string;
        const base64String = resultStr.split(',')[1];
        
        let mimeType = file.type;
        if (!mimeType) {
          if (file.name.endsWith('.csv')) mimeType = 'text/csv';
          else if (file.name.endsWith('.xlsx')) mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          else if (file.name.endsWith('.xls')) mimeType = 'application/vnd.ms-excel';
          else if (file.name.endsWith('.pdf')) mimeType = 'application/pdf';
          else mimeType = 'image/png';
        }

        const response = await fetch("/api/routine/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileData: base64String,
            mimeType: mimeType,
            fileName: file.name,
            academicProfile: {
              major: profile.major,
              batch: profile.batch,
              section: profile.section,
              semester: profile.semester
            }
          })
        });

        const data = await response.json();
        clearInterval(interval);

        if (data.success && data.routineClasses) {
          setAnalyzingStep(5);
          
          setTimeout(() => {
            setIsRoutineAnalyzing(false);
            setAnalyzingStep(0);

            const studentSection = profile.section || "A";
            
            const mapDayToDate = (dayName: string) => {
              const daysMap: Record<string, string> = {
                'saturday': '2026-07-11',
                'sunday': '2026-07-12',
                'monday': '2026-07-13',
                'tuesday': '2026-07-14',
                'wednesday': '2026-07-15',
                'thursday': '2026-07-16',
                'friday': '2026-07-17'
              };
              return daysMap[dayName.toLowerCase()] || '2026-07-13';
            };

            const parsedClasses: RoutineClass[] = data.routineClasses;

            if (onUpdateProfile) {
              onUpdateProfile({
                ...profile,
                routineClasses: parsedClasses,
                routineUploaded: true
              });
            }

            const syncedEvents: CalendarEvent[] = parsedClasses.map(cls => ({
              id: `routine-sync-${cls.courseCode}-${cls.day}-${mapDayToDate(cls.day)}`,
              title: `${cls.courseName} (${studentSection})`,
              type: 'Extra Class',
              date: mapDayToDate(cls.day),
              time: cls.time,
              room: cls.room,
              course: cls.courseCode,
              color: 'emerald'
            }));

            if (onSyncRoutineEvents) {
              onSyncRoutineEvents(syncedEvents);
            }

            localStorage.setItem('campus_routine_uploaded', 'true');
            window.dispatchEvent(new Event('routine-updated'));

          }, 1500);
        } else {
          alert("Failed to parse routine. Please ensure the file matches your institution's template.");
          setIsRoutineAnalyzing(false);
        }
      } catch (err) {
        console.error("Error uploading routine:", err);
        clearInterval(interval);
        alert("An error occurred during routine parsing.");
        setIsRoutineAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      {/* HIDDEN FILE INPUTS */}
      <input 
        type="file" 
        ref={sheetInputRef} 
        onChange={(e) => handleRoutineFileUpload(e, true)} 
        accept=".xlsx, .xls, .csv" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={pdfPngInputRef} 
        onChange={(e) => handleRoutineFileUpload(e, false)} 
        accept="image/*, .pdf" 
        className="hidden" 
      />

      {/* ANALYZING OVERLAY */}
      <AnimatePresence>
        {isRoutineAnalyzing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100">
                <motion.div 
                  className="h-full bg-brand-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: `${(analyzingStep / 5) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="w-20 h-20 mx-auto bg-brand-primary/10 rounded-full flex items-center justify-center mb-6 relative">
                {analyzingStep === 5 ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                  </motion.div>
                ) : (
                  <>
                    <Search className="w-8 h-8 text-brand-primary animate-pulse" />
                    <motion.div 
                      className="absolute inset-0 border-4 border-brand-primary/20 rounded-full border-t-brand-primary"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  </>
                )}
              </div>

              <h3 className="text-lg font-black text-slate-800 mb-2">
                {analyzingStep === 5 ? "Routine Extracted!" : "Analyzing Master Routine..."}
              </h3>
              
              <div className="space-y-3 mt-6 text-left">
                {[
                  { icon: FileDown, text: "Reading file structural layout" },
                  { icon: Search, text: "Running OCR & coordinate mapping" },
                  { icon: Sparkles, text: `Filtering classes for ${profile.major} - Batch ${profile.batch}` },
                  { icon: Wand2, text: `Extracting timings for Section ${profile.section || "A"}` },
                  { icon: CheckCircle, text: "Generating personalized calendar" }
                ].map((step, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: analyzingStep > idx ? 1 : (analyzingStep === idx ? 0.5 : 0), x: analyzingStep >= idx ? 0 : -10 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${analyzingStep > idx ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      <step.icon className="w-3 h-3" />
                    </div>
                    <span className={`text-xs font-bold ${analyzingStep > idx ? 'text-slate-700' : 'text-slate-400'}`}>
                      {step.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* UPLOAD MODAL */}
      <AnimatePresence>
        {isOpen && !isRoutineAnalyzing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white/90 backdrop-blur-xl border border-slate-100 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-left"
            >
              <div className="p-6 bg-slate-50 border-b border-slate-100/80 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                    <span className="text-[9px] font-black tracking-widest uppercase text-brand-primary">
                      Smart Extraction Timetable
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-800">
                    Upload Section Routine
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    Choose your master routine layout format to extract your tailored schedule instantly.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-3.5">
                <button
                  onClick={() => sheetInputRef.current?.click()}
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-left flex items-start gap-4 hover:bg-brand-primary/5 hover:border-brand-primary/25 transition-all duration-300 cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-black text-slate-700 group-hover:text-slate-800">
                      1. Upload Routine Sheet
                    </h4>
                    <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                      Accepts Excel, XLSX or CSV files containing the master institution timetable grids.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => pdfPngInputRef.current?.click()}
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-left flex items-start gap-4 hover:bg-indigo-500/5 hover:border-indigo-500/25 transition-all duration-300 cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <FileImage className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-black text-slate-700 group-hover:text-slate-800">
                      2. Upload Image / PDF
                    </h4>
                    <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                      Accepts PDF documents or Image captures of the visual timetable.
                    </p>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
