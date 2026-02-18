"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

// ─── Types ───────────────────────────────────────────────────────────────────

type AllowedRole = "USER" | "FACT_CHECKER";

interface RequireAuthProps {
  /** Which backend role(s) may access this route. Omit to allow any authenticated user. */
  allowedRoles?: AllowedRole[];
  children: React.ReactNode;
}

// ─── Role → dashboard path mapping ──────────────────────────────────────────

const ROLE_DASHBOARD: Record<AllowedRole, string> = {
  USER: "/user",
  FACT_CHECKER: "/fact-checker",
};

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Protects a route segment.
 *
 * - While the auth status is unknown → shows a full-screen loader.
 * - If unauthenticated → redirects to `/login`.
 * - If authenticated but wrong role → redirects to the user's own dashboard.
 * - If authenticated and role matches → renders children.
 */
export function RequireAuth({ allowedRoles, children }: RequireAuthProps) {
  const { user, status, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // Not logged in → login page (preserve intended destination)
    if (status === "unauthenticated") {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Logged in but wrong role → redirect to their own dashboard
    if (
      user &&
      allowedRoles &&
      !allowedRoles.includes(user.role as AllowedRole)
    ) {
      const correctPath = ROLE_DASHBOARD[user.role as AllowedRole] ?? "/user";
      router.replace(correctPath);
    }
  }, [status, isLoading, user, allowedRoles, router, pathname]);

  // Still loading auth state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not authenticated — will redirect from the effect
  if (status === "unauthenticated") return null;

  // Wrong role — will redirect from the effect
  if (user && allowedRoles && !allowedRoles.includes(user.role as AllowedRole)) {
    return null;
  }

  // Authorised
  return <>{children}</>;
}
