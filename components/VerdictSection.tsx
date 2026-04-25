
import React from 'react';
import { FinalVerdict } from '../types';
import { Gavel, Target, Info, ShieldAlert, Globe, Zap, AlertCircle } from 'lucide-react';

interface Props {
  verdict: FinalVerdict;
}

const VerdictSection: React.FC<Props> = ({ verdict }) => {
  const confidencePercent = Math.round(verdict.confidenceLevel * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-indigo-600 rounded-lg text-white">
          <Gavel className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Final Multi-Layer Verdict</h2>
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 lg:p-8 bg-gradient-to-br from-indigo-50 to-white border-b border-indigo-100">
          <div className="flex items-center gap-2 mb-4 text-indigo-800">
            <Target className="w-6 h-6" />
            <h3 className="text-lg font-bold">Core Conclusion</h3>
          </div>
          <p className="text-xl lg:text-2xl font-semibold text-slate-900 leading-snug">
            {verdict.coreConclusion}
          </p>
        </div>

        <div className="p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <section>
              <div className="flex items-center gap-2 mb-2 text-slate-500">
                <Info className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-widest">Interdisciplinary Justification</h4>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{verdict.supportingEvidenceSummary}</p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-2 text-slate-500">
                <Globe className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-widest">Economic & Adoption Feasibility</h4>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{verdict.economicFeasibility}</p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-2 text-slate-500">
                <ShieldAlert className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-widest">Ethical & Governance Check</h4>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{verdict.ethicalGovernance}</p>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 mb-2 text-indigo-600">
                <Zap className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-widest">Risks & Trade-offs</h4>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{verdict.risksTradeOffs}</p>
            </section>

            <section className="bg-indigo-900 text-white p-6 rounded-xl relative overflow-hidden">
               <div className="relative z-10">
                 <h4 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Expert Confidence Level</h4>
                 <div className="flex items-end gap-2">
                   <span className="text-5xl font-bold leading-none">{confidencePercent}%</span>
                   <span className="text-xs mb-1 opacity-60 font-mono">Statistical Probability</span>
                 </div>
                 <div className="w-full bg-white/20 h-2 rounded-full mt-4 overflow-hidden">
                   <div className="bg-indigo-400 h-full transition-all duration-1000" style={{ width: `${confidencePercent}%` }} />
                 </div>
               </div>
               <Target className="absolute -right-8 -bottom-8 w-32 h-32 opacity-10" />
            </section>

            <section className="bg-rose-50 p-4 rounded-xl border border-rose-100">
              <div className="flex items-center gap-2 mb-2 text-rose-700">
                <AlertCircle className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-widest">Failure Conditions</h4>
              </div>
              <p className="text-sm text-rose-800/80 leading-relaxed italic">{verdict.failureConditions}</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerdictSection;
