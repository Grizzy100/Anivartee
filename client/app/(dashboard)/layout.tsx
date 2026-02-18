"use client";

import { usePathname } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { RequireAuth } from "@/lib/auth/RequireAuth";
import type { DashboardRole } from "@/components/dashboard/types";

export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isFactChecker = pathname.startsWith("/fact-checker");
  const role: DashboardRole = isFactChecker ? "factchecker" : "user";
  const allowedRoles = isFactChecker
    ? (["FACT_CHECKER"] as const)
    : (["USER"] as const);

  return (
    <RequireAuth allowedRoles={[...allowedRoles]}>
      <DashboardLayout role={role}>{children}</DashboardLayout>
    </RequireAuth>
  );
}
