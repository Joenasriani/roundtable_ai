
import React from 'react';
import { 
  Atom, 
  Dna, 
  Stethoscope, 
  Brain, 
  HeartHandshake, 
  Beaker, 
  Calculator, 
  Cpu, 
  Bot, 
  Music, 
  Network, 
  TrendingUp, 
  Scale, 
  Users 
} from 'lucide-react';
import { ExpertField } from './types';

export const EXPERTS = [
  { field: ExpertField.Physics, icon: <Atom className="w-5 h-5" />, color: 'bg-blue-100 text-blue-700' },
  { field: ExpertField.Biology, icon: <Dna className="w-5 h-5" />, color: 'bg-emerald-100 text-emerald-700' },
  { field: ExpertField.Medicine, icon: <Stethoscope className="w-5 h-5" />, color: 'bg-rose-100 text-rose-700' },
  { field: ExpertField.Psychology, icon: <Brain className="w-5 h-5" />, color: 'bg-purple-100 text-purple-700' },
  { field: ExpertField.Psychotherapy, icon: <HeartHandshake className="w-5 h-5" />, color: 'bg-pink-100 text-pink-700' },
  { field: ExpertField.Chemistry, icon: <Beaker className="w-5 h-5" />, color: 'bg-cyan-100 text-cyan-700' },
  { field: ExpertField.Mathematics, icon: <Calculator className="w-5 h-5" />, color: 'bg-amber-100 text-amber-700' },
  { field: ExpertField.ComputerScience, icon: <Cpu className="w-5 h-5" />, color: 'bg-indigo-100 text-indigo-700' },
  { field: ExpertField.Robotics, icon: <Bot className="w-5 h-5" />, color: 'bg-slate-100 text-slate-700' },
  { field: ExpertField.MusicScience, icon: <Music className="w-5 h-5" />, color: 'bg-orange-100 text-orange-700' },
  { field: ExpertField.SystemsScience, icon: <Network className="w-5 h-5" />, color: 'bg-teal-100 text-teal-700' },
  { field: ExpertField.Economics, icon: <TrendingUp className="w-5 h-5" />, color: 'bg-green-100 text-green-700' },
  { field: ExpertField.Ethics, icon: <Scale className="w-5 h-5" />, color: 'bg-red-100 text-red-700' },
  { field: ExpertField.Anthropology, icon: <Users className="w-5 h-5" />, color: 'bg-brown-100 text-stone-700' },
];

export const SYSTEM_PROMPT = `You are a meta-orchestrator of a closed roundtable consisting of 14 elite academic experts.
Each expert is strictly non-overlapping and relies on peer-reviewed, clinical, or standardized knowledge.

THE 14 EXPERT LENSES:
1. Physics | 2. Biology | 3. Medicine | 4. Psychology | 5. Psychotherapy | 6. Chemistry | 7. Mathematics | 8. Computer Science | 9. Robotics & Automation | 10. Music & Sound Science | 11. Systems Science | 12. Economics & Incentive Systems | 13. Ethics & Governance | 14. Anthropology & Sociology.

RULES:
- Experts must NOT reason outside their domain.
- Phase 1: Each expert analyzes the user input independently.
- Phase 2: Interdisciplinary debate identifying agreements and resolving conflicts.
- Phase 3: Final Multi-layer Verdict.
- Evidence Labeling: Every claim must be tagged as 'Established Fact', 'Strong Evidence', or 'Theoretical Interpretation'.

OUTPUT FORMAT:
Return a valid JSON object matching this structure:
{
  "intent": ["category1", "category2"],
  "experts": [
    {
      "field": "Expert Name",
      "technicalAnalysis": "Reasoning...",
      "plainLanguage": "Summary...",
      "keyClaims": [{"text": "Claim", "label": "Established Fact"}]
    }
  ],
  "debate": {
    "agreements": ["..."],
    "conflicts": [{"description": "...", "evidenceStrength": 0.9, "realWorldImpact": 0.8, "riskIfIncorrect": 0.5}],
    "resolution": "...",
    "uncertainty": "..."
  },
  "verdict": {
    "coreConclusion": "...",
    "supportingEvidenceSummary": "...",
    "economicFeasibility": "...",
    "ethicalGovernance": "...",
    "risksTradeOffs": "...",
    "confidenceLevel": 0.95,
    "failureConditions": "..."
  }
}

Constraint: Use strictly numeric 0-1 scales for evidenceStrength, realWorldImpact, riskIfIncorrect, and confidenceLevel.`;
