import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Shield, Sparkles, Search, BarChart3, ArrowRight, CheckCircle2, User as UserIcon, LogOut, History } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Misinformation Analysis System — Detect false claims with AI" },
      { name: "description", content: "Analyze any text or news article for misinformation. Get verdicts, confidence scores, and trusted sources in seconds." },
      { property: "og:title", content: "Misinformation Analysis System" },
      { property: "og:description", content: "AI-powered misinformation detection for text and news articles." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, status, signOut } = useAuth();
  const navigate = useNavigate();
  const loggedIn = status === "authenticated" && !!user;

  const handleAnalyze = () => {
    navigate({ to: loggedIn ? "/dashboard" : "/auth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary grid place-items-center shadow-glow">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">Veritas</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          </nav>
          <div className="flex items-center gap-2">
            {loggedIn ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/history" className="gap-1.5">
                    <History className="w-4 h-4" /> History
                  </Link>
                </Button>
                <div className="flex items-center gap-2 pl-2 ml-1 border-l border-border/60">
                  <div className="w-7 h-7 rounded-full bg-primary/15 grid place-items-center text-primary">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <UserIcon className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span className="hidden sm:inline text-xs text-muted-foreground max-w-[140px] truncate">
                    {user?.displayName ?? user?.email}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => signOut()} aria-label="Sign out">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-card/40 text-xs text-muted-foreground mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Powered by claim-extraction AI
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] animate-fade-in">
            Detect misinformation
            <br />
            <span className="text-gradient">before you share it.</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground animate-fade-in">
            Paste any article, claim, or URL. Veritas extracts the key statements, verifies them
            against trusted sources, and gives you a credibility score — in seconds.
          </p>
          <div className="mt-10 flex items-center justify-center animate-fade-in">
            <Button onClick={handleAnalyze} size="lg" variant="hero" className="group">
              Analyze Content
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 pb-32">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Search, title: "Claim extraction", desc: "Identifies every verifiable statement inside long-form text or articles." },
            { icon: CheckCircle2, title: "Source-backed verdicts", desc: "Each claim is rated True, Misleading, or False with cited evidence." },
            { icon: BarChart3, title: "Credibility scoring", desc: "Get an at-a-glance score so you know whether to trust the content." },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-gradient-card border border-border/60 rounded-2xl p-6 hover:border-primary/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 grid place-items-center mb-4">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/50 py-8 text-center text-xs text-muted-foreground">
        © 2026 Veritas. Fighting misinformation, one claim at a time.
      </footer>
    </div>
  );
}
