import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type Verdict = "True" | "Misleading" | "False";

export interface Claim {
  id: string;
  text: string;
  verdict: Verdict;
  explanation: string;
  confidence: number;
}

const verdictConfig: Record<Verdict, { className: string; icon: typeof CheckCircle2; label: string }> = {
  True: { className: "bg-success/15 text-success border-success/30", icon: CheckCircle2, label: "True" },
  Misleading: { className: "bg-warning/15 text-warning border-warning/30", icon: AlertTriangle, label: "Misleading" },
  False: { className: "bg-destructive/15 text-destructive border-destructive/30", icon: XCircle, label: "False" },
};

const barColor: Record<Verdict, string> = {
  True: "bg-success",
  Misleading: "bg-warning",
  False: "bg-destructive",
};

export function ClaimCard({ claim, index }: { claim: Claim; index: number }) {
  const cfg = verdictConfig[claim.verdict];
  const Icon = cfg.icon;
  return (
    <div
      className="bg-gradient-card border border-border/60 rounded-2xl p-6 hover:border-primary/30 transition-all animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <p className="text-base font-medium leading-snug flex-1">{claim.text}</p>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium shrink-0",
            cfg.className,
          )}
        >
          <Icon className="w-3.5 h-3.5" />
          {cfg.label}
        </span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5">{claim.explanation}</p>
      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>Confidence</span>
          <span className="font-medium text-foreground">{claim.confidence}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-700", barColor[claim.verdict])}
            style={{ width: `${claim.confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
}
