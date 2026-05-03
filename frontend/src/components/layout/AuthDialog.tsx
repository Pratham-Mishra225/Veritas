import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/AuthContext";
import { Loader2 } from "lucide-react";

export function AuthDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState<null | "google" | "email">(null);
  const [error, setError] = useState<string | null>(null);
  const isSignUp = mode === "signup";

  const handleGoogle = async () => {
    setError(null);
    setBusy("google");
    try {
      await signInWithGoogle();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : `${isSignUp ? "Sign-up" : "Sign-in"} failed.`);
    } finally {
      setBusy(null);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError(null);
    setBusy("email");
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : `${isSignUp ? "Sign-up" : "Sign-in"} failed.`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isSignUp ? "Create your Veritas account" : "Sign in to Veritas"}</DialogTitle>
          <DialogDescription>
            {isSignUp ? "Create an account to save and share analyses." : "Save your analyses and share results with anyone."}
          </DialogDescription>
        </DialogHeader>

        <Button onClick={handleGoogle} disabled={busy !== null} variant="outline" className="w-full justify-center gap-2">
          {busy === "google" ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
          Continue with Google
        </Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
            <span className="bg-popover px-2 text-muted-foreground">or with email</span>
          </div>
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" variant="hero" className="w-full" disabled={busy !== null}>
            {busy === "email" ? <Loader2 className="w-4 h-4 animate-spin" /> : isSignUp ? "Create account" : "Sign in"}
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          {isSignUp ? "Already have an account?" : "No account yet?"}
          <Button
            type="button"
            variant="link"
            size="sm"
            className="px-1"
            onClick={() => setMode(isSignUp ? "signin" : "signup")}
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.96h5.52c-.24 1.44-1.68 4.2-5.52 4.2-3.36 0-6.12-2.76-6.12-6.36S8.64 5.64 12 5.64c1.92 0 3.24.84 3.96 1.56l2.7-2.64C16.92 2.88 14.64 2 12 2 6.48 2 2 6.48 2 12s4.48 10 10 10c5.76 0 9.6-4.08 9.6-9.84 0-.6-.06-1.2-.18-1.96H12z" />
    </svg>
  );
}
