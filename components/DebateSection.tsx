
import React from 'react';
import { Debate } from '../types';
import { MessageSquare, CheckCircle, AlertTriangle, Lightbulb, HelpCircle } from 'lucide-react';

interface Props {
  debate: Debate;
}

const DebateSection: React.FC<Props> = ({ debate }) => {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 lg:p-8 space-y-8 shadow-xl">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-500 rounded-lg">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold">Phase 2: Structured Interdisciplinary Debate</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <section>
            <div className="flex items-center gap-2 mb-3 text-indigo-400">
              <CheckCircle className="w-5 h-5" />
              <h3 className="font-semibold uppercase tracking-wider text-sm">Cross-Disciplinary Agreements</h3>
            </div>
            <ul className="space-y-3">
              {debate.agreements.map((item, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-300 leading-relaxed">
                  <span className="text-indigo-400 font-bold">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3 text-indigo-500">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-semibold uppercase tracking-wider text-sm">Conflicts & Contradictions</h3>
            </div>
            <div className="space-y-4">
              {debate.conflicts.map((conflict, idx) => (
                <div key={idx} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                  <p className="text-sm text-slate-200 mb-3">{conflict.description}</p>
                  <div className="flex flex-wrap gap-4 text-[10px] font-mono">
                    <div className="flex flex-col">
                      <span className="text-slate-500">Evidence</span>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${i < conflict.evidenceStrength ? 'bg-indigo-400' : 'bg-slate-700'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-500">Impact</span>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${i < conflict.realWorldImpact ? 'bg-rose-400' : 'bg-slate-700'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-500">Risk</span>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${i < conflict.riskIfIncorrect ? 'bg-indigo-400' : 'bg-slate-700'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section>
            <div className="flex items-center gap-2 mb-3 text-indigo-400">
              <Lightbulb className="w-5 h-5" />
              <h3 className="font-semibold uppercase tracking-wider text-sm">Synthesis & Resolution</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed bg-indigo-500/10 p-5 rounded-2xl border border-indigo-500/30">
              {debate.resolution}
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3 text-slate-400">
              <HelpCircle className="w-5 h-5" />
              <h3 className="font-semibold uppercase tracking-wider text-sm">Remaining Uncertainty</h3>
            </div>
            <p className="text-sm text-slate-400 italic leading-relaxed">
              {debate.uncertainty}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DebateSection;
