import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAnalysis } from "@/lib/analysis/AnalysisContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Inbox } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — Veritas" },
      { name: "description", content: "Review your past misinformation analyses." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { history, historyLoading, loadHistory, selectAnalysis } = useAnalysis();
  const { status, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "authenticated") loadHistory();
  }, [status, loadHistory]);

  const handleOpen = async (id: string) => {
    await selectAnalysis(id);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader subtitle="Your history" />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Analysis history</h1>
            <p className="text-sm text-muted-foreground mt-1">All your past credibility checks.</p>
          </div>
          <Button asChild variant="hero" size="sm">
            <Link to="/dashboard">New analysis</Link>
          </Button>
        </div>

        {status !== "authenticated" || !user ? (
          <EmptyState
            title="Sign in to see your history"
            description="Your analyses are tied to your account."
          />
        ) : historyLoading ? (
          <div className="grid place-items-center py-20 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <EmptyState
            title="No analyses yet"
            description="Run your first analysis from the dashboard to see it here."
          />
        ) : (
          <ul className="grid gap-3">
            {history.map((a) => (
              <li key={a.id}>
                <button
                  onClick={() => handleOpen(a.id)}
                  className="w-full text-left bg-gradient-card border border-border/60 rounded-2xl p-5 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="uppercase tracking-wider">{a.inputType}</span>
                        <span>·</span>
                        <span>{new Date(a.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm font-medium line-clamp-2">{a.input}</p>
                    </div>
                    <ScoreBadge score={a.overallScore} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 75 ? "text-success border-success/30 bg-success/10" :
    score >= 50 ? "text-warning border-warning/30 bg-warning/10" :
    "text-destructive border-destructive/30 bg-destructive/10";
  return (
    <div className={`shrink-0 w-14 h-14 rounded-xl border grid place-items-center ${color}`}>
      <div className="text-center leading-none">
        <div className="text-lg font-semibold">{score}</div>
        <div className="text-[9px] uppercase tracking-wider opacity-70 mt-0.5">/100</div>
      </div>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-gradient-card border border-border/60 rounded-2xl p-12 text-center">
      <div className="w-12 h-12 mx-auto rounded-full bg-muted grid place-items-center mb-4">
        <Inbox className="w-5 h-5 text-muted-foreground" />
      </div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
