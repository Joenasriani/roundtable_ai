
import React, { lazy, Suspense, useState, useCallback, useEffect } from 'react';
import { generateRoundtableAnalysis } from './services/geminiService';
import type { ExportOptions } from './services/pdfService';
import { SAMPLE_PREMIUM_RESULT } from './mock-data';
import { RoundtableResponse } from './types';
import { Send, Loader2, BookOpen, AlertCircle, RefreshCw, ShieldAlert, Key, CreditCard, Lock, CheckCircle2, Zap, Shield, Globe, MessageSquare, Award, ChevronDown, Settings, X, ExternalLink, FileText, CheckSquare, Download, Users, BarChart3, Scale } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { motion, AnimatePresence } from 'motion/react';

const ExpertPanel = lazy(() => import('./components/ExpertPanel'));
const DebateSection = lazy(() => import('./components/DebateSection'));
const VerdictSection = lazy(() => import('./components/VerdictSection'));
const AnalysisChart = lazy(() => import('./components/AnalysisChart'));

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-indigo-600" />
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
  </div>
);

const PricingCard = ({ title, price, features, isPro, onAction, children }: { title: string, price: string, features: string[], isPro?: boolean, onAction: () => void, children?: React.ReactNode }) => (
  <div className={`p-8 rounded-3xl border-2 flex flex-col ${isPro ? 'border-indigo-600 bg-white shadow-xl relative scale-105 z-10' : 'border-slate-100 bg-slate-50/50'}`}>
    {isPro && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
        Managed Session
      </div>
    )}
    <div className="mb-8">
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-extrabold text-slate-900">{price}</span>
        <span className="text-slate-500 text-sm">/session</span>
      </div>
    </div>
    <ul className="space-y-4 mb-8 flex-1">
      {features.map((f, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
          <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${isPro ? 'text-indigo-600' : 'text-slate-400'}`} />
          {f}
        </li>
      ))}
    </ul>
    {!children ? (
      <button
        onClick={onAction}
        className={`w-full py-4 rounded-xl font-bold transition-all ${isPro ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200' : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'}`}
      >
        {isPro ? 'Use Managed Roundtable' : 'Use Your Own Key'}
      </button>
    ) : children}
  </div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left hover:text-indigo-600 transition-colors"
      >
        <span className="font-bold text-slate-900">{question}</span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pb-6 text-slate-600 text-sm leading-relaxed animate-in fade-in slide-in-from-top-2">
          {answer}
        </div>
      )}
    </div>
  );
};

const ExpertSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 opacity-40">
    {[...Array(14)].map((_, i) => (
      <div key={i} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm animate-pulse">
        <div className="w-12 h-12 bg-slate-100 rounded-xl mb-4" />
        <div className="h-4 bg-slate-100 rounded w-1/3 mb-4" />
        <div className="h-2 bg-slate-100 rounded w-full mb-2" />
        <div className="h-2 bg-slate-100 rounded w-2/3" />
      </div>
    ))}
  </div>
);

const SteppedLoading = () => {
  const [step, setStep] = useState(0);
  const steps = [
    { title: "Lens Preparation", desc: "Preparing fourteen disciplinary reasoning lenses...", icon: Users, color: "text-indigo-500", bg: "bg-indigo-50" },
    { title: "Independent Lens Passes", desc: "Running each lens against the same problem...", icon: Zap, color: "text-indigo-500", bg: "bg-indigo-50" },
    { title: "Cross Lens Comparison", desc: "Comparing agreements, conflicts, assumptions, and missing evidence...", icon: BarChart3, color: "text-indigo-500", bg: "bg-indigo-50" },
    { title: "Synthesis", desc: "Combining supported conclusions while preserving unresolved disagreement...", icon: Scale, color: "text-indigo-500", bg: "bg-indigo-50" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="max-w-4xl mx-auto mt-16 space-y-12">
      <div className="text-center space-y-6">
        <div className="relative inline-block">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className={`w-20 h-20 ${steps[step].bg} rounded-3xl flex items-center justify-center relative z-10 shadow-xl border border-white`}
            >
              <div className="absolute inset-0 bg-current opacity-10 animate-ping rounded-3xl" style={{ color: steps[step].color.replace('text-', '') }} />
              {React.createElement(steps[step].icon, { className: `w-10 h-10 ${steps[step].color}` })}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{steps[step].title}</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">
            {steps[step].desc}
          </p>
        </div>

        <div className="flex justify-center gap-3">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-700 ${
                i <= step ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200'
              }`} 
            />
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-t from-slate-50 to-transparent z-10 pointer-events-none" />
        <ExpertSkeleton />
      </div>

      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm">
          <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Comparing Reasoning Lenses</span>
        </div>
      </div>
    </div>
  );
};

