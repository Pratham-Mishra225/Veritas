import { CredibilityScore } from "./CredibilityScore";
import { ClaimCard } from "./ClaimCard";
import { SourceCard } from "./SourceCard";
import type { Analysis } from "@/lib/analysis/types";

// Aggregates unique sources across all claims to render in the Sources section.
function aggregateSources(analysis: Analysis) {
  const seen = new Map<string, { id: string; title: string; url: string; publisher: string }>();
  analysis.claims.forEach((claim) => {
    claim.sources.forEach((s) => {
      if (seen.has(s.url)) return;
      let publisher = s.url;
      try {
        publisher = new URL(s.url).hostname.replace(/^www\./, "");
      } catch {
        // keep raw url as publisher fallback
      }
      seen.set(s.url, { id: s.url, title: s.title, url: s.url, publisher });
    });
  });
  return Array.from(seen.values());
}

export function AnalysisReport({ analysis }: { analysis: Analysis }) {
  const sources = aggregateSources(analysis);

  return (
    <div className="space-y-8">
      <CredibilityScore score={analysis.overallScore} />

      {analysis.summary && (
        <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">{analysis.summary}</p>
      )}

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight">Extracted claims</h2>
          <span className="text-xs text-muted-foreground">{analysis.claims.length} claims found</span>
        </div>
        <div className="grid gap-4">
          {analysis.claims.map((claim, i) => (
            <ClaimCard key={claim.id} claim={claim} index={i} />
          ))}
        </div>
      </section>

      {sources.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-semibold tracking-tight">Sources</h2>
            <span className="text-xs text-muted-foreground">{sources.length} references</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {sources.map((s) => (
              <SourceCard key={s.id} source={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
