import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalysisClaim, Verdict } from "@/lib/analysis/types";

const verdictConfig: Record<Verdict, { className: string; icon: typeof CheckCircle2; label: string }> = {
  true: { className: "bg-success/15 text-success border-success/30", icon: CheckCircle2, label: "True" },
  misleading: { className: "bg-warning/15 text-warning border-warning/30", icon: AlertTriangle, label: "Misleading" },
  false: { className: "bg-destructive/15 text-destructive border-destructive/30", icon: XCircle, label: "False" },
};

function confidenceColor(score: number) {
  if (score >= 75) return { bar: "bg-success", text: "text-success" };
  if (score >= 50) return { bar: "bg-warning", text: "text-warning" };
  return { bar: "bg-destructive", text: "text-destructive" };
}

export function ClaimCard({ claim, index }: { claim: AnalysisClaim; index: number }) {
  const cfg = verdictConfig[claim.verdict];
  const Icon = cfg.icon;
  const [open, setOpen] = useState(false);
  const c = confidenceColor(claim.confidence);

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
          <span className={cn("font-medium", c.text)}>{claim.confidence}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-700", c.bar)}
            style={{ width: `${claim.confidence}%` }}
          />
        </div>
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        aria-expanded={open}
      >
        Why this confidence?
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="mt-4 pt-4 border-t border-border/60 space-y-3 animate-fade-in">
          <BreakdownRow label="Source reliability" value={claim.confidenceBreakdown.sourceReliability} />
          <BreakdownRow label="Agreement" value={claim.confidenceBreakdown.agreement} />
          <BreakdownRow label="Coverage" value={claim.confidenceBreakdown.coverage} />

          {claim.sources.length > 0 && (
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-2">Sources</p>
              <ul className="space-y-1.5">
                {claim.sources.map((s, i) => (
                  <li key={i}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group inline-flex items-center gap-1.5 text-xs text-foreground/90 hover:text-primary transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                      <span className="truncate">{s.title}</span>
                      <span className="text-muted-foreground">· {s.reliabilityScore}%</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  const c = confidenceColor(value);
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-medium", c.text)}>{value}%</span>
      </div>
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full", c.bar)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
