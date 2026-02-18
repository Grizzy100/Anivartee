//server\post-service\src\services\feed.service.ts
import { FeedRepository } from '../repositories/feed.repository.js';
import { UserClient } from './clients/user.client.js';
import { PointsClient } from './clients/points.client.js';
import {
  attachInteractionFlags,
  enrichPostsWithUserData,
} from '../utils/enrichment.js';

export class FeedService {
  constructor(
    private feedRepo: FeedRepository,
    private userClient: UserClient,
    private pointsClient: PointsClient,
  ) {}

  /** Home feed — VALIDATED + PENDING, ordered by hotScore. */
  async getHomeFeed(userId: string | null, page: number, pageSize: number) {
    const result = await this.feedRepo.getHomeFeed(userId, page, pageSize);
    const posts = attachInteractionFlags(result.posts);
    const enriched = await enrichPostsWithUserData(posts, this.userClient, this.pointsClient);
    return { ...result, posts: enriched };
  }

  /** Trending feed — VALIDATED, 7-day window, hotScore desc. */
  async getTrendingFeed(userId: string | null, page: number, pageSize: number) {
    const result = await this.feedRepo.getTrendingFeed(userId, page, pageSize);
    const posts = attachInteractionFlags(result.posts);
    const enriched = await enrichPostsWithUserData(posts, this.userClient, this.pointsClient);
    return { ...result, posts: enriched };
  }

  /**
   * Controversial feed — raw SQL, no per-user interaction flags.
   * TODO: thread userId through for liked/saved support once the
   * raw query is refactored to a Prisma query.
   */
  async getControversialFeed(page: number, pageSize: number) {
    const result = await this.feedRepo.getControversialFeed(page, pageSize);
    const enriched = await enrichPostsWithUserData(result.posts, this.userClient, this.pointsClient);
    return { ...result, posts: enriched };
  }
}