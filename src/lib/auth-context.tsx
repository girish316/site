"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function initAuth() {
      try {
        await setPersistence(auth, browserLocalPersistence);
        await getRedirectResult(auth);
      } catch (error) {
        console.error("Redirect auth error:", error);
      }

      const unsubscribe = onAuthStateChanged(auth, (u) => {
        if (!alive) return;
        setUser(u);
        setLoading(false);
      });

      return unsubscribe;
    }

    let unsubscribe: (() => void) | undefined;

    initAuth().then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      alive = false;
      unsubscribe?.();
    };
  }, []);

  const isAdmin =
    !!user &&
    (ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "") ||
      ADMIN_EMAILS.includes("*"));

  async function signInWithGoogle() {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithRedirect(auth, googleProvider);
  }

  async function logout() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}