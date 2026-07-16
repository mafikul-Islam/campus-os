import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Expense } from '../types';
import { CreditCard, Plus, Mic, Sparkles, RefreshCw, AlertCircle, TrendingUp, DollarSign, List, CheckCircle, ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ExpensesViewProps {
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onBack?: () => void;
}

export default function ExpensesView({ expenses, onAddExpense, onBack }: ExpensesViewProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<'Food' | 'Transport' | 'Education' | 'Entertainment' | 'Others'>('Food');
  const [description, setDescription] = useState('');
  
  // NLP / Voice Parsing States
  const [nlpText, setNlpText] = useState('');
  const [isParsingNlp, setIsParsingNlp] = useState(false);
  const [nlpSuccess, setNlpSuccess] = useState(false);

  // Voice Mock state
  const [isRecording, setIsRecording] = useState(false);

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    const newExpense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      amount: parseFloat(amount) || 0,
      category,
      description,
      date: new Date().toLocaleDateString(),
    };

    onAddExpense(newExpense);
    setAmount('');
    setDescription('');
  };

  const handleNlpParse = async () => {
    if (!nlpText.trim()) return;
    setIsParsingNlp(true);
    setNlpSuccess(false);

    try {
      const res = await fetch("/api/gemini/parse-expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: nlpText })
      });

      const data = await res.json();
      if (data.success && data.parsed) {
        const parsed = data.parsed;
        
        // Formulate and save immediately
        const nlpExpense: Expense = {
          id: Math.random().toString(36).substr(2, 9),
          amount: parseFloat(parsed.amount) || 10,
          category: (parsed.category as any) || "Others",
          description: parsed.description || nlpText,
          date: new Date().toLocaleDateString(),
        };

        onAddExpense(nlpExpense);
        setNlpSuccess(true);
        setNlpText('');
        setTimeout(() => setNlpSuccess(false), 2000);
      }
    } catch (e) {
      console.error("Failed parsing expense:", e);
    } finally {
      setIsParsingNlp(false);
    }
  };

  const startVoiceMock = () => {
    setIsRecording(true);
    setNlpText("Analyzing voice transcript...");
    
    setTimeout(() => {
      setIsRecording(false);
      setNlpText("spent $14.50 on lunch at subway");
    }, 2500);
  };

  // 1. Calculate spending by Category for Recharts
  const categories = ['Food', 'Transport', 'Education', 'Entertainment', 'Others'];
  const spendingByCategory = categories.map(cat => {
    const total = expenses
      .filter(e => e.category === cat)
      .reduce((acc, curr) => acc + curr.amount, 0);
    return { name: cat, Spending: total };
  });

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  const COLORS = ['#6C63FF', '#4285F4', '#34A853', '#FBBC05', '#EA4335'];

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
              id="back-button-expenses"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <CreditCard className="w-8 h-8 text-brand-primary" />
          Expense Tracker
        </h1>
        <p className="text-slate-500 font-light mt-1">
          Monitor your academic budgets and log costs utilizing manual configurations or natural language dictation.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Input logs (NLP dictation + Manual form) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. NLP / Voice dictate */}
          <div className="glass-card rounded-3xl p-6 shadow-sm border-l-4 border-l-brand-primary bg-linear-to-b from-white to-slate-50">
            <h3 className="text-md font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              AI Voice & Text Dictation
            </h3>
            <p className="text-xs text-slate-500 font-light leading-relaxed mb-4">
              Type or record your transactions naturally. E.g., "I spent twenty dollars on bus tickets" or "subway coffee lunch $8.40".
            </p>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Spent $12.50 on textbooks today"
                  value={nlpText}
                  onChange={(e) => setNlpText(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 glass-card border border-slate-200 rounded-2xl text-xs font-medium focus:ring-1 focus:ring-brand-primary focus:outline-hidden"
                />
                
                <button
                  type="button"
                  onClick={startVoiceMock}
                  className={`absolute right-3 top-2.5 p-1.5 rounded-xl transition-colors ${
                    isRecording 
                      ? 'bg-rose-500 text-white animate-pulse' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                  title="Mock Voice Dictation"
                >
                  <Mic className="w-4.5 h-4.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleNlpParse}
                disabled={isParsingNlp || !nlpText.trim()}
                className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isParsingNlp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    AI Analyzing Grammar...
                  </>
                ) : nlpSuccess ? (
                  <>
                    <CheckCircle className="w-4.5 h-4.5 text-white" />
                    Logged successfully!
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Process with Gemini NLP
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 2. Manual Form */}
          <div className="glass-card rounded-3xl p-6 shadow-sm">
            <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-slate-400" />
              Log Cost Manually
            </h3>

            <form onSubmit={handleManualAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-1 focus:ring-brand-primary focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-1 focus:ring-brand-primary focus:outline-hidden"
                  >
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Education">Education</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Starbucks coffee with team"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-brand-primary focus:outline-hidden"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs transition-transform active:scale-95"
              >
                Log Transaction
              </button>
            </form>
          </div>

        </div>

        {/* Right: Charts and budget logs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Semester Spend</span>
              <h2 className="text-3xl font-extrabold text-slate-800 mt-2 flex items-center">
                <DollarSign className="w-6 h-6 text-brand-primary shrink-0" />
                {totalSpent.toFixed(2)}
              </h2>
            </div>

            <div className="glass-card rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">AI Budget Advice</span>
              <p className="text-xs text-slate-500 mt-2 font-light leading-relaxed">
                You spent <strong className="font-semibold text-rose-500">18% less</strong> on transport this week. AI advises diverting savings to Textbook assets.
              </p>
            </div>
          </div>

          {/* Recharts chart: Category bar heights */}
          <div className="glass-card rounded-3xl p-6 shadow-xs">
            <h3 className="text-md font-bold text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-primary" />
              Categorized Spend Breakdown
            </h3>

            <div className="h-[220px] text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendingByCategory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="Spending" fill="#6C63FF" radius={[6, 6, 0, 0]}>
                    {spendingByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Ledger table */}
          <div className="glass-card rounded-3xl p-6 shadow-xs">
            <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
              <List className="w-5 h-5 text-slate-400" />
              Academic Spend Ledger
            </h3>
            
            <div className="divide-y divide-slate-100 max-h-[180px] overflow-y-auto pr-1">
              {expenses.map((exp) => (
                <div key={exp.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800">{exp.description}</h4>
                    <span className="text-[10px] text-slate-400">{exp.category} • {exp.date}</span>
                  </div>
                  <span className="font-bold text-slate-800">${exp.amount.toFixed(2)}</span>
                </div>
              ))}

              {expenses.length === 0 && (
                <p className="text-center py-8 text-slate-400 font-light">No ledger entries registered yet.</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
