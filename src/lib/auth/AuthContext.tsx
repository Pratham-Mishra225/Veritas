// Firebase-shaped auth context (UI-only stub).
// To integrate Firebase later: replace the stub implementations of
// signInWithGoogle / signInWithEmail / signOut with real Firebase SDK calls
// and call setAuthToken with the result of `user.getIdToken()`.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { setAuthToken } from "./token";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function makeStubToken(uid: string) {
  // Placeholder. Real Firebase: await user.getIdToken()
  return `stub.${uid}.${Date.now()}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  // Simulate the initial Firebase onAuthStateChanged callback.
  useEffect(() => {
    const t = setTimeout(() => setStatus("unauthenticated"), 150);
    return () => clearTimeout(t);
  }, []);

  const applyUser = useCallback((u: AuthUser | null) => {
    setUser(u);
    setStatus(u ? "authenticated" : "unauthenticated");
    setAuthToken(u ? makeStubToken(u.uid) : null);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 400));
    applyUser({
      uid: "google_demo_user",
      email: "demo@example.com",
      displayName: "Demo User",
      photoURL: null,
    });
  }, [applyUser]);

  const signInWithEmail = useCallback(async (email: string, _password: string) => {
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 400));
    applyUser({
      uid: `email_${email}`,
      email,
      displayName: email.split("@")[0] ?? null,
      photoURL: null,
    });
  }, [applyUser]);

  const signOut = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 150));
    applyUser(null);
  }, [applyUser]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, signInWithGoogle, signInWithEmail, signOut }),
    [user, status, signInWithGoogle, signInWithEmail, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
