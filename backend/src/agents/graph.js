import { StateGraph, START, END } from "@langchain/langgraph";
import { AnalysisGraphState } from "./state.js";
import { extractClaimsNode } from "./nodes/extractClaims.js";
import { generateQueriesNode } from "./nodes/generateQueries.js";
import { retrieveDocsNode } from "./nodes/retrieveDocs.js";
import { verifyClaimsNode } from "./nodes/verifyClaims.js";
import { scoreConfidenceNode } from "./nodes/scoreConfidence.js";
import { generateReportNode } from "./nodes/generateReport.js";

export function buildAnalysisGraph() {
  const g = new StateGraph(AnalysisGraphState)
    .addNode("extractClaims", extractClaimsNode)
    .addNode("generateQueries", generateQueriesNode)
    .addNode("retrieveDocs", retrieveDocsNode)
    .addNode("verifyClaims", verifyClaimsNode)
    .addNode("scoreConfidence", scoreConfidenceNode)
    .addNode("generateReport", generateReportNode)
    .addEdge(START, "extractClaims")
    .addEdge("extractClaims", "generateQueries")
    .addEdge("generateQueries", "retrieveDocs")
    .addEdge("retrieveDocs", "verifyClaims")
    .addEdge("verifyClaims", "scoreConfidence")
    .addEdge("scoreConfidence", "generateReport")
    .addEdge("generateReport", END);

  return g.compile();
}

let singleton = null;

export function getAnalysisGraph() {
  if (!singleton) singleton = buildAnalysisGraph();
  return singleton;
}
