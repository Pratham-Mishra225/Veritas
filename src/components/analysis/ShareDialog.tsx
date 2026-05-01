import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, Globe, Loader2 } from "lucide-react";
import { useAnalysis } from "@/lib/analysis/AnalysisContext";

export function ShareDialog({
  open,
  onOpenChange,
  analysisId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  analysisId: string | null;
}) {
  const { share } = useAnalysis();
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnable = async () => {
    if (!analysisId) return;
    setBusy(true);
    setError(null);
    const result = await share(analysisId);
    setBusy(false);
    if (result) setUrl(result.url);
    else setError("Failed to create share link.");
  };

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setUrl(null);
          setError(null);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this analysis</DialogTitle>
          <DialogDescription>Anyone with the link can view the report. No login required.</DialogDescription>
        </DialogHeader>

        {!url ? (
          <Button onClick={handleEnable} disabled={busy} variant="hero" className="w-full">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            Create public link
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/15 text-success border border-success/30 text-xs font-medium">
              <Globe className="w-3.5 h-3.5" /> Public link enabled
            </div>
            <div className="flex items-center gap-2">
              <Input value={url} readOnly className="flex-1" />
              <Button onClick={handleCopy} variant="outline" size="icon" aria-label="Copy link">
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
