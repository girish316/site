"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Read admin emails at call-time so hot-reload picks up .env changes
  function getAdminEmails(): string[] {
    const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "";
    return raw.split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
  }

  const adminEmails = getAdminEmails();
  const isAdmin =
    !!user &&
    (adminEmails.length === 0 ||        // if env is empty, allow any signed-in user
     adminEmails.includes("*") ||
     adminEmails.includes(user.email?.toLowerCase() ?? ""));

  async function signInWithGoogle() {
    // signInWithPopup works on localhost; signInWithRedirect requires HTTPS + proper domain
    await signInWithPopup(auth, googleProvider);
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
