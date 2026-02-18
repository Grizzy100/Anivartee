"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getProfile, type UserProfile } from "@/lib/api/profile.api";
import { refresh, logout as apiLogout } from "@/lib/api/auth.api";
import { getAccessToken, onAuthFailure } from "@/lib/api/api";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  user: UserProfile | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Call after successful signin/signup to update context before navigation */
  setAuthenticated: (profile: UserProfile) => void;
  /** Log out, clear token, redirect to /login */
  logout: () => Promise<void>;
  /** Re-fetch the user profile (e.g. after profile update) */
  refreshUser: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  // ── Initial load: try silent refresh → profile ──

  const loadUser = useCallback(async () => {
    try {
      if (!getAccessToken()) {
        const refreshed = await refresh();
        if (!refreshed) {
          setUser(null);
          setStatus("unauthenticated");
          return;
        }
      }

      const profile = await getProfile();
      setUser(profile);
      setStatus("authenticated");
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // ── Global auth-failure listener (token expired + refresh failed) ──

  useEffect(() => {
    return onAuthFailure(() => {
      setUser(null);
      setStatus("unauthenticated");
      router.replace("/login");
    });
  }, [router]);

  // ── Imperative helpers ──

  /** Called by login/signup forms after successful auth to sync context. */
  const setAuthenticated = useCallback((profile: UserProfile) => {
    setUser(profile);
    setStatus("authenticated");
  }, []);

  const handleLogout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    setStatus("unauthenticated");
    router.push("/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await getProfile();
      setUser(profile);
    } catch {
      // If profile fetch fails, leave the existing user in place
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated",
      isLoading: status === "loading",
      setAuthenticated,
      logout: handleLogout,
      refreshUser,
    }),
    [user, status, setAuthenticated, handleLogout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
