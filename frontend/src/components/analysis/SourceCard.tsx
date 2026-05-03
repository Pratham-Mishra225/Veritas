import { ExternalLink } from "lucide-react";

export interface Source {
  id: string;
  title: string;
  url: string;
  publisher: string;
}

export function SourceCard({ source }: { source: Source }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer noopener"
      className="group block bg-gradient-card border border-border/60 rounded-xl p-4 hover:border-primary/40 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground mb-1">{source.publisher}</p>
          <p className="font-medium text-sm leading-snug group-hover:text-primary transition-colors truncate">
            {source.title}
          </p>
        </div>
        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
      </div>
    </a>
  );
}
