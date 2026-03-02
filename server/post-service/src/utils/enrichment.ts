import type { UserClient, UserProfile } from '../services/clients/user.client.js';
import type { PointsClient } from '../services/clients/points.client.js';
import type { UserRankData } from '../types/auth.types.js';
import { logger } from './logger.js';
import { redis } from './redis.js';

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
 * - Checks Redis cache first (MGET).
 * - Deduplicates userIds before making network calls for missing keys.
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
    // Collect ALL unique user IDs — post authors + fact-checker IDs
    const postAuthorIds = [...new Set(
      posts.map((p) => p.userId as string).filter(Boolean),
    )];

    const factCheckerIds = [...new Set(
      posts
        .flatMap((p) => (p.factChecks ?? []) as { factCheckerId?: string }[])
        .map((fc) => fc.factCheckerId)
        .filter((id): id is string => !!id),
    )];

    const allUniqueIds = [...new Set([...postAuthorIds, ...factCheckerIds])];

    if (allUniqueIds.length === 0) return posts;

    const userMap = new Map<string, UserProfile>();
    const rankMap = new Map<string, UserRankData>();

    // 1. Check Redis for cached profiles and ranks for all IDs at once
    const userKeys = allUniqueIds.map(id => `user:${id}`);
    const rankKeys = allUniqueIds.map(id => `rank:${id}`);

    let cachedUsers: (string | null)[] = [];
    let cachedRanks: (string | null)[] = [];

    try {
      if (userClient) cachedUsers = await redis.mget(userKeys);
      cachedRanks = await redis.mget(rankKeys);
    } catch (err) {
      logger.warn('Redis MGET failed in enrichment, falling back to network:', err);
    }

    const missingUserIds: string[] = [];
    const missingRankIds: string[] = [];

    // 2. Parse cache hits, collect missing ids
    for (let i = 0; i < allUniqueIds.length; i++) {
      const id = allUniqueIds[i];
      if (cachedUsers[i]) {
        try { userMap.set(id, JSON.parse(cachedUsers[i]!)); } catch { }
      } else if (userClient) {
        missingUserIds.push(id);
      }

      if (cachedRanks[i]) {
        try { rankMap.set(id, JSON.parse(cachedRanks[i]!)); } catch { }
      } else {
        missingRankIds.push(id);
      }
    }

    // 3. Fetch missing profiles/ranks concurrently and set cache
    const fetches: Promise<any>[] = [];

    if (missingUserIds.length > 0 && userClient) {
      fetches.push(userClient.getUsersByIds(missingUserIds).then(async (fetchedMap) => {
        const pipeline = redis.pipeline();
        for (const [id, profile] of fetchedMap.entries()) {
          userMap.set(id, profile);
          pipeline.setex(`user:${id}`, 60, JSON.stringify(profile)); // 60s TTL
        }
        await pipeline.exec().catch(err => logger.warn('Redis pipeline ex failed:', err));
      }).catch(err => logger.error('User client fetch error:', err)));
    }

    if (missingRankIds.length > 0) {
      fetches.push(pointsClient.getUserRanksByIds(missingRankIds).then(async (fetchedMap) => {
        const pipeline = redis.pipeline();
        for (const [id, rank] of fetchedMap.entries()) {
          rankMap.set(id, rank);
          pipeline.setex(`rank:${id}`, 60, JSON.stringify(rank)); // 60s TTL
        }
        await pipeline.exec().catch(err => logger.warn('Redis pipeline ex failed:', err));
      }).catch(err => logger.error('Points client fetch error:', err)));
    }

    await Promise.all(fetches);

    // 4. Transform posts — inject author + enrich factCheckerAuthor in each factCheck
    return posts.map((post) => {
      const enrichedFactChecks = (post.factChecks ?? []).map((fc: Record<string, any>) => {
        if (!fc.factCheckerId) return fc;
        return {
          ...fc,
          factCheckerAuthor: buildAuthorPayload(
            fc.factCheckerId,
            userMap.get(fc.factCheckerId),
            rankMap.get(fc.factCheckerId),
          ),
        };
      });

      return {
        ...post,
        author: buildAuthorPayload(
          post.userId,
          userMap.get(post.userId),
          rankMap.get(post.userId),
        ),
        factChecks: enrichedFactChecks,
      };
    });
  } catch (error) {
    logger.error('Error enriching posts with user data:', error);
    return posts;
  }
}