const PDFExportModal = ({ 
  isOpen, 
  onClose, 
  onExport, 
  result, 
  options, 
  setOptions 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onExport: () => void, 
  result: RoundtableResponse, 
  options: ExportOptions, 
  setOptions: React.Dispatch<React.SetStateAction<ExportOptions>> 
}) => {
  if (!isOpen) return null;

  const toggleExpert = (field: string) => {
    setOptions(prev => ({
      ...prev,
      selectedExperts: prev.selectedExperts.includes(field)
        ? prev.selectedExperts.filter(f => f !== field)
        : [...prev.selectedExperts, field]
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Customize Export
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-white hover:text-slate-600 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reasoning Lenses to Include</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.experts.map(expert => (
                <button
                  key={expert.field}
                  onClick={() => toggleExpert(expert.field)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    options.selectedExperts.includes(expert.field)
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900'
                      : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    options.selectedExperts.includes(expert.field) 
                      ? 'bg-indigo-600 border-indigo-600' 
                      : 'bg-white border-slate-300'
                  }`}>
                    {options.selectedExperts.includes(expert.field) && <CheckSquare className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm font-bold">{expert.field}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Section Inclusion</h3>
            <div className="space-y-2">
              {[
                { key: 'includeDebate', label: 'Cross Lens Comparison' },
                { key: 'includeAgreements', label: 'Shared Findings' },
                { key: 'includeConflicts', label: 'Unresolved Conflicts' },
                { key: 'includeVerdict', label: 'Final Synthesis' }
              ].map(sec => (
                <label key={sec.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                  <span className="text-sm font-medium text-slate-700">{sec.label}</span>
                  <input 
                    type="checkbox" 
                    checked={options[sec.key as keyof ExportOptions] as boolean}
                    onChange={(e) => setOptions(prev => ({ ...prev, [sec.key]: e.target.checked }))}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onExport}
            disabled={options.selectedExperts.length === 0}
            className="flex-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200"
          >
            Download reasoning record
          </button>
        </div>
      </div>
    </div>
  );
};

const isValidApiKey = (key: string) => {
  if (!key) return true;
  return key.startsWith('sk-or-');
};

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RoundtableResponse | null>(null);
  const [isSample, setIsSample] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [isPaid, setIsPaid] = useState<boolean>((() => {
    return sessionStorage.getItem('roundtable_paid') === 'true';
  })());
  const [showSettings, setShowSettings] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isFreeMode, setIsFreeMode] = useState(false);
  const [customProvider, setCustomProvider] = useState<'openrouter'>(() => 'openrouter');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    selectedExperts: [],
    includeDebate: true,
    includeAgreements: true,
    includeConflicts: true,
    includeVerdict: true
  });
  const [customKey, setCustomKey] = useState<string>(() => localStorage.getItem('roundtable_custom_key') || '');
  const [useCustomKey, setUseCustomKey] = useState<boolean>(() => localStorage.getItem('roundtable_use_custom_key') === 'true');

  const rawClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const paypalClientId = (rawClientId && !rawClientId.includes('@') && rawClientId !== 'YOUR_PAYPAL_CLIENT_ID') 
    ? rawClientId 
    : 'sb';

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        try {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasKey(selected);
        } catch (e) {
          console.error("Error checking API key:", e);
          setHasKey(true);
        }
      } else {
        setHasKey(true);
      }
    };
    checkKey();

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  useEffect(() => {
    if (result) {
      setExportOptions(prev => ({
        ...prev,
        selectedExperts: result.experts.map(e => e.field)
      }));
    }
  }, [result]);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
        if (selected) setError(null);
      } catch (e) {
        console.error("Error opening key selection:", e);
      }
    }
  };

  const handlePay = () => {
    document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePayPalSuccess = () => {
    setIsPaid(true);
    setIsFreeMode(false);
    sessionStorage.setItem('roundtable_paid', 'true');
    setError(null);
  };

  const handleShowSample = () => {
    setResult(SAMPLE_PREMIUM_RESULT);
    setIsSample(true);
    setInput("The integration of Artificial Intelligence in global healthcare infrastructure.");
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      document.getElementById('analysis-results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCloseSample = () => {
    setResult(null);
    setIsSample(false);
    setInput("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalyze = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    
    if (!isPaid && !useCustomKey && !isFreeMode) {
      setError("Choose a session option to continue: $1 with your own OpenRouter key, or $5 for the managed OpenRouter session.");
      handlePay();
      return;
    }

    if (useCustomKey && !isValidApiKey(customKey)) {
      setError('The provided OpenRouter API key is in an incorrect format. Please verify it in settings.');
      setShowSettings(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setIsSample(false);

    try {
      const provider = 'openrouter';
      const key = useCustomKey ? customKey : undefined;

      const data = await generateRoundtableAnalysis(input, key, provider);
      setResult(data);
      
      if (isPaid && !useCustomKey) {
        setIsPaid(false);
        sessionStorage.removeItem('roundtable_paid');
      }

      if (isFreeMode && !isPaid) {
        setIsFreeMode(false);
      }
    } catch (err: any) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('API key') || errMsg.includes('Unauthorized') || errMsg.includes('Invalid')) {
        setHasKey(false);
        setError('The OpenRouter API key is invalid or quota-limited. Please provide a valid OpenRouter key.');
      } else {
        setError(errMsg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, isPaid, useCustomKey, customKey]);

  return (
    <PayPalScriptProvider options={{ "client-id": paypalClientId, currency: "USD" }}>
      <div className="min-h-screen bg-slate-50 pb-20 pt-4">
      <nav className="sticky top-4 z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm">
          <div className="px-4 sm:px-6">
            <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-sm">
                <div className="w-5 h-5 rounded-full bg-white" />
              </div>
              <span className="font-extrabold text-slate-900 text-2xl tracking-tighter">Roundtable AI</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                {useCustomKey ? 'Custom API Mode' : 'Standard Mode'}
              </div>
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                title="AI Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              {showInstallBtn && (
                <button 
                  onClick={handleInstallClick}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors border border-slate-200"
                  title="Install App"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install
                </button>
              )}
              {!isPaid && !useCustomKey && (
                <button
                  onClick={handlePay}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Use Managed Session
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {!result && !isLoading && (
          <>
            <div className="max-w-4xl mx-auto text-center mb-16 py-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                <Award className="w-4 h-4" />
                Fourteen Lenses, One Problem
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
                Fourteen Disciplinary <br />
                <span className="text-indigo-600">Reasoning Lenses</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-4xl mx-auto">
                Submit one problem to fourteen disciplinary model lenses covering physics, biology, medicine, psychology, psychotherapy, chemistry, mathematics, computer science, robotics, music and sound science, systems science, economics, ethics, and anthropology. Compare where the outputs agree, conflict, rely on assumptions, or lack evidence.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                <button 
                  onClick={() => document.getElementById('input-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  Start Analysis
                  <Zap className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  Session Options
                </button>
                <button 
                  onClick={handleShowSample}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-indigo-100"
                >
                  <BookOpen className="w-5 h-5 text-indigo-200 group-hover:scale-110 transition-transform" />
                  View Sample Output
                </button>
              </div>

              <div className="max-w-xl mx-auto mb-8 bg-slate-100/50 border border-slate-200 p-5 rounded-[2rem] text-center">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-600 text-[13px] font-medium leading-relaxed">
                  <div className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100">
                      <Key className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span><strong className="text-slate-900 font-bold">Your OpenRouter Key:</strong> direct provider access</span>
                  </div>
                  <div className="hidden sm:block w-px h-6 bg-slate-200" />
                  <div className={`flex items-center gap-2 group transition-all ${isFreeMode ? 'scale-105' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${isFreeMode ? 'bg-indigo-500' : 'bg-indigo-600'}`}>
                      <div className="w-3 h-3 rounded-full bg-white" />
                    </div>
                    <span>
                      <strong className={`${isFreeMode ? 'text-indigo-600' : 'text-indigo-600'} font-bold`}>
                        {isFreeMode ? 'Own Key Session Active' : 'Managed Session:'}
                      </strong> 
                      {isFreeMode ? ' using your OpenRouter account' : ' fourteen lens workflow using the managed model'}
                    </span>
                  </div>
                </div>
              </div>

              <div id="input-section" className="max-w-2xl mx-auto scroll-mt-24">
                <div className="relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter a thought, puzzle, question, or complex situation for analysis..."
                    className="w-full h-32 p-4 pr-12 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none text-slate-700 shadow-sm"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleAnalyze}
                    disabled={isLoading || !input.trim()}
                    className="absolute bottom-4 right-4 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
              <FeatureCard 
                icon={Globe} 
                title="14 Reasoning Lenses" 
                description="The same problem is examined through fourteen disciplinary model lenses from physics through ethics." 
              />
              <FeatureCard 
                icon={Shield} 
                title="Evidence Labels" 
                description="Claims receive explicit evidence labels, but consequential claims still require source verification." 
              />
              <FeatureCard 
                icon={Zap} 
                title="Cross Lens Comparison" 
                description="The system compares agreements, conflicts, assumptions, and missing evidence without forcing consensus." 
              />
            </div>

            <div className="mb-24 py-16 bg-white rounded-[3rem] border border-slate-100 shadow-sm px-8 md:px-16">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">How the Comparison Runs</h2>
                <p className="text-slate-500">One question passes through independent disciplinary lenses before their outputs are compared.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                {[
                  { step: "01", title: "Input", desc: "Submit the situation or question." },
                  { step: "02", title: "Lens Passes", desc: "Fourteen reasoning lenses evaluate the same question independently." },
                  { step: "03", title: "Comparison", desc: "Outputs are compared for agreement, conflict, assumptions, and missing evidence." },
                  { step: "04", title: "Synthesis", desc: "The final synthesis preserves uncertainty and unresolved disagreement." }
                ].map((s, i) => (
                  <div key={i} className="relative">
                    <div className="text-5xl font-black text-indigo-50 mb-4">{s.step}</div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div id="pricing-section" className="mb-24 scroll-mt-24">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Choose How to Run the Session</h2>
                <p className="text-slate-500">Choose $1 with your own OpenRouter key or $5 for the managed OpenRouter session.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <PricingCard 
                  title="Your OpenRouter Key" 
                  price="$1.00" 
                  features={[
                    "One fourteen lens session",
                    "Use your own OpenRouter API key",
                    "Provider billed model access",
                    "One session access"
                  ]}
                  onAction={() => {}}
                >
                  <div className="mt-4">
                    <PayPalButtons
                      style={{ layout: "horizontal", height: 40 }}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          intent: "CAPTURE",
                          purchase_units: [{
                            amount: {
                              currency_code: "USD",
                              value: "1.00",
                            },
                            payee: {
                              email_address: "joenasr@gmail.com"
                            },
                            description: "Roundtable AI OpenRouter Key Session",
                          }],
                        });
                      }}
                      onApprove={(data, actions) => {
                        if (actions.order) {
                          return actions.order.capture().then(() => {
                            setIsFreeMode(true);
                            setIsPaid(false);
                            sessionStorage.removeItem('roundtable_paid');
                            setError(null);
                            document.getElementById('input-section')?.scrollIntoView({ behavior: 'smooth' });
                          });
                        }
                        return Promise.resolve();
                      }}
                    />
                  </div>
                </PricingCard>
                <PricingCard 
                  title="Managed Roundtable" 
                  price="$5.00" 
                  isPro={true}
                  features={[
                    "Fourteen disciplinary reasoning lenses",
                    "Managed OpenRouter session",
                    "Cross lens comparison",
                    "PDF reasoning record",
                    "Explicit evidence labels",
                    "Economic and ethical lenses",
                    "Model reported confidence field"
                  ]}
                  onAction={() => {}}
                >
                  <div className="mt-4">
                    <PayPalButtons
                      style={{ layout: "horizontal", height: 40 }}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          intent: "CAPTURE",
                          purchase_units: [{
                            amount: {
                              currency_code: "USD",
                              value: "5.00",
                            },
                            payee: {
                              email_address: "joenasr@gmail.com"
                            },
                            description: "Roundtable AI Managed Session",
                          }],
                        });
                      }}
                      onApprove={(data, actions) => {
                        if (actions.order) {
                          return actions.order.capture().then(() => {
                            handlePayPalSuccess();
                          });
                        }
                        return Promise.resolve();
                      }}
                    />
                    <button 
                      onClick={handleShowSample}
                      className="w-full mt-4 py-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Preview Sample Output
                    </button>
                  </div>
                </PricingCard>
              </div>
            </div>

            <div className="mb-24 max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">What the Output Is</h2>
                <p className="text-slate-500">A structured comparison of model generated disciplinary perspectives, with disagreement and uncertainty kept visible.</p>
              </div>
              <div className="bg-white rounded-3xl border border-slate-100 p-8 text-left text-slate-600 leading-relaxed">
                The fourteen lenses are software roles. They are not a human expert panel, peer review process, clinical assessment, or professional authority. Evidence labels and confidence values are model reported fields and are not independently calibrated. Verify consequential claims against primary sources, official documentation, or qualified human review.
              </div>
            </div>

            <div className="max-w-3xl mx-auto mb-24">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
              </div>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm px-8">
                <FAQItem 
                  question="How do the fourteen reasoning lenses work?" 
                  answer="One model is instructed to analyze the same problem through fourteen disciplinary roles. These are software reasoning lenses, not human experts, academics, clinicians, or peer reviewers." 
                />
                <FAQItem 
                  question="How is payment handled?" 
                  answer="Payments shown in this interface are processed through PayPal. This application does not implement its own card storage." 
                />
                <FAQItem 
                  question="Can I use my own API key?" 
                  answer="Yes. The platform uses OpenRouter only. On the $1 option, you can use your own OpenRouter key; on the $5 option, the server key is used for the managed session." 
                />
                <FAQItem 
                  question="What kind of problems is this intended for?" 
                  answer="It is intended for problems that benefit from comparing technical, ethical, economic, scientific, and social frames. The output remains model generated and should be verified when consequences matter." 
                />
              </div>
            </div>
          </>
        )}

        {isLoading && <SteppedLoading />}

        {result && !isLoading && (
          <div id="analysis-results" className="mt-12 space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
            {isSample && (
              <div className="sticky top-24 z-20 mx-auto max-w-xl flex items-center gap-2 mb-10 px-2 lg:px-0">
                <div className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest text-center shadow-xl border border-white/20 flex items-center justify-center gap-3">
                  <span className="animate-pulse">✨</span>
                  PREVIEW: SAMPLE REASONING OUTPUT
                </div>
                <button 
                  onClick={handleCloseSample}
                  className="p-3 bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-100 hover:bg-slate-50 transition-colors group flex items-center gap-2 pr-5"
                  title="Close Preview"
                >
                  <div className="p-1 bg-slate-100 rounded-lg group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                    <X className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">Exit</span>
                </button>
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] w-full text-center mb-1">Inferred Intent</span>
              {result.intent.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                  {tag}
                </span>
              ))}
            </div>

            <Suspense fallback={<ExpertSkeleton />}><ExpertPanel experts={result.experts} /></Suspense>
            <Suspense fallback={<div className="h-72 bg-white rounded-3xl border border-slate-100 animate-pulse" />}><AnalysisChart experts={result.experts} /></Suspense>
            <Suspense fallback={<div className="h-56 bg-white rounded-3xl border border-slate-100 animate-pulse" />}><DebateSection debate={result.debate} /></Suspense>
            <Suspense fallback={<div className="h-56 bg-white rounded-3xl border border-slate-100 animate-pulse" />}><VerdictSection verdict={result.verdict} /></Suspense>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-10">
              <button 
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
              >
                <FileText className="w-5 h-5" />
                Export Reasoning Record
              </button>
              
              <button 
                onClick={() => {
                  setResult(null);
                  setInput('');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-6 py-3 text-slate-500 hover:text-indigo-600 font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Start New Analysis
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 py-10 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 text-sm">
          <p>© 2026 Roundtable AI. Model generated reasoning output; consequential claims require verification.</p>
          <div className="flex gap-6">
            <span className="flex items-center gap-1"><ShieldAlert className="w-4 h-4" /> Output Boundaries</span>
          </div>
        </div>
      </footer>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                AI Configuration
              </h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-2 text-slate-400 hover:bg-white hover:text-slate-600 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Select Provider</h3>
                
                <button
                  onClick={() => {
                    setUseCustomKey(false);
                    localStorage.setItem('roundtable_use_custom_key', 'false');
                  }}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${!useCustomKey ? 'border-indigo-600 bg-indigo-50/50 shadow-md' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                >
                  <div className={`p-2.5 rounded-xl ${!useCustomKey ? 'bg-indigo-600' : 'bg-slate-100'}`}>
                    <div className={`w-5 h-5 rounded-full ${!useCustomKey ? 'bg-white' : 'bg-slate-300'}`} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Managed Roundtable</div>
                    <div className="text-xs text-slate-500">Run the fourteen lens workflow through the managed OpenRouter session. ($5.00/session)</div>
                  </div>
                  {!useCustomKey && <CheckCircle2 className="w-5 h-5 text-indigo-600 ml-auto" />}
                </button>

                <button
                  onClick={() => {
                    setUseCustomKey(true);
                    localStorage.setItem('roundtable_use_custom_key', 'true');
                  }}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${useCustomKey ? 'border-indigo-600 bg-indigo-50/50 shadow-md' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                >
                  <div className={`p-2.5 rounded-xl ${useCustomKey ? 'bg-indigo-600' : 'bg-slate-100'}`}>
                    <Key className={`w-5 h-5 ${useCustomKey ? 'text-white' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Use Your OpenRouter Key</div>
                    <div className="text-xs text-slate-500">Use your own OpenRouter key for provider billed access.</div>
                  </div>
                  {useCustomKey && <CheckCircle2 className="w-5 h-5 text-indigo-600 ml-auto" />}
                </button>
              </div>

              {useCustomKey && (
                <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700">
                    Provider: OpenRouter (fixed)
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">OpenRouter API Key</h3>
                      <a 
                        href="https://openrouter.ai/keys" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:underline underline-offset-2"
                      >
                        Get API Key <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    
                    <div className="relative group">
                      <input 
                        type="password"
                        value={customKey}
                        onChange={(e) => {
                          setCustomKey(e.target.value);
                          localStorage.setItem('roundtable_custom_key', e.target.value);
                        }}
                        placeholder="sk-or-..."
                        className={`w-full p-4 pr-12 bg-slate-50 border-2 rounded-2xl outline-none transition-all ${
                          !customKey ? 'border-slate-100' : (isValidApiKey(customKey) ? 'border-indigo-200 focus:border-indigo-500' : 'border-rose-200 focus:border-rose-500')
                        }`}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {customKey && (
                          isValidApiKey(customKey) 
                           ? <CheckCircle2 className="w-5 h-5 text-indigo-500" /> 
                           : <AlertCircle className="w-5 h-5 text-rose-500" />
                        )}
                      </div>
                    </div>
                    
                    {customKey && !isValidApiKey(customKey) && (
                      <p className="text-[11px] text-rose-600 font-medium pl-1 flex items-center gap-1.5 animate-in fade-in">
                        <AlertCircle className="w-3 h-3" />
                        Invalid key format for OpenRouter.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={() => setShowSettings(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
              >
                Apply Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {result && (
        <PDFExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={async () => {
            const { generateProfessionalPDF } = await import('./services/pdfService');
            generateProfessionalPDF(result, input, exportOptions);
            setShowExportModal(false);
          }}
          result={result}
          options={exportOptions}
          setOptions={setExportOptions}
        />
      )}
    </div>
    </PayPalScriptProvider>
  );
};

export default App;
