// client/lib/api/points.ts
// Points API – maps to points-service /api/points/* routes
// Types aligned with points-service Prisma schema & UserRankData type

import { pointsApi, unwrap, DEFAULT_PAGINATION } from "./api";
import type { Pagination } from "./api";

// ─── Types (aligned with points-service auth.types.ts / Prisma) ──────────────

export interface RankLimits {
  maxHeaderLength: number;
  maxDescriptionLength: number;
  postsPerDay: number;
  editsPerDay: number;
  commentEditWindowHours: number | null;
  flagsPerDay: number;
  postPoints: number;
  flagWeight: number;
}

/** Mirrors `UserRankData` from points-service `auth.types.ts`. */
export interface UserRankData {
  userId: string;
  role: "USER" | "FACT_CHECKER" | "ADMIN";
  rankLevel: number;
  rankName: string;
  points: number;
  limits: RankLimits;
}

/** Mirrors `PointsLedger` from points-service Prisma schema. */
export interface PointsLedgerEntry {
  id: string;
  userId: string;
  points: number;
  reason: string;
  contextId: string | null;
  createdAt: string;
}

export interface PaginatedHistory {
  entries: PointsLedgerEntry[];
  pagination: Pagination;
}

/**
 * Leaderboard entry shape returned by `getLeaderboard`.
 * Includes user info fetched by the points-service via UserClient.
 */
export interface LeaderboardEntry {
  userId: string;
  balance: number;
  user?: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    role: "USER" | "FACT_CHECKER" | "ADMIN";
  };
}

// ─── API functions ───────────────────────────────────────────────────────────

/** GET /api/points/leaderboard — Public leaderboard. */
export async function getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  const res = await pointsApi.get<LeaderboardEntry[]>(
    `/points/leaderboard?limit=${limit}`
  );
  return res.data ?? [];
}

/** GET /api/points/me — Authenticated user's rank, points, and limits. */
export async function getMyRank(): Promise<UserRankData> {
  return unwrap(
    await pointsApi.authGet<UserRankData>("/points/me"),
    "Failed to fetch rank"
  );
}

/** GET /api/points/me/history — Authenticated user's points history. */
export async function getMyHistory(
  page = 1,
  pageSize = 20
): Promise<PaginatedHistory> {
  const res = await pointsApi.authGet<PointsLedgerEntry[]>(
    `/points/me/history?page=${page}&pageSize=${pageSize}`
  );
  return {
    entries: res.data ?? [],
    pagination: res.pagination ?? DEFAULT_PAGINATION,
  };
}
