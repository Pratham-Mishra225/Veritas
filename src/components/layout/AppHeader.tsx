import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Shield, LogOut, User as UserIcon, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthContext";
import { AuthDialog } from "./AuthDialog";

export function AppHeader({ subtitle }: { subtitle?: string }) {
  const { user, status, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary grid place-items-center shadow-glow">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight">Veritas</span>
        </Link>

        <div className="flex items-center gap-2">
          {subtitle && <span className="hidden sm:inline text-xs text-muted-foreground mr-2">{subtitle}</span>}

          {status === "authenticated" && user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/history" className="gap-1.5">
                  <History className="w-4 h-4" /> History
                </Link>
              </Button>
              <div className="flex items-center gap-2 pl-2 ml-1 border-l border-border/60">
                <div className="w-7 h-7 rounded-full bg-primary/15 grid place-items-center text-primary">
                  {user.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className="hidden sm:inline text-xs text-muted-foreground max-w-[140px] truncate">
                  {user.displayName ?? user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={() => signOut()} aria-label="Sign out">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <Button size="sm" variant="hero" onClick={() => setAuthOpen(true)} disabled={status === "loading"}>
              Sign in
            </Button>
          )}
        </div>
      </div>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  );
}
