//server\post-service\src\services\feed.service.ts
// src/services/feed.service.ts
import { FeedRepository } from '../repositories/feed.repository.js';
import { UserClient } from './clients/user.client.js';
import { logger } from '../utils/logger.js';

export class FeedService {
  constructor(
    private feedRepo: FeedRepository,
    private userClient: UserClient
  ) {}

  async getHomeFeed(userId: string | null, page: number, pageSize: number) {
    try {
      const result = await this.feedRepo.getHomeFeed(userId, page, pageSize);

      // Enrich posts with user data
      const enrichedPosts = await this.enrichPostsWithUserData(result.posts);

      return {
        ...result,
        posts: enrichedPosts
      };
    } catch (error: any) {
      logger.error('Error in getHomeFeed service:', error);
      throw error;
    }
  }

  async getTrendingFeed(page: number, pageSize: number) {
    try {
      const result = await this.feedRepo.getTrendingFeed(page, pageSize);

      // Enrich posts with user data
      const enrichedPosts = await this.enrichPostsWithUserData(result.posts);

      return {
        ...result,
        posts: enrichedPosts
      };
    } catch (error: any) {
      logger.error('Error in getTrendingFeed service:', error);
      throw error;
    }
  }

  async getControversialFeed(page: number, pageSize: number) {
    try {
      const result = await this.feedRepo.getControversialFeed(page, pageSize);

      // Enrich posts with user data
      const enrichedPosts = await this.enrichPostsWithUserData(result.posts);

      return {
        ...result,
        posts: enrichedPosts
      };
    } catch (error: any) {
      logger.error('Error in getControversialFeed service:', error);
      throw error;
    }
  }

  private async enrichPostsWithUserData(posts: any[]) {
    try {
      // Extract unique user IDs
      const userIds = [...new Set(posts.map(post => post.userId))];

      // Fetch user data in batch
      const userMap = await this.userClient.getUsersByIds(userIds);

      // Enrich posts with user data
      return posts.map(post => ({
        ...post,
        author: userMap.get(post.userId) || {
          id: post.userId,
          username: 'Unknown User',
          role: 'USER'
        }
      }));
    } catch (error: any) {
      logger.error('Error enriching posts with user data:', error);
      // Return posts without enrichment if user service fails
      return posts;
    }
  }
}