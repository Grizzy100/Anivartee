"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { CalendarWidget } from "./CalendarWidget";
import { TrendingPanel } from "./TrendingPanel";
import type { DashboardRole } from "./types";
import { useAchievements } from "@/lib/hooks/useAchievements";
import { AchievementToast } from "@/components/ui/AchievementToast";
import { QuotaToast } from "@/components/ui/QuotaToast";

interface DashboardLayoutProps {
  role: DashboardRole;
  children: React.ReactNode;
}

export function DashboardLayout({ role, children }: DashboardLayoutProps) {
  const { toasts, dismissToast } = useAchievements();
  const [quotaVisible, setQuotaVisible] = useState(false);

  // Listen for quota-exceeded events dispatched by CreatePostModal
  useEffect(() => {
    const handler = () => setQuotaVisible(true);
    window.addEventListener("quota-exceeded", handler);
    return () => window.removeEventListener("quota-exceeded", handler);
  }, []);

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Sidebar — Fixed 260px */}
      <Sidebar role={role} />

      {/* Center Feed — Scrollable */}
      <main className="ml-[260px] mr-[320px] flex-1 h-screen overflow-y-auto scrollbar-thin px-6 py-6">
        {children}
      </main>

      {/* Right Panel — Fixed 320px */}
      <aside className="fixed right-0 top-0 bottom-0 w-[320px] border-l border-border bg-background overflow-y-auto scrollbar-thin p-4 space-y-4 z-30">
        <CalendarWidget />
        <TrendingPanel />
      </aside>

      {/* Achievement Toasts — rendered above everything, bottom-right */}
      <AchievementToast toasts={toasts} onDismiss={dismissToast} />

      {/* Quota Toast — shown when daily ranked post limit is hit */}
      <QuotaToast
        visible={quotaVisible}
        onDismiss={() => setQuotaVisible(false)}
      />
    </div>
  );
}

