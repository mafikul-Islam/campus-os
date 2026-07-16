import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles, 
  Minimize2, 
  Maximize2,
  Calendar,
  BookOpen,
  TrendingUp,
  Cpu,
  ChevronDown
} from 'lucide-react';

interface AIAssistantBotProps {
  userProfile?: any;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIAssistantBot({ userProfile }: AIAssistantBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome-msg',
    role: 'assistant',
    content: "Hi there! I'm your Campus OS Copilot, powered by Gemini AI. I can help you manage your studies, format emails, summarize notes, or coordinate your class schedules. What shall we tackle today?",
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend !== undefined ? textToSend : input;
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (textToSend === undefined) {
      setInput('');
    }
    setIsLoading(true);

    try {
      // Map to format expected by the backend coach-chat endpoint
      const apiMessages = [...messages, userMessage].map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        content: msg.content
      }));

      const res = await fetch('/api/gemini/coach-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: apiMessages,
          userProfile: userProfile,
          systemInstructionOverride: "You are the Campus OS AI Assistant. You help the user navigate the app, understand features, provide general campus information, and answer academic questions. Be friendly, concise, and helpful."
        })
      });

      const data = await res.json();
      
      if (data.success && data.reply) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err) {
      console.error("AI Assistant Error:", err);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please verify your connection and try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Pre-configured suggestions helper
  const suggestions = [
    { text: "📅 Show my schedule today", icon: Calendar, prompt: "What is my class routine schedule today?" },
    { text: "📚 Practical study tips", icon: BookOpen, prompt: "Give me some highly practical study tips for university exam prep." },
    { text: "📈 GPA tracking assistance", icon: TrendingUp, prompt: "How do I calculate and plan my target CGPA?" },
    { text: "⚡ Tell me about Campus OS", icon: Cpu, prompt: "What are the core features of Campus OS and how do I use them?" }
  ];

  // Render text helper to highlight lists, bold text, or code-style blocks
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Check if code block or list
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const text = line.replace(/^[\s*-]+/, '').trim();
        return (
          <span key={i} className="flex items-start gap-2 mt-1 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
            <span className="text-slate-200 text-xs leading-relaxed">{text}</span>
          </span>
        );
      }
      
      // Look for code markers `code`
      if (line.includes('`')) {
        const parts = line.split('`');
        return (
          <span key={i} className="block text-xs leading-relaxed mt-1 text-slate-200">
            {parts.map((part, idx) => (
              idx % 2 === 1 
                ? <code key={idx} className="font-mono text-[10px] text-pink-400 bg-slate-950/80 px-1.5 py-0.5 rounded-md border border-slate-800">{part}</code>
                : part
            ))}
          </span>
        );
      }

      return (
        <span key={i} className="block text-xs leading-relaxed text-slate-200 min-h-[1em] mt-1">
          {line}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            id="global-ai-fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 w-14 h-14 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white rounded-full shadow-[0_10px_30px_rgba(99,102,241,0.4)] flex items-center justify-center z-50 overflow-hidden group cursor-pointer border-2 border-white/20"
          >
            {/* Animated glowing spectrum */}
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-spin-slow" />
            
            {/* Shimmer overlay */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />

            <Bot className="w-6 h-6 relative z-10 transition-transform group-hover:scale-110" />
            <Sparkles className="w-3.5 h-3.5 absolute top-2 right-2 text-yellow-300 animate-pulse" />
            
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full shadow-sm animate-pulse"></span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Interface Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="global-ai-window"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
            }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className={`fixed z-50 flex flex-col overflow-hidden bg-slate-900/95 dark:bg-slate-950/98 backdrop-blur-xl border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300
              /* Mobile viewport binding */
              bottom-0 right-0 w-full h-[85vh] rounded-t-[2.5rem] rounded-b-none 
              /* Desktop adaptive overlay */
              md:bottom-8 md:right-8 md:w-[420px] md:h-[600px] md:rounded-[2.2rem]
              ${isExpanded ? 'md:w-[500px] md:h-[780px]' : ''}
            `}
          >
            {/* Gradient background light leak decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Mobile Drag Indicator / Header top bar */}
            <div className="flex md:hidden justify-center pt-3 pb-1 shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-slate-800" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 bg-slate-950/40 shrink-0 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white relative shadow-md shadow-indigo-500/10">
                  <Bot className="w-5.5 h-5.5" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse"></span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black tracking-tight text-white">Campus Copilot</h3>
                    <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase rounded-sm tracking-wider">Gemini 1.5</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    AI Intelligence Online
                  </p>
                </div>
              </div>

              {/* Header Action Controls */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="hidden md:flex p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all cursor-pointer border border-slate-800/30"
                  title={isExpanded ? "Minimize Window" : "Expand Window"}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all cursor-pointer border border-slate-800/30"
                  title="Close Copilot"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 relative z-10 scrollbar-thin">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-slate-800 text-slate-300' 
                        : 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white'
                    }`}>
                      {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    </div>
                    
                    {/* Bubble */}
                    <div className={`p-4 rounded-3xl ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-xs shadow-md shadow-indigo-600/10' 
                        : 'bg-slate-850 border border-slate-800/50 text-slate-100 rounded-tl-xs shadow-xs'
                    }`}>
                      {renderMessageContent(msg.content)}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start w-full">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-4 rounded-3xl bg-slate-850 border border-slate-800/50 rounded-tl-xs text-slate-400 flex items-center gap-2">
                      {/* Beautiful triple pulsing dots typing animation */}
                      <div className="flex gap-1.5 items-center px-1">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" />
                      </div>
                      <span className="text-xs font-semibold text-indigo-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Actions and Suggestions (Hidden if loading) */}
            {!isLoading && messages.length <= 2 && (
              <div className="px-6 py-2 overflow-x-auto flex gap-2 shrink-0 z-10 scrollbar-none scroll-smooth">
                {suggestions.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSend(item.prompt)}
                      className="flex items-center gap-1.5 py-2 px-3.5 bg-slate-850 hover:bg-indigo-600/10 text-slate-300 hover:text-white rounded-full border border-slate-800 hover:border-indigo-500/30 text-[11px] font-bold transition-all shrink-0 cursor-pointer"
                    >
                      <Icon className="w-3.5 h-3.5 text-indigo-400" />
                      {item.text}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-slate-800/50 bg-slate-950/80 shrink-0 relative z-10">
              <div className="relative flex items-end">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Query Campus Copilot..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-4 pr-12 text-xs font-semibold text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none min-h-[48px] max-h-[120px] scrollbar-none"
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2.5 bottom-2.5 p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md shadow-indigo-600/15"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-center mt-2.5 flex items-center justify-center gap-1.5 text-[9px] font-semibold text-slate-500">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Gemini Core Engine Integrations • HIPAA Secure</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
