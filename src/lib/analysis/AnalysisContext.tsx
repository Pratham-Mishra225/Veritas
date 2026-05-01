import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Analysis, AnalysisStage, InputType } from "./types";
import * as api from "./api";

interface AnalysisContextValue {
  current: Analysis | null;
  stage: AnalysisStage;
  error: string | null;
  history: Analysis[];
  historyLoading: boolean;
  analyze: (input: string, inputType: InputType) => Promise<Analysis | null>;
  loadHistory: () => Promise<void>;
  selectAnalysis: (id: string) => Promise<void>;
  share: (id: string) => Promise<{ shareId: string; url: string } | null>;
  reset: () => void;
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Analysis | null>(null);
  const [stage, setStage] = useState<AnalysisStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Analysis[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const analyze = useCallback(async (input: string, inputType: InputType) => {
    setError(null);
    setCurrent(null);
    setStage("extracting");
    try {
      const result = await api.analyzeContent({
        input,
        inputType,
        onStage: (s) => setStage(s),
      });
      setStage("done");
      setCurrent(result);
      setHistory((prev) => [result, ...prev.filter((p) => p.id !== result.id)]);
      return result;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Analysis failed.";
      setError(message);
      setStage("error");
      return null;
    }
  }, []);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const list = await api.getHistory();
      setHistory(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load history.");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const selectAnalysis = useCallback(async (id: string) => {
    setError(null);
    try {
      const a = await api.getAnalysisById(id);
      setCurrent(a);
      setStage("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load analysis.");
    }
  }, []);

  const share = useCallback(async (id: string) => {
    try {
      const result = await api.shareAnalysis(id);
      setCurrent((prev) => (prev && prev.id === id ? { ...prev, share: { isPublic: true, shareId: result.shareId } } : prev));
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create share link.");
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setCurrent(null);
    setStage("idle");
    setError(null);
  }, []);

  const value = useMemo<AnalysisContextValue>(
    () => ({ current, stage, error, history, historyLoading, analyze, loadHistory, selectAnalysis, share, reset }),
    [current, stage, error, history, historyLoading, analyze, loadHistory, selectAnalysis, share, reset],
  );

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>;
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used inside <AnalysisProvider>");
  return ctx;
}
