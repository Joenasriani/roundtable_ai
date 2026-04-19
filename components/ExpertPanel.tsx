
import React, { useState } from 'react';
import { ExpertAnalysis, ExpertField } from '../types';
import { EXPERTS } from '../constants';
import ClaimBadge from './ClaimBadge';
import { ChevronDown, ChevronUp, Beaker, Globe } from 'lucide-react';

interface Props {
  experts: ExpertAnalysis[];
}

const ExpertPanel: React.FC<Props> = ({ experts }) => {
  const [expandedField, setExpandedField] = useState<string | null>(experts[0]?.field || null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Beaker className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Phase 1: Independent Expert Analysis</h2>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
          <Globe className="w-3 h-3 animate-spin-slow" />
          Live Web Search Grounding Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {experts.map((analysis) => {
          const expertConfig = EXPERTS.find(e => e.field === analysis.field);
          const isExpanded = expandedField === analysis.field;

          return (
            <div 
              key={analysis.field} 
              className={`border rounded-xl bg-white shadow-sm transition-all duration-200 ${isExpanded ? 'ring-2 ring-indigo-500' : 'hover:border-indigo-300'}`}
            >
              <button 
                onClick={() => setExpandedField(isExpanded ? null : analysis.field)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${expertConfig?.color}`}>
                    {expertConfig?.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 leading-tight">{analysis.field}</h3>
                    <p className="text-xs text-slate-500">Academic Specialist</p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-slate-50 mt-2 space-y-4 pt-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Technical Analysis</p>
                    <p className="text-sm text-slate-700 leading-relaxed italic border-l-2 border-slate-200 pl-3">
                      {analysis.technicalAnalysis}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Plain-Language Interpretation</p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {analysis.plainLanguage}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Key Evidence Claims</p>
                    <ul className="space-y-2">
                      {analysis.keyClaims.map((claim, idx) => (
                        <li key={idx} className="bg-slate-50 p-2 rounded border border-slate-100 flex flex-col gap-1">
                          <p className="text-xs text-slate-700">{claim.text}</p>
                          <div className="mt-1">
                            <ClaimBadge label={claim.label} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpertPanel;
