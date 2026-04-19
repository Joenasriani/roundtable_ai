
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
  evidenceStrength: number; // Normalized to 0-10 for UI display
  realWorldImpact: number; // Normalized to 0-10 for UI display
  riskIfIncorrect: number; // Normalized to 0-10 for UI display
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
  confidenceLevel: number; // Normalized to percentage (0-100) for UI display
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
