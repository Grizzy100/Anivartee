"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

/**
 * Wraps auth pages (login, signup, forgot-password, reset-password).
 * If the user is already authenticated, redirects them to their dashboard.
 * While checking, shows a full-screen loader.
 */
export function RedirectIfAuthenticated({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, status, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (status === "authenticated" && user) {
      const path = user.role === "FACT_CHECKER" ? "/fact-checker" : "/user";
      router.replace(path);
    }
  }, [status, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-white/40" />
      </div>
    );
  }

  // Already authenticated — will redirect from the effect
  if (status === "authenticated") return null;

  return <>{children}</>;
}
