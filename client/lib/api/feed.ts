// client/lib/api/feed.ts
// Feed API – maps to post-service /api/feed/* routes

import { postApi, DEFAULT_PAGINATION, type Pagination } from "./api";

// ─── Types (aligned with post-service Prisma schema) ─────────────────────────

export type LinkStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "VALIDATED"
  | "DEBUNKED"
  | "FLAGGED";

export type LinkCategory = "WAR" | "FOOD" | "SOCIAL" | "OTHER";

export interface LinkSource {
  id: string;
  url: string;
}

/** Fact-check data returned inside a feed post (the latest review only). */
export interface FactCheckData {
  id: string;
  postId: string;
  factCheckerId: string;
  verdict: "VALIDATED" | "DEBUNKED";
  header: string;
  description: string | null;
  referenceUrls: string[];
  createdAt: string;
  /** Enriched by backend enrichPostsWithUserData() — present in feed responses. */
  factCheckerAuthor?: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    role: string;
    rankName: string;
    rankLevel: number;
    points: number;
  };
}

/**
 * Mirrors the post-service `Link` model with optional enriched relations.
 */
export interface FeedPost {
  id: string;
  title: string;
  url: string;
  description: string | null;
  category: LinkCategory;
  screenRecordingUrl: string | null;
  userId: string;
  status: LinkStatus;
  isPinned: boolean;
  totalLikes: number;
  factCheckerId: string | null;
  reviewedBy: string | null;
  claimedAt: string | null;
  createdAt: string;
  updatedAt: string;
  sources: LinkSource[];
  /** Latest fact-check (1 entry from feedInclude) */
  factChecks?: FactCheckData[];
  /** Enriched by feed controller – absent in raw Link queries */
  author?: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    role: "USER" | "FACT_CHECKER" | "ADMIN";
    rankName?: string;
    rankLevel?: number;
    points?: number;
  };
  /** Computed relation counts */
  _count?: {
    likes: number;
    comments: number;
    views: number;
    shares: number;
    flags: number;
  };
  /** Current-user interaction flags (present when optionalAuth is used) */
  liked?: boolean;
  saved?: boolean;
  flags?: any[]; // The array returned by Prisma feedInclude
}


export interface PaginatedPosts {
  posts: FeedPost[];
  pagination: Pagination;
}

// Re-export Pagination so existing imports from "./feed" still work
export type { Pagination };

// ─── API functions ───────────────────────────────────────────────────────────

/**
 * GET /api/feed — Home feed (authenticated for interaction flags).
 */
export async function getHomeFeed(
  page = 1,
  pageSize = 20
): Promise<PaginatedPosts> {
  const res = await postApi.authGet<FeedPost[]>(
    `/feed?page=${page}&pageSize=${pageSize}`
  );
  return {
    posts: res.data ?? [],
    pagination: res.pagination ?? DEFAULT_PAGINATION,
  };
}

/**
 * GET /api/feed/trending — Trending posts feed.
 */
export async function getTrendingFeed(
  page = 1,
  pageSize = 20
): Promise<PaginatedPosts> {
  const res = await postApi.authGet<FeedPost[]>(
    `/feed/trending?page=${page}&pageSize=${pageSize}`
  );
  return {
    posts: res.data ?? [],
    pagination: res.pagination ?? DEFAULT_PAGINATION,
  };
}

/**
 * GET /api/feed/controversial — Controversial posts feed.
 */
export async function getControversialFeed(
  page = 1,
  pageSize = 20
): Promise<PaginatedPosts> {
  const res = await postApi.authGet<FeedPost[]>(
    `/feed/controversial?page=${page}&pageSize=${pageSize}`
  );
  return {
    posts: res.data ?? [],
    pagination: res.pagination ?? DEFAULT_PAGINATION,
  };
}
