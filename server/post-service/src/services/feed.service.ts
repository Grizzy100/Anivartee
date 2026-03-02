import { FeedRepository } from '../repositories/feed.repository.js';
import { PostRepository } from '../repositories/post.repository.js';
import { UserClient } from './clients/user.client.js';
import { PointsClient } from './clients/points.client.js';
import {
  attachInteractionFlags,
  enrichPostsWithUserData,
} from '../utils/enrichment.js';
import { redis } from '../utils/redis.js';
import { logger } from '../utils/logger.js';

const STALE_STATUSES = new Set(['PENDING', 'UNDER_REVIEW']);

export class FeedService {
  constructor(
    private feedRepo: FeedRepository,
    private userClient: UserClient,
    private pointsClient: PointsClient,
    private postRepo?: PostRepository,
  ) { }

  /**
   * Self-heal posts whose DB status is stale relative to their fact-check verdict.
   * Fires DB corrections in the background and returns a corrected copy immediately.
   */
  private reconcileStatuses<T extends { id: string; status: string; factChecks?: { verdict: string }[] }>(posts: T[]): T[] {
    return posts.map((post) => {
      const lastVerdict = post.factChecks?.[post.factChecks.length - 1]?.verdict;
      if (
        STALE_STATUSES.has(post.status) &&
        (lastVerdict === 'VALIDATED' || lastVerdict === 'DEBUNKED')
      ) {
        this.postRepo?.updateStatus(post.id, lastVerdict)
          .catch((err: unknown) => logger.warn(`Status self-heal failed for post ${post.id}:`, err));
        return { ...post, status: lastVerdict };
      }
      return post;
    });
  }

  /** Home feed — VALIDATED + PENDING, ordered by hotScore. */
  async getHomeFeed(userId: string | null, page: number, pageSize: number) {
    if (!userId) {
      const cacheKey = `feed:home:p${page}:s${pageSize}`;
      const cached = await redis.get(cacheKey).catch(() => null);
      if (cached) return JSON.parse(cached);
    }

    const result = await this.feedRepo.getHomeFeed(userId, page, pageSize);
    const healed = this.reconcileStatuses(result.posts);
    const posts = attachInteractionFlags(healed);
    const enriched = await enrichPostsWithUserData(posts, this.userClient, this.pointsClient);
    const finalResult = { ...result, posts: enriched };

    if (!userId) {
      const cacheKey = `feed:home:p${page}:s${pageSize}`;
      await redis.setex(cacheKey, 30, JSON.stringify(finalResult)).catch(err => logger.warn('Redis feed cache error:', err));
    }
    return finalResult;
  }

  /** Trending feed — VALIDATED, 7-day window, hotScore desc. */
  async getTrendingFeed(userId: string | null, page: number, pageSize: number) {
    if (!userId) {
      const cacheKey = `feed:trending:p${page}:s${pageSize}`;
      const cached = await redis.get(cacheKey).catch(() => null);
      if (cached) return JSON.parse(cached);
    }

    const result = await this.feedRepo.getTrendingFeed(userId, page, pageSize);
    const posts = attachInteractionFlags(result.posts);
    const enriched = await enrichPostsWithUserData(posts, this.userClient, this.pointsClient);
    const finalResult = { ...result, posts: enriched };

    if (!userId) {
      const cacheKey = `feed:trending:p${page}:s${pageSize}`;
      await redis.setex(cacheKey, 60, JSON.stringify(finalResult)).catch(err => logger.warn('Redis feed cache error:', err));
    }
    return finalResult;
  }

  /**
   * Controversial feed — raw SQL, no per-user interaction flags currently.
   */
  async getControversialFeed(page: number, pageSize: number) {
    const cacheKey = `feed:controversial:p${page}:s${pageSize}`;
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) return JSON.parse(cached);

    const result = await this.feedRepo.getControversialFeed(page, pageSize);
    const enriched = await enrichPostsWithUserData(result.posts, this.userClient, this.pointsClient);
    const finalResult = { ...result, posts: enriched };

    await redis.setex(cacheKey, 120, JSON.stringify(finalResult)).catch(err => logger.warn('Redis feed cache error:', err));
    return finalResult;
  }
}