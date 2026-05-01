import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, Loader2, AlertCircle } from "lucide-react";
import { AnalysisReport } from "@/components/analysis/AnalysisReport";
import { getSharedAnalysis } from "@/lib/analysis/api";
import type { Analysis } from "@/lib/analysis/types";

export const Route = createFileRoute("/share/$shareId")({
  head: () => ({
    meta: [
      { title: "Shared analysis — Veritas" },
      { name: "description", content: "Public misinformation analysis report shared via Veritas." },
    ],
  }),
  component: SharedAnalysisPage,
});

function SharedAnalysisPage() {
  const { shareId } = Route.useParams();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSharedAnalysis(shareId)
      .then((a) => {
        if (!cancelled) setAnalysis(a);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load shared analysis.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [shareId]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary grid place-items-center shadow-glow">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">Veritas</span>
          </Link>
          <span className="text-xs text-muted-foreground">Shared report</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid place-items-center py-20 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : error || !analysis ? (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-2xl p-6 flex items-start gap-3 max-w-md mx-auto">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Unavailable</p>
              <p className="text-sm opacity-90">{error ?? "Shared report not found."}</p>
            </div>
          </div>
        ) : (
          <AnalysisReport analysis={analysis} />
        )}
      </main>
    </div>
  );
}
