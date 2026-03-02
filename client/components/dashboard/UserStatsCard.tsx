"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, Heart, ShieldCheck, Zap } from "lucide-react";
import { getMyRank, type UserRankData } from "@/lib/api/points";
import { getUserStats, type UserStats } from "@/lib/api/post";
import { useAuth } from "@/lib/auth/AuthContext";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { useProductTour } from "@/lib/contexts/ProductTourContext";
import type { DashboardRole } from "./types";

interface UserStatsCardProps {
  role: DashboardRole;
  displayName?: string;
  initials?: string;
}

export function UserStatsCard({
  role,
  displayName = "User",
  initials = "U",
}: UserStatsCardProps) {
  const { user } = useAuth();
  const { startTour } = useProductTour();
  const [rankData, setRankData] = useState<UserRankData | null>(null);
  const rankName = rankData?.rankName ?? null;
  const [stats, setStats] = useState<UserStats>({
    postsCount: 0,
    totalLikesReceived: 0,
    verifiedCount: 0,
    factChecksPerformed: 0,
  });
  const roleLabel = role === "factchecker" ? "Fact-Checker" : "User";

  // Fetch rank
  useEffect(() => {
    let cancelled = false;
    getMyRank()
      .then((data) => {
        if (!cancelled) setRankData(data);
      })
      .catch(() => {
        if (!cancelled) {
          // Provide a sensible fallback on API error
          setRankData(null);
        }
      });
    return () => { cancelled = true; };
  }, [role]);

  // Fetch user stats
  const fetchStats = useCallback(() => {
    if (!user?.id) return;
    getUserStats(user.id)
      .then(setStats)
      .catch(() => { /* keep previous stats on error */ });
  }, [user?.id]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Refetch on window focus (catches post create/delete on other pages)
  useEffect(() => {
    const onFocus = () => fetchStats();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchStats]);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="font-display text-xs font-bold text-primary">
            {initials}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground truncate">
              {displayName}
            </p>
            <button
              onClick={startTour}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Help Tour"
            >
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="font-display text-[10px] tracking-wide" id="tour-user-rank">
              {rankName ?? "…"}
            </span>
            <span className="mx-1.5 text-border">|</span>
            <span>{roleLabel}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-secondary/50 rounded-md px-3 py-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <p className="font-display text-sm font-bold text-foreground">
            {stats.postsCount}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Posts
          </p>
        </div>
        {role === "factchecker" ? (
          <div className="bg-secondary/50 rounded-md px-3 py-2 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <p className="font-display text-sm font-bold text-foreground">
              {stats.factChecksPerformed}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Fact-Checks
            </p>
          </div>
        ) : (
          <div className="bg-secondary/50 rounded-md px-3 py-2 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Heart className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <p className="font-display text-sm font-bold text-foreground">
              {stats.totalLikesReceived}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Likes
            </p>
          </div>
        )}
      </div>

      {/* Points + Rank Level strip */}
      {rankData && (
        <div className="mt-2 flex items-center justify-between bg-secondary/40 rounded-md px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-foreground">
              {rankData.points.toLocaleString()} pts
            </span>
          </div>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold uppercase tracking-wider ${rankData.rankLevel >= 5
              ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
              : rankData.rankLevel >= 3
                ? "text-violet-400 bg-violet-400/10 border-violet-400/20"
                : "text-sky-400 bg-sky-400/10 border-sky-400/20"
              }`}
          >
            Lvl {rankData.rankLevel} · {rankData.rankName}
          </span>
        </div>
      )}

    </div>
  );
}
