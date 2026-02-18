"use client";

import { useEffect, useState } from "react";
import { FileText, Heart, ShieldCheck } from "lucide-react";
import { getMyRank, type UserRankData } from "@/lib/api/points";
import type { DashboardRole } from "./types";

interface UserStatsCardProps {
  role: DashboardRole;
  displayName?: string;
  initials?: string;
  postsCount?: number;
  likesCount?: string;
  verifiedCount?: number;
}

export function UserStatsCard({
  role,
  displayName = "User",
  initials = "U",
  postsCount = 0,
  likesCount = "0",
  verifiedCount = 0,
}: UserStatsCardProps) {
  const [rankName, setRankName] = useState<string | null>(null);
  const roleLabel = role === "factchecker" ? "Fact-Checker" : "User";

  useEffect(() => {
    let cancelled = false;
    getMyRank()
      .then((data) => {
        if (!cancelled) setRankName(data.rankName);
      })
      .catch(() => {
        // Fallback to default rank label
        if (!cancelled) {
          setRankName(role === "factchecker" ? "Apprentice" : "Novice");
        }
      });
    return () => { cancelled = true; };
  }, [role]);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="font-display text-xs font-bold text-primary">
            {initials}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {displayName}
          </p>
          <p className="text-xs text-muted-foreground">
            <span className="font-display text-[10px] tracking-wide">
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
            {postsCount}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Posts
          </p>
        </div>
        <div className="bg-secondary/50 rounded-md px-3 py-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Heart className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <p className="font-display text-sm font-bold text-foreground">
            {likesCount}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Likes
          </p>
        </div>
      </div>

      {role === "factchecker" && (
        <div className="mt-2 bg-emerald-600/10 rounded-md px-3 py-1.5 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-xs text-emerald-600 font-medium">
            {verifiedCount} Verified
          </span>
        </div>
      )}
    </div>
  );
}
