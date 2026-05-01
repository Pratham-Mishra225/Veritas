// Shared schema for the Misinformation Analysis System.
// Mirrors the documented API contract — keep in sync with backend.

export type Verdict = "true" | "misleading" | "false";
export type InputType = "text" | "url";

export interface ConfidenceBreakdown {
  sourceReliability: number; // 0-100
  agreement: number;         // 0-100
  coverage: number;          // 0-100
}

export interface AnalysisSource {
  title: string;
  url: string;
  reliabilityScore: number; // 0-100
}

export interface AnalysisClaim {
  id: string;
  text: string;
  verdict: Verdict;
  explanation: string;
  confidence: number; // 0-100
  confidenceBreakdown: ConfidenceBreakdown;
  sources: AnalysisSource[];
}

export interface AnalysisShare {
  isPublic: boolean;
  shareId: string;
}

export interface Analysis {
  id: string;
  input: string;
  inputType: InputType;
  createdAt: string; // ISO timestamp
  claims: AnalysisClaim[];
  overallScore: number; // 0-100
  summary: string;
  share: AnalysisShare;
}

export type AnalysisStage =
  | "idle"
  | "extracting"
  | "verifying"
  | "generating"
  | "done"
  | "error";

export const STAGE_LABEL: Record<Exclude<AnalysisStage, "idle" | "done" | "error">, string> = {
  extracting: "Extracting claims",
  verifying: "Verifying with sources",
  generating: "Generating report",
};
