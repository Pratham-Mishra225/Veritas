// API service layer. Swap USE_MOCK_API to false (or set VITE_USE_MOCK_API=false)
// to send real fetch requests to the backend.

import type { Analysis, InputType } from "./types";
import { buildMockAnalysis } from "./mock";
import { getAuthToken } from "@/lib/auth/token";

const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};
export const USE_MOCK_API = (env.VITE_USE_MOCK_API ?? "true") !== "false";
const API_BASE = env.VITE_API_BASE_URL ?? "/api";

// In-memory store used while the backend is mocked.
const memoryStore = new Map<string, Analysis>();
const shareIndex = new Map<string, string>(); // shareId -> analysisId

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  return res;
}

export interface AnalyzeInput {
  input: string;
  inputType: InputType;
  onStage?: (stage: "extracting" | "verifying" | "generating") => void;
}

export async function analyzeContent({ input, inputType, onStage }: AnalyzeInput): Promise<Analysis> {
  if (!input.trim()) throw new Error("Please provide some content to analyze.");

  if (USE_MOCK_API) {
    onStage?.("extracting");
    await delay(700);
    onStage?.("verifying");
    await delay(900);
    onStage?.("generating");
    await delay(600);
    const analysis = buildMockAnalysis(input, inputType);
    memoryStore.set(analysis.id, analysis);
    return analysis;
  }

  const res = await authedFetch(`/analyze`, {
    method: "POST",
    body: JSON.stringify({ input, inputType }),
  });
  return (await res.json()) as Analysis;
}

export async function getHistory(): Promise<Analysis[]> {
  if (USE_MOCK_API) {
    await delay(250);
    return Array.from(memoryStore.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
  const res = await authedFetch(`/history`);
  return (await res.json()) as Analysis[];
}

export async function getAnalysisById(id: string): Promise<Analysis> {
  if (USE_MOCK_API) {
    await delay(200);
    const a = memoryStore.get(id);
    if (!a) throw new Error("Analysis not found.");
    return a;
  }
  const res = await authedFetch(`/analysis/${encodeURIComponent(id)}`);
  return (await res.json()) as Analysis;
}

export async function shareAnalysis(id: string): Promise<{ shareId: string; url: string }> {
  if (USE_MOCK_API) {
    await delay(300);
    const a = memoryStore.get(id);
    if (!a) throw new Error("Analysis not found.");
    a.share.isPublic = true;
    shareIndex.set(a.share.shareId, a.id);
    memoryStore.set(a.id, a);
    return {
      shareId: a.share.shareId,
      url: `${typeof window !== "undefined" ? window.location.origin : ""}/share/${a.share.shareId}`,
    };
  }
  const res = await authedFetch(`/analysis/${encodeURIComponent(id)}/share`, { method: "POST" });
  return (await res.json()) as { shareId: string; url: string };
}

export async function getSharedAnalysis(shareId: string): Promise<Analysis> {
  if (USE_MOCK_API) {
    await delay(250);
    const analysisId = shareIndex.get(shareId);
    const a = analysisId ? memoryStore.get(analysisId) : undefined;
    if (!a || !a.share.isPublic) throw new Error("This shared analysis is unavailable.");
    // Strip user-specific data — none present in mock, but enforce the contract.
    return { ...a, input: a.input };
  }
  const res = await fetch(`${API_BASE}/share/${encodeURIComponent(shareId)}`);
  if (!res.ok) throw new Error("This shared analysis is unavailable.");
  return (await res.json()) as Analysis;
}
