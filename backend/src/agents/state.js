import { Annotation } from "@langchain/langgraph";

const errorLogReducer = Annotation({
  reducer: (left, right) => {
    const l = left ?? [];
    const r = right ?? [];
    return [...l, ...r];
  },
  default: () => [],
});

export const AnalysisGraphState = Annotation.Root({
  rawText: Annotation(),
  inputType: Annotation(),
  analysisId: Annotation(),
  userInput: Annotation(),
  claims: Annotation(),
  queriesByClaimId: Annotation(),
  evidenceByClaimId: Annotation(),
  verifiedClaims: Annotation(),
  scoredClaims: Annotation(),
  summary: Annotation(),
  overallScore: Annotation(),
  errorLog: errorLogReducer,
  pipelineAborted: Annotation(),
});
