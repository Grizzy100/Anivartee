"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { BouncingDots } from "@/components/ui/bouncing-dots";
import { getTrendingFeed, type FeedPost, type LinkStatus } from "@/lib/api/feed";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_TAG: Record<LinkStatus, { label: string; color: string }> = {
  VALIDATED: { label: "VERIFIED", color: "text-emerald-600 bg-emerald-600/10" },
  PENDING: { label: "PENDING", color: "text-amber-600 bg-amber-600/10" },
  UNDER_REVIEW: { label: "REVIEW", color: "text-blue-600 bg-blue-600/10" },
  DEBUNKED: { label: "DEBUNKED", color: "text-destructive bg-destructive/10" },
  FLAGGED: { label: "FLAGGED", color: "text-orange-600 bg-orange-600/10" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TrendingPanel() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getTrendingFeed(1, 5)
      .then(({ posts }) => {
        if (!cancelled) setPosts(posts);
      })
      .catch(() => {
        /* silently degrade — panel stays empty */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div id="tour-trending" className="bg-card border border-border rounded-lg p-4">
      {/* Trending Topics */}
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="font-display text-xs font-semibold tracking-wider uppercase text-muted-foreground">
          Trending
        </h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <BouncingDots dots={3} className="w-1.5 h-1.5 bg-muted-foreground" />
        </div>
      ) : posts.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">
          No trending posts right now
        </p>
      ) : (
        <div className="space-y-2.5">
          {posts.map((post) => {
            const tag = STATUS_TAG[post.status] ?? STATUS_TAG.PENDING;
            return (
              <div
                key={post.id}
                className="flex items-start justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground leading-snug cursor-pointer hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </p>
                  <span className="text-[10px] text-muted-foreground/60">
                    {timeAgo(post.createdAt)}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded shrink-0 ${tag.color}`}
                >
                  {tag.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
