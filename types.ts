
export type EvidenceLabel = 'Established Fact' | 'Strong Evidence' | 'Theoretical Interpretation';

export interface KeyClaim {
  text: string;
  label: EvidenceLabel;
}

export interface ExpertAnalysis {
  field: string;
  technicalAnalysis: string;
  plainLanguage: string;
  keyClaims: KeyClaim[];
}

export interface Disagreement {
  description: string;
  evidenceStrength: number; // 0-1 scale
  realWorldImpact: number; // 0-1 scale
  riskIfIncorrect: number; // 0-1 scale
}

export interface Debate {
  agreements: string[];
  conflicts: Disagreement[];
  resolution: string;
  uncertainty: string;
}

export interface FinalVerdict {
  coreConclusion: string;
  supportingEvidenceSummary: string;
  economicFeasibility: string;
  ethicalGovernance: string;
  risksTradeOffs: string;
  confidenceLevel: number; // 0-1 scale
  failureConditions: string;
}

export interface RoundtableResponse {
  intent: string[];
  experts: ExpertAnalysis[];
  debate: Debate;
  verdict: FinalVerdict;
}

export enum ExpertField {
  Physics = "Physics",
  Biology = "Biology",
  Medicine = "Medicine",
  Psychology = "Psychology",
  Psychotherapy = "Psychotherapy",
  Chemistry = "Chemistry",
  Mathematics = "Mathematics",
  ComputerScience = "Computer Science",
  Robotics = "Robotics & Automation",
  MusicScience = "Music & Sound Science",
  SystemsScience = "Systems Science",
  Economics = "Economics & Incentive Systems",
  Ethics = "Ethics & Governance",
  Anthropology = "Anthropology & Sociology"
}
