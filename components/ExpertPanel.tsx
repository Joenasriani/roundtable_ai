
import React, { useState } from 'react';
import { ExpertAnalysis } from '../types';
import { EXPERTS } from '../constants';
import ClaimBadge from './ClaimBadge';
import { ChevronDown, ChevronUp, Beaker, Globe, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';

interface Props {
  experts: ExpertAnalysis[];
}

const ExpertPanel: React.FC<Props> = ({ experts }) => {
  const [expandedField, setExpandedField] = useState<string | null>(null);

  const springTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 1
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
            <Beaker className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Phase 1: Expert Synthesis</h2>
            <p className="text-sm text-slate-500 font-medium">Independent deep-dives from 14 academic specialists.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[11px] font-bold uppercase tracking-wider self-start md:self-center">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          Live Search Grounding Active
        </div>
      </div>

      <LayoutGroup>
        <motion.div 
          layout
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-min"
        >
          {experts.map((analysis) => {
            const expertConfig = EXPERTS.find(e => e.field === analysis.field);
            const isExpanded = expandedField === analysis.field;

            return (
              <motion.div 
                key={analysis.field} 
                layout
                transition={springTransition}
                variants={item}
                className={`group relative overflow-hidden rounded-3xl border-2 transition-colors duration-300 ${
                  isExpanded 
                    ? 'border-indigo-600 bg-white shadow-xl z-20 col-span-full' 
                    : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md z-10'
                }`}
              >
                {/* Background Accent */}
                {expertConfig?.color && (
                  <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 opacity-[0.03] rounded-full ${expertConfig.color.split(' ')[0]}`} />
                )}

                <motion.button 
                  layout="position"
                  transition={springTransition}
                  onClick={() => setExpandedField(isExpanded ? null : analysis.field)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <div className="flex items-center gap-4">
                    <motion.div layout transition={springTransition} className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${expertConfig?.color}`}>
                      {expertConfig?.icon}
                    </motion.div>
                    <motion.div layout transition={springTransition}>
                      <h3 className="font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors uppercase text-xs tracking-wider">{analysis.field}</h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">ESTABLISHED FIELD</p>
                    </motion.div>
                  </div>
                  <motion.div layout transition={springTransition} className={`p-2 rounded-full transition-colors ${isExpanded ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </motion.div>
                </motion.button>

                <AnimatePresence mode="wait">
                  {isExpanded && (
                    <motion.div 
                      key="content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-8 space-y-6 pt-2 border-t border-slate-50"
                    >
                      <section>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Domain Analysis</h4>
                        <div className="relative">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-transparent rounded-full" />
                          <p className="text-[13px] text-slate-700 leading-relaxed italic pl-5 font-medium">
                            "{analysis.technicalAnalysis}"
                          </p>
                        </div>
                      </section>

                      <section>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Core Interpretation</h4>
                        <p className="text-sm text-slate-600 leading-relaxed font-normal">
                          {analysis.plainLanguage}
                        </p>
                      </section>

                      <section>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Evidence Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.keyClaims.map((claim, idx) => (
                            <div key={idx} className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex-1 min-w-[200px]">
                              <p className="text-xs text-slate-700 leading-snug mb-2 font-medium">{claim.text}</p>
                              <ClaimBadge label={claim.label} />
                            </div>
                          ))}
                        </div>
                      </section>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </LayoutGroup>
    </div>
  );
};

export default ExpertPanel;
