
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
import { SYSTEM_PROMPT as SHARED_SYSTEM_PROMPT } from './shared-constants';

export const SYSTEM_PROMPT = SHARED_SYSTEM_PROMPT;

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

// System prompt is now imported from constants.ts to be shared with the backend.
