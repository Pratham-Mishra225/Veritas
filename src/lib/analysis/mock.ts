import type { Analysis, InputType } from "./types";

const sampleClaimsTemplates = [
  {
    text: "Global temperatures have risen by 1.1°C since pre-industrial times.",
    verdict: "true" as const,
    explanation:
      "Confirmed by the IPCC AR6 report and NASA GISS temperature records. Multiple independent datasets converge on this figure.",
    confidence: 96,
    confidenceBreakdown: { sourceReliability: 98, agreement: 95, coverage: 94 },
    sources: [
      { title: "AR6 Synthesis Report: Climate Change 2023", url: "https://www.ipcc.ch", reliabilityScore: 98 },
      { title: "GISS Surface Temperature Analysis", url: "https://data.giss.nasa.gov", reliabilityScore: 97 },
    ],
  },
  {
    text: "Switching to electric vehicles eliminates all transportation emissions overnight.",
    verdict: "misleading" as const,
    explanation:
      "EVs reduce tailpipe emissions but lifecycle emissions depend on the electricity grid and battery production footprint.",
    confidence: 82,
    confidenceBreakdown: { sourceReliability: 88, agreement: 76, coverage: 82 },
    sources: [
      { title: "Life Cycle Assessment of EVs", url: "https://www.iea.org", reliabilityScore: 92 },
    ],
  },
  {
    text: "5G networks are responsible for spreading viral diseases.",
    verdict: "false" as const,
    explanation:
      "No scientific evidence supports a link between radio-frequency signals and viral transmission. Debunked by WHO and major health bodies.",
    confidence: 99,
    confidenceBreakdown: { sourceReliability: 99, agreement: 99, coverage: 98 },
    sources: [
      { title: "5G mobile networks and health — fact sheet", url: "https://www.who.int", reliabilityScore: 99 },
    ],
  },
  {
    text: "Renewable energy now provides over 30% of global electricity generation.",
    verdict: "true" as const,
    explanation:
      "According to IEA 2024 data, renewables surpassed 30% of global electricity, driven primarily by solar and wind growth.",
    confidence: 91,
    confidenceBreakdown: { sourceReliability: 94, agreement: 90, coverage: 89 },
    sources: [
      { title: "Electricity 2024 — Analysis and forecast", url: "https://www.iea.org", reliabilityScore: 95 },
    ],
  },
];

function rid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function buildMockAnalysis(input: string, inputType: InputType): Analysis {
  const claims = sampleClaimsTemplates.map((c) => ({ ...c, id: rid("claim") }));
  const overallScore = Math.round(
    claims.reduce((acc, c) => {
      const weight = c.verdict === "true" ? 1 : c.verdict === "misleading" ? 0.5 : 0;
      return acc + weight * c.confidence;
    }, 0) / claims.length,
  );
  return {
    id: rid("analysis"),
    input,
    inputType,
    createdAt: new Date().toISOString(),
    claims,
    overallScore,
    summary:
      "The content mixes accurate climate data with one misleading statement and one debunked conspiracy claim.",
    share: { isPublic: false, shareId: rid("share") },
  };
}
