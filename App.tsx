
import React, { useState, useCallback, useEffect } from 'react';
import { generateRoundtableAnalysis } from './services/geminiService';
import { RoundtableResponse } from './types';
import ExpertPanel from './components/ExpertPanel';
import DebateSection from './components/DebateSection';
import VerdictSection from './components/VerdictSection';
import AnalysisChart from './components/AnalysisChart';
// Added ShieldAlert to the imports
import { Send, Loader2, BookOpen, AlertCircle, RefreshCw, ShieldAlert, Key, CreditCard, Lock, CheckCircle2, Zap, Shield, Globe, MessageSquare, Award, ChevronDown, Settings, X, ExternalLink } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

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
        Most Popular
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
        {isPro ? 'Upgrade to Pro' : 'Use Free Version'}
      </button>
    ) : children}
  </div>
);

const Testimonial = ({ quote, author, role, avatar }: { quote: string, author: string, role: string, avatar: string }) => (
  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-700 relative">
    <div className="mb-4 text-indigo-400 opacity-20">
      <MessageSquare className="w-10 h-10" />
    </div>
    <p className="mb-6 relative z-10">"{quote}"</p>
    <div className="flex items-center gap-3 not-italic">
      <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
        <img src={avatar} alt={author} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>
      <div>
        <div className="text-sm font-bold text-slate-900">{author}</div>
        <div className="text-xs text-slate-500">{role}</div>
      </div>
    </div>
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

const isValidGeminiKey = (key: string) => {
  if (!key) return true; // Don't show error for empty
  return /^AIzaSy[A-Za-z0-9_-]{33}$/.test(key);
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
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [isPaid, setIsPaid] = useState<boolean>((() => {
    return sessionStorage.getItem('roundtable_paid') === 'true';
  })());
  const [showSettings, setShowSettings] = useState(false);
  const [customKey, setCustomKey] = useState<string>(() => localStorage.getItem('roundtable_custom_key') || '');
  const [useCustomKey, setUseCustomKey] = useState<boolean>(() => localStorage.getItem('roundtable_use_custom_key') === 'true');

  // Sanitize PayPal Client ID
  const rawClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const paypalClientId = (rawClientId && !rawClientId.includes('@') && rawClientId !== 'YOUR_PAYPAL_CLIENT_ID') 
    ? rawClientId 
    : 'sb'; // Fallback to 'sb' (PayPal Sandbox default)

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        try {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasKey(selected);
        } catch (e) {
          console.error("Error checking API key:", e);
          setHasKey(true); // Assume okay if check fails
        }
      } else {
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

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
    // Direct scroll to payment section
    document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePayPalSuccess = () => {
    setIsPaid(true);
    sessionStorage.setItem('roundtable_paid', 'true');
    setError(null);
  };

  const handleAnalyze = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    
    // Only enforce payment if NOT using a custom key
    if (!isPaid && !useCustomKey) {
      setError("Please unlock the full reasoning engine or connect your own API key to perform an analysis.");
      return;
    }

    if (useCustomKey && !isValidGeminiKey(customKey)) {
      setError("The provided Gemini API key is in an incorrect format. Please verify it in settings.");
      setShowSettings(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const analysis = await generateRoundtableAnalysis(input, useCustomKey ? customKey : undefined);
      setResult(analysis);
      
      // Consume the paid session after one successful analysis
      if (isPaid && !useCustomKey) {
        setIsPaid(false);
        sessionStorage.removeItem('roundtable_paid');
      }
    } catch (err: any) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg === 'API_KEY_INVALID' || errMsg.includes('API key not valid')) {
        setHasKey(false);
        setError('The free API quota might be exhausted or the key is invalid. Please connect a valid Google Cloud API key to continue.');
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
      {/* Navigation / Header */}
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
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {useCustomKey ? 'Custom API Mode' : 'Standard Mode'}
              </div>
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                title="AI Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              {!isPaid && !useCustomKey && (
                <button
                  onClick={handlePay}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Unlock Full Engine
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Paywall Banner */}
        {!isPaid && !useCustomKey && (
          <div className="max-w-4xl mx-auto mb-12 p-8 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Lock className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Unlock the Elite Reasoning Engine</h2>
              <p className="text-indigo-100 mb-8 max-w-xl text-lg leading-relaxed">
                The free version provides basic analysis. Unlock the full 14-expert interdisciplinary roundtable for rigorous, production-grade insights and strategic reasoning.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="w-full sm:w-auto min-w-[200px]">
                  <PayPalButtons
                    style={{ layout: "horizontal", height: 48 }}
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
                          description: "Roundtable AI Pro Session Unlock",
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
                </div>
                <div className="flex items-center gap-2 text-indigo-200 text-sm font-medium">
                  <ShieldAlert className="w-5 h-5" />
                  One-time $1 payment for session access
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Intro Section */}
        {!result && !isLoading && (
          <>
            <div className="max-w-4xl mx-auto text-center mb-16 py-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                <Award className="w-4 h-4" />
                The Gold Standard in Interdisciplinary AI
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
                Elite Interdisciplinary <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">Reasoning Engine</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-3xl mx-auto">
                Submit complex problems to a closed-room roundtable of 14 elite academic experts. 
                Get rigorous analysis, interdisciplinary debate, and a definitive structured verdict.
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
                  Access Tiers
                </button>
              </div>

              {/* Intelligence Layer Selection Description */}
              <div className="max-w-xl mx-auto mb-8 bg-slate-100/50 border border-slate-200 p-5 rounded-[2rem] text-center">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-600 text-[13px] font-medium leading-relaxed">
                  <div className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100">
                      <Key className="w-4 h-4 text-violet-600" />
                    </div>
                    <span><strong className="text-slate-900 font-bold">BYO Key:</strong> Connect your private API for free access</span>
                  </div>
                  <div className="hidden sm:block w-px h-6 bg-slate-200" />
                  <div className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-md">
                      <div className="w-3 h-3 rounded-full bg-white" />
                    </div>
                    <span><strong className="text-indigo-600 font-bold">Elite Managed:</strong> Use our curated core of 14 academic experts</span>
                  </div>
                </div>
              </div>

              {/* Input Form - Moved here */}
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

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
              <FeatureCard 
                icon={Globe} 
                title="14 Expert Lenses" 
                description="From Physics to Ethics, our engine simulates a diverse panel of specialists for true 360° reasoning." 
              />
              <FeatureCard 
                icon={Shield} 
                title="Rigorous Evidence" 
                description="Every claim is tagged by evidence strength: Established Fact, Strong Evidence, or Theoretical." 
              />
              <FeatureCard 
                icon={Zap} 
                title="Interdisciplinary Debate" 
                description="Experts don't just talk; they debate. We identify conflicts and resolve them through logic." 
              />
            </div>

            {/* How it works */}
            <div className="mb-24 py-16 bg-white rounded-[3rem] border border-slate-100 shadow-sm px-8 md:px-16">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">The Roundtable Process</h2>
                <p className="text-slate-500">A structured workflow inspired by elite academic research panels.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                {[
                  { step: "01", title: "Input", desc: "Submit your complex situation or question." },
                  { step: "02", title: "Analysis", desc: "14 experts evaluate independently in their domains." },
                  { step: "03", title: "Debate", desc: "Interdisciplinary cross-examination and conflict resolution." },
                  { step: "04", title: "Verdict", desc: "A final, multi-layered synthesis with confidence levels." }
                ].map((s, i) => (
                  <div key={i} className="relative">
                    <div className="text-5xl font-black text-indigo-50 mb-4">{s.step}</div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Section */}
            <div id="pricing-section" className="mb-24 scroll-mt-24">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Select Your Intelligence Tier</h2>
                <p className="text-slate-500">Choose between private infrastructure or our managed expert ensemble.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <PricingCard 
                  title="Private API (BYO)" 
                  price="Free" 
                  features={[
                    "Connect your own Gemini key",
                    "Unrestricted usage volume",
                    "Zero session fees",
                    "Privacy & key sovereignty",
                    "Direct-to-model latency"
                  ]}
                  onAction={() => document.getElementById('input-section')?.scrollIntoView({ behavior: 'smooth' })}
                />
                <PricingCard 
                  title="Elite Roundtable" 
                  price="$1" 
                  isPro={true}
                  features={[
                    "Full 14-expert panel",
                    "Deep interdisciplinary debate",
                    "Evidence-tagged claims",
                    "Economic & Ethical governance",
                    "Priority processing",
                    "Confidence level metrics"
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
                            description: "Roundtable AI Pro Session Unlock",
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
                  </div>
                </PricingCard>
              </div>
            </div>

            {/* Testimonials */}
            <div className="mb-24">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Trusted by Strategic Thinkers</h2>
                <p className="text-slate-500">Join the elite users leveraging interdisciplinary AI.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Testimonial 
                  quote="The depth of analysis is unparalleled. It's like having a board of directors for every decision."
                  author="Sarah Chen"
                  role="Strategic Consultant"
                  avatar="https://picsum.photos/seed/sarah/100/100"
                />
                <Testimonial 
                  quote="Finally, an AI that doesn't just guess, but reasons through multiple academic lenses."
                  author="Dr. Marcus Thorne"
                  role="Research Director"
                  avatar="https://picsum.photos/seed/marcus/100/100"
                />
                <Testimonial 
                  quote="The interdisciplinary debate section alone saved us weeks of cross-departmental meetings."
                  author="Elena Rodriguez"
                  role="Product Lead"
                  avatar="https://picsum.photos/seed/elena/100/100"
                />
              </div>
            </div>

            {/* FAQ */}
            <div className="max-w-3xl mx-auto mb-24">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
              </div>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm px-8">
                <FAQItem 
                  question="How does the 14-expert simulation work?" 
                  answer="We use advanced prompt engineering and multi-persona modeling to ensure each expert reasons strictly within their defined academic domain, preventing cross-contamination of logic until the debate phase." 
                />
                <FAQItem 
                  question="Is the payment secure?" 
                  answer="Yes. Payments are processed by PayPal, and card details never pass through this app's servers." 
                />
                <FAQItem 
                  question="Can I use my own API key?" 
                  answer="Yes. In Settings, switch to Private API Integration and add your Gemini key to run analyses without paying per session." 
                />
                <FAQItem 
                  question="What kind of problems is this best for?" 
                  answer="It excels at complex, multi-faceted problems where technical, ethical, and economic factors collide—such as policy decisions, product strategy, or philosophical puzzles." 
                />
              </div>
            </div>
          </>
        )}

        {/* Results */}
        {isLoading && (
          <div className="max-w-4xl mx-auto mt-16 text-center space-y-6">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-indigo-200 blur-2xl opacity-20 animate-pulse" />
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin relative z-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-slate-800">Roundtable in Progress...</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                Each of the 14 experts is currently evaluating your input independently within their strictly non-overlapping field of expertise.
              </p>
            </div>
            <div className="flex justify-center gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full bg-indigo-400 animate-bounce`} style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
        )}

        {result && !isLoading && (
          <div className="mt-12 space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Classification Badges */}
            <div className="flex flex-wrap justify-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] w-full text-center mb-1">Inferred Intent</span>
              {result.intent.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                  {tag}
                </span>
              ))}
            </div>

            <ExpertPanel experts={result.experts} />
            
            <AnalysisChart experts={result.experts} />

            <DebateSection debate={result.debate} />
            
            <VerdictSection verdict={result.verdict} />

            <div className="flex justify-center pt-10">
              <button 
                onClick={() => {
                  setResult(null);
                  setInput('');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Start New Analysis
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="mt-20 py-10 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 text-sm">
          <p>© 2024 Closed Roundtable Reasoning Engine. Standardized academic knowledge only.</p>
          <div className="flex gap-6">
            {/* Added ShieldAlert from lucide-react to fix missing reference error */}
            <span className="flex items-center gap-1"><ShieldAlert className="w-4 h-4" /> Safety Constraints</span>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
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
                
                {/* Standard Provider */}
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
                    <div className="font-bold text-slate-900">Elite Managed Roundtable</div>
                    <div className="text-xs text-slate-500">Deploy our optimized ensemble of 14 academic specialists.</div>
                  </div>
                  {!useCustomKey && <CheckCircle2 className="w-5 h-5 text-indigo-600 ml-auto" />}
                </button>

                {/* Custom Provider */}
                <button
                  onClick={() => {
                    setUseCustomKey(true);
                    localStorage.setItem('roundtable_use_custom_key', 'true');
                  }}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${useCustomKey ? 'border-violet-600 bg-violet-50/50 shadow-md' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                >
                  <div className={`p-2.5 rounded-xl ${useCustomKey ? 'bg-violet-600' : 'bg-slate-100'}`}>
                    <Key className={`w-5 h-5 ${useCustomKey ? 'text-white' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Private API Integration</div>
                    <div className="text-xs text-slate-500">Use your own secure API key for unrestricted free access.</div>
                  </div>
                  {useCustomKey && <CheckCircle2 className="w-5 h-5 text-violet-600 ml-auto" />}
                </button>
              </div>

              {useCustomKey && (
                <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">API Key</h3>
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      Get Key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <input 
                        type="password"
                        value={customKey}
                        onChange={(e) => {
                          setCustomKey(e.target.value);
                          localStorage.setItem('roundtable_custom_key', e.target.value);
                        }}
                        placeholder="Paste your Gemini API key here..."
                        className={`w-full p-4 pr-12 rounded-xl border outline-none transition-all text-sm font-mono ${
                          customKey && !isValidGeminiKey(customKey) 
                            ? 'border-rose-300 focus:border-rose-500 bg-rose-50/30' 
                            : 'border-slate-200 focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10'
                        }`}
                      />
                      {customKey && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          {isValidGeminiKey(customKey) ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-rose-500" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    {customKey && !isValidGeminiKey(customKey) && (
                      <p className="text-xs text-rose-600 font-medium animate-in fade-in slide-in-from-top-1 px-1">
                        Invalid format. Keys usually start with 'AIzaSy' and are 39 characters long.
                      </p>
                    )}
                    
                    {window.aistudio && (
                      <button 
                        onClick={handleSelectKey}
                        className="w-full py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <Shield className="w-4 h-4 text-violet-600" />
                        Connect via AI Studio
                      </button>
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
    </div>
    </PayPalScriptProvider>
  );
};

export default App;
