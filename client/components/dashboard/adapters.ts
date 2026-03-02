// Shared adapters: API models → display-ready PostData
// Centralises transformation logic used by both user and fact-checker pages.

import type { FeedPost } from "@/lib/api/feed";
import type { ModerationQueueItem, QueueStatus } from "@/lib/api/factChecker";
import type { PostData } from "./types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extract up to 2-char uppercase initials from a display name. */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Format an ISO date string to a short locale display. */
function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Map backend role enum to a human-readable label. */
function roleLabel(role?: string): string {
  switch (role) {
    case "FACT_CHECKER":
      return "Fact-Checker";
    case "ADMIN":
      return "Admin";
    default:
      return "Contributor";
  }
}

/** Map backend LinkStatus to display-layer status. */
function linkStatusToDisplay(
  status?: string
): "verified" | "under-review" | "pending" | "debunked" | "flagged" {
  switch (status) {
    case "VALIDATED":
      return "verified";
    case "UNDER_REVIEW":
      return "under-review";
    case "DEBUNKED":
      return "debunked";
    case "FLAGGED":
      return "flagged";
    default:
      return "pending";
  }
}

// ─── Adapters ────────────────────────────────────────────────────────────────

/** Convert an API `FeedPost` to display-ready `PostData`. */
export function feedPostToPostData(p: FeedPost): PostData {
  const name = p.author?.displayName || p.author?.username || "Unknown";

  // Use the server-side LinkStatus as the single source of truth.
  // The fact-check verdict is shown separately via FactCheckPostCard; overriding
  // the status here caused filter mismatches (e.g. a PENDING post that has a
  // fact-check entry being displayed as "verified" while the server returned it
  // under the PENDING filter).
  const derivedStatus = linkStatusToDisplay(p.status);

  return {
    id: p.id,
    linkId: p.id,
    userId: p.userId,
    author: {
      name,
      initials: getInitials(name),
      role: roleLabel(p.author?.role),
      avatarUrl: p.author?.avatarUrl ?? null,
      rankName: p.author?.rankName ?? "Novice",
      rankLevel: p.author?.rankLevel ?? 0,
    },
    timestamp: formatTimestamp(p.createdAt),
    title: p.title,
    description: p.description ?? "",
    proofLinks: p.sources?.map((s) => s.url) ?? [],
    likes: p._count?.likes ?? p.totalLikes ?? 0,
    comments: p._count?.comments ?? 0,
    shares: p._count?.shares ?? 0,
    flags: p._count?.flags ?? 0,
    liked: p.liked ?? false,
    flagged: p.flags && p.flags.length > 0,
    saved: p.saved ?? false,
    factChecks: p.factChecks ?? [],
    status: derivedStatus,
  };
}

/** Map moderation queue status to display-layer status. */
function queueStatusToDisplay(
  status: QueueStatus
): "verified" | "under-review" | "pending" {
  switch (status) {
    case "COMPLETED":
      return "verified";
    case "CLAIMED":
      return "under-review";
    default:
      return "pending";
  }
}

/** Convert a `ModerationQueueItem` to display-ready `PostData`. */
export function queueItemToPostData(item: ModerationQueueItem): PostData {
  const post = item.post;
  const name =
    post?.author?.displayName || post?.author?.username || "Unknown";

  return {
    id: item.id,
    linkId: post?.id ?? item.id,
    userId: post?.userId ?? item.userId,
    author: {
      name,
      initials: getInitials(name),
      role: roleLabel(post?.author?.role),
      avatarUrl: post?.author?.avatarUrl ?? null,
      rankName: post?.author?.rankName ?? "Novice",
      rankLevel: post?.author?.rankLevel ?? 0,
    },
    timestamp: formatTimestamp(item.addedAt),
    title: post?.title ?? "Untitled Post",
    description: post?.description ?? "",
    proofLinks: post?.sources?.map((s) => s.url) ?? [],
    likes: post?._count?.likes ?? post?.totalLikes ?? 0,
    comments: post?._count?.comments ?? 0,
    shares: post?._count?.shares ?? 0,
    flags: post?._count?.flags ?? 0,
    liked: post?.liked ?? false,
    flagged: post?.flags && post?.flags.length > 0,
    saved: post?.saved ?? false,
    status: queueStatusToDisplay(item.status),
  };
}
