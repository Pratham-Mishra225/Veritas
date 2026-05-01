import type { Claim } from "./ClaimCard";
import type { Source } from "./SourceCard";

export const mockClaims: Claim[] = [
  {
    id: "1",
    text: "Global temperatures have risen by 1.1°C since pre-industrial times.",
    verdict: "True",
    explanation:
      "Confirmed by the IPCC AR6 report and NASA GISS temperature records. Multiple independent datasets converge on this figure.",
    confidence: 96,
  },
  {
    id: "2",
    text: "Switching to electric vehicles eliminates all transportation emissions overnight.",
    verdict: "Misleading",
    explanation:
      "EVs reduce tailpipe emissions but lifecycle emissions depend on the electricity grid and battery production footprint.",
    confidence: 82,
  },
  {
    id: "3",
    text: "5G networks are responsible for spreading viral diseases.",
    verdict: "False",
    explanation:
      "No scientific evidence supports a link between radio-frequency signals and viral transmission. Debunked by WHO and major health bodies.",
    confidence: 99,
  },
  {
    id: "4",
    text: "Renewable energy now provides over 30% of global electricity generation.",
    verdict: "True",
    explanation:
      "According to IEA 2024 data, renewables surpassed 30% of global electricity, driven primarily by solar and wind growth.",
    confidence: 91,
  },
];

export const mockSources: Source[] = [
  { id: "s1", title: "AR6 Synthesis Report: Climate Change 2023", url: "https://www.ipcc.ch", publisher: "IPCC" },
  { id: "s2", title: "GISS Surface Temperature Analysis", url: "https://data.giss.nasa.gov", publisher: "NASA" },
  { id: "s3", title: "Electricity 2024 — Analysis and forecast to 2026", url: "https://www.iea.org", publisher: "IEA" },
  { id: "s4", title: "5G mobile networks and health — fact sheet", url: "https://www.who.int", publisher: "WHO" },
];

export const mockOverallScore = 72;
