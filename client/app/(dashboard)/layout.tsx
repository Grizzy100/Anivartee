"use client";

import { usePathname } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { RequireAuth } from "@/lib/auth/RequireAuth";
import type { DashboardRole } from "@/components/dashboard/types";
import { FeedProvider } from "@/components/dashboard/FeedContext";
import { getHomeFeed } from "@/lib/api/feed";
import { feedPostToPostData } from "@/components/dashboard/adapters";

// Stable fetcher — avoids re-creating on every render
const fetchFeedItems = () => getHomeFeed().then((r) => r.posts);

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
      <FeedProvider fetchItems={fetchFeedItems} adapter={feedPostToPostData}>
        <DashboardLayout role={role}>{children}</DashboardLayout>
      </FeedProvider>
    </RequireAuth>
  );
}
