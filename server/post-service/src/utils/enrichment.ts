//server\post-service\src\utils\enrichment.ts
import type { UserClient, UserProfile } from '../services/clients/user.client.js';
import type { PointsClient } from '../services/clients/points.client.js';
import type { UserRankData } from '../types/auth.types.js';
import { logger } from './logger.js';

// ──────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────

/** Shape attached to every enriched post as the `author` field. */
export interface PostAuthor {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;
  rankName: string;
  rankLevel: number;
  points: number;
}

// ──────────────────────────────────────────────────────
// Pure helpers
// ──────────────────────────────────────────────────────

/**
 * Build a normalised author payload from raw user + rank data.
 * Always returns a complete object — missing data is filled with defaults.
 */
export function buildAuthorPayload(
  userId: string,
  user?: UserProfile | null,
  rank?: UserRankData | null,
): PostAuthor {
  return {
    id: user?.id ?? userId,
    username: user?.username ?? 'Unknown User',
    displayName: user?.displayName ?? null,
    avatarUrl: user?.avatarUrl ?? null,
    role: user?.role ?? 'USER',
    rankName: rank?.rankName ?? 'Novice',
    rankLevel: rank?.rankLevel ?? 0,
    points: rank?.points ?? 0,
  };
}

/**
 * Convert per-user `likes` / `saves` arrays (from Prisma conditional includes)
 * into flat boolean flags, then strip the raw arrays from the response.
 *
 * When `likes`/`saves` are absent (e.g. unauthenticated request or raw-SQL
 * feed), both flags default to `false`.
 */
export function attachInteractionFlags<T extends Record<string, any>>(
  posts: T[],
): (Omit<T, 'likes' | 'saves'> & { liked: boolean; saved: boolean })[] {
  return posts.map(({ likes, saves, ...rest }) => ({
    ...(rest as Omit<T, 'likes' | 'saves'>),
    liked: Array.isArray(likes) && likes.length > 0,
    saved: Array.isArray(saves) && saves.length > 0,
  }));
}

// ──────────────────────────────────────────────────────
// Async enrichment
// ──────────────────────────────────────────────────────

/**
 * Attach author profile (user-service) and rank data (points-service)
 * to every post in a single pass.
 *
 * - Deduplicates userIds before making network calls.
 * - Fires user + rank lookups in parallel.
 * - Gracefully degrades: returns un-enriched posts when both services fail.
 *
 * @param posts        – array of posts (must have a `.userId` string field)
 * @param userClient   – UserClient instance, or `null` to skip user lookups
 * @param pointsClient – PointsClient instance
 */
export async function enrichPostsWithUserData(
  posts: Record<string, any>[],
  userClient: UserClient | null,
  pointsClient: PointsClient,
): Promise<Record<string, any>[]> {
  if (posts.length === 0) return posts;

  try {
    const userIds = [...new Set(
      posts.map((p) => p.userId as string).filter(Boolean),
    )];

    if (userIds.length === 0) return posts;

    const [userMap, rankMap] = await Promise.all([
      userClient
        ? userClient.getUsersByIds(userIds)
        : Promise.resolve(new Map<string, UserProfile>()),
      pointsClient.getUserRanksByIds(userIds),
    ]);

    return posts.map((post) => ({
      ...post,
      author: buildAuthorPayload(
        post.userId,
        userMap.get(post.userId),
        rankMap.get(post.userId),
      ),
    }));
  } catch (error) {
    logger.error('Error enriching posts with user data:', error);
    return posts;
  }
}
