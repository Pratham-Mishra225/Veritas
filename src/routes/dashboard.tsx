import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, FileText, LinkIcon, Share2, AlertCircle } from "lucide-react";
import { useAnalysis } from "@/lib/analysis/AnalysisContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { AppHeader } from "@/components/layout/AppHeader";
import { AnalysisReport } from "@/components/analysis/AnalysisReport";
import { ShareDialog } from "@/components/analysis/ShareDialog";
import { STAGE_LABEL, type AnalysisStage } from "@/lib/analysis/types";
import { AuthDialog } from "@/components/layout/AuthDialog";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Veritas" },
      { name: "description", content: "Paste text or a URL to detect misinformation, extract claims, and view credibility scores." },
    ],
  }),
  component: Dashboard,
});

const STAGES: AnalysisStage[] = ["extracting", "verifying", "generating"];

function Dashboard() {
  const { user, status: authStatus } = useAuth();
  const { current, stage, error, analyze } = useAnalysis();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"text" | "url">("text");
  const [shareOpen, setShareOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const isLoading = stage === "extracting" || stage === "verifying" || stage === "generating";
  const loggedIn = authStatus === "authenticated" && !!user;

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    if (!loggedIn) {
      setAuthOpen(true);
      return;
    }
    await analyze(input, mode);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader subtitle="Analysis dashboard" />

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <section className="bg-gradient-card border border-border/60 rounded-2xl p-6 md:p-8 shadow-elegant animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h1 className="text-xl font-semibold tracking-tight">Analyze content</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Paste an article, claim, or URL. We'll extract verifiable statements and rate them.
          </p>

          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted/60 border border-border/60 mb-4">
            <button
              onClick={() => setMode("text")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                mode === "text" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Text
            </button>
            <button
              onClick={() => setMode("url")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                mode === "url" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" /> URL
            </button>
          </div>

          {mode === "text" ? (
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste an article, social media post, or claim to fact-check..."
              className="min-h-36 bg-background/50 border-border/60 resize-none text-sm"
            />
          ) : (
            <input
              type="url"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://example.com/news-article"
              className="w-full h-11 px-4 rounded-lg bg-background/50 border border-border/60 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          )}

          <div className="mt-5 flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              {!loggedIn
                ? "Sign in to run an analysis."
                : input.length > 0
                  ? `${input.length} characters`
                  : "Tip: longer text yields better analysis."}
            </p>
            <Button onClick={handleAnalyze} disabled={!input.trim() || isLoading} variant="hero" size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>Analyze</>
              )}
            </Button>
          </div>
        </section>

        {isLoading && <LoadingStages stage={stage} />}

        {stage === "error" && error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-2xl p-5 flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Analysis failed</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        )}

        {stage === "done" && current && (
          <div className="space-y-6">
            <div className="flex items-center justify-end">
              <Button variant="outline" onClick={() => setShareOpen(true)} className="gap-1.5">
                <Share2 className="w-4 h-4" /> Share
              </Button>
            </div>
            <AnalysisReport analysis={current} />
          </div>
        )}
      </main>

      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} analysisId={current?.id ?? null} />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}

function LoadingStages({ stage }: { stage: AnalysisStage }) {
  const currentIdx = STAGES.indexOf(stage);
  return (
    <section className="space-y-4 animate-fade-in">
      <div className="bg-gradient-card border border-border/60 rounded-2xl p-8">
        <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 grid place-items-center mb-5 animate-pulse-glow">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
        <ul className="space-y-2 max-w-sm mx-auto">
          {STAGES.map((s, i) => {
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <li
                key={s}
                className={`flex items-center gap-3 text-sm transition-colors ${
                  done ? "text-success" : active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    done ? "bg-success" : active ? "bg-primary animate-pulse" : "bg-muted"
                  }`}
                />
                {STAGE_LABEL[s as "extracting" | "verifying" | "generating"]}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
