import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Loader2, Sparkles, FileText, LinkIcon } from "lucide-react";
import { ClaimCard } from "@/components/analysis/ClaimCard";
import { SourceCard } from "@/components/analysis/SourceCard";
import { CredibilityScore } from "@/components/analysis/CredibilityScore";
import { mockClaims, mockSources, mockOverallScore } from "@/components/analysis/mockData";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Misinformation Analysis System" },
      { name: "description", content: "Paste text or a URL to detect misinformation, extract claims, and view credibility scores." },
    ],
  }),
  component: Dashboard,
});

type Status = "idle" | "loading" | "done";

function Dashboard() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"text" | "url">("text");
  const [status, setStatus] = useState<Status>("idle");

  const handleAnalyze = () => {
    if (!input.trim()) return;
    setStatus("loading");
    setTimeout(() => setStatus("done"), 1800);
  };

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
          <span className="text-xs text-muted-foreground">Analysis dashboard</span>
        </div>
      </header>

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
              {input.length > 0 ? `${input.length} characters` : "Tip: longer text yields better analysis."}
            </p>
            <Button
              onClick={handleAnalyze}
              disabled={!input.trim() || status === "loading"}
              variant="hero"
              size="lg"
            >
              {status === "loading" ? (
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

        {status === "loading" && (
          <section className="space-y-4 animate-fade-in">
            <div className="bg-gradient-card border border-border/60 rounded-2xl p-8 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 grid place-items-center mb-4 animate-pulse-glow">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
              <h3 className="font-medium mb-1">Extracting claims & verifying sources</h3>
              <p className="text-sm text-muted-foreground">This usually takes a few seconds.</p>
            </div>
            <div className="grid gap-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl border border-border/60 bg-muted/30 animate-pulse"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </div>
          </section>
        )}

        {status === "done" && (
          <div className="space-y-8">
            <CredibilityScore score={mockOverallScore} />

            <section>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-lg font-semibold tracking-tight">Extracted claims</h2>
                <span className="text-xs text-muted-foreground">{mockClaims.length} claims found</span>
              </div>
              <div className="grid gap-4">
                {mockClaims.map((claim, i) => (
                  <ClaimCard key={claim.id} claim={claim} index={i} />
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-lg font-semibold tracking-tight">Sources</h2>
                <span className="text-xs text-muted-foreground">{mockSources.length} references</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {mockSources.map((s) => (
                  <SourceCard key={s.id} source={s} />
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
