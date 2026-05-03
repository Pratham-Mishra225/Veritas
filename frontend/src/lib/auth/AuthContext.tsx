import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { setAuthToken } from "./token";
import { getFirebaseAuth } from "./firebase";

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
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const googleProvider = new GoogleAuthProvider();

function mapUser(user: FirebaseUser): AuthUser {
  return {
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    photoURL: user.photoURL ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const auth = useMemo(() => getFirebaseAuth(), []);

  useEffect(() => {
    setStatus("loading");
    const unsubscribe = onIdTokenChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setStatus("unauthenticated");
        setAuthToken(null);
        return;
      }
      setUser(mapUser(fbUser));
      setStatus("authenticated");
      try {
        const token = await fbUser.getIdToken();
        setAuthToken(token);
      } catch {
        setAuthToken(null);
      }
    });
    return unsubscribe;
  }, [auth]);

  const signInWithGoogle = useCallback(async () => {
    setStatus("loading");
    await signInWithPopup(auth, googleProvider);
  }, [auth]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      setStatus("loading");
      await signInWithEmailAndPassword(auth, email, password);
    },
    [auth],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      setStatus("loading");
      await createUserWithEmailAndPassword(auth, email, password);
    },
    [auth],
  );

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setAuthToken(null);
  }, [auth]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }),
    [user, status, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
