import { ShieldCheck } from "lucide-react";

export function CredibilityScore({ score }: { score: number }) {
  const label = score >= 75 ? "Highly credible" : score >= 50 ? "Mixed credibility" : "Low credibility";
  const color = score >= 75 ? "text-success" : score >= 50 ? "text-warning" : "text-destructive";
  const ring = score >= 75 ? "stroke-success" : score >= 50 ? "stroke-warning" : "stroke-destructive";
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-gradient-card border border-border/60 rounded-2xl p-6 md:p-8 shadow-elegant animate-scale-in">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative w-32 h-32 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" className="stroke-muted fill-none" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="42"
              className={`${ring} fill-none transition-all duration-1000 ease-out`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className={`text-3xl font-semibold ${color}`}>{score}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">/ 100</div>
            </div>
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Overall credibility
          </div>
          <h2 className={`text-2xl font-semibold mb-2 ${color}`}>{label}</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            This score reflects the proportion of verifiable, well-sourced claims found in your
            content. Always cross-check important claims with primary sources.
          </p>
        </div>
      </div>
    </div>
  );
}
