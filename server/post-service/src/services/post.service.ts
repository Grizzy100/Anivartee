//server\post-service\src\services\post.service.ts
import { PostRepository } from '../repositories/post.repository.js';
import { PointsClient } from './clients/points.client.js';
import { QueueService } from './queue.service.js';
import { ActivityService } from './activity.service.js';
import { CreatePostInput, UpdatePostInput } from '../validators/post.schema.js';
import { 
  NotFoundError, 
  ValidationError, 
  AuthorizationError,
  RateLimitError 
} from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class PostService {
  constructor(
    private postRepo: PostRepository,
    private pointsClient: PointsClient,
    private queueService: QueueService,
    private activityService: ActivityService
  ) {}

  async createPost(userId: string, data: CreatePostInput) {
    try {
      // 1. Get user's rank
      const rankData = await this.pointsClient.getUserRank(userId);

      // 2. Check daily post limit
      const todayCount = await this.postRepo.getPostCountToday(userId);
      if (todayCount >= rankData.limits.postsPerDay) {
        throw new RateLimitError(
          `Daily post limit (${rankData.limits.postsPerDay}) reached. Increase your rank to post more.`
        );
      }

      // 3. Validate title/description length based on rank
      if (data.title.length > rankData.limits.maxHeaderLength) {
        throw new ValidationError(
          `Title must be ${rankData.limits.maxHeaderLength} characters or less for your rank.`
        );
      }

      if (data.description && data.description.length > rankData.limits.maxDescriptionLength) {
        throw new ValidationError(
          `Description must be ${rankData.limits.maxDescriptionLength} characters or less for your rank.`
        );
      }

      // 4. Create post
      const post = await this.postRepo.create(data, userId);

      // 5. Add to moderation queue (async, don't wait)
      this.queueService.addToQueue(post.id, userId)
        .catch(err => logger.error('Failed to add to moderation queue:', err));

      // 6. Award points (async, don't wait)
      this.pointsClient.awardPoints(
        userId,
        rankData.limits.postPoints,
        'POST_CREATED',
        post.id
      ).catch(err => logger.error('Failed to award points:', err));

      // 7. Record activity (async, don't wait)
      this.activityService.recordActivity(userId, 'POST_CREATED');

      logger.info(`Post created: ${post.id} by user ${userId}`);
      return post;
    } catch (error: any) {
      logger.error('Error in createPost service:', error);
      throw error;
    }
  }

  async getPost(id: string, userId?: string) {
    try {
      const post = await this.postRepo.findById(id);
      
      if (!post) {
        throw new NotFoundError('Post not found');
      }

      return post;
    } catch (error: any) {
      logger.error('Error in getPost service:', error);
      throw error;
    }
  }

  async updatePost(id: string, userId: string, data: UpdatePostInput) {
    try {
      // 1. Check ownership
      const isOwner = await this.postRepo.checkOwnership(id, userId);
      if (!isOwner) {
        throw new AuthorizationError('You can only edit your own posts');
      }

      // 2. Get user's rank for validation
      const rankData = await this.pointsClient.getUserRank(userId);

      // 3. Validate lengths
      if (data.title && data.title.length > rankData.limits.maxHeaderLength) {
        throw new ValidationError(
          `Title must be ${rankData.limits.maxHeaderLength} characters or less for your rank.`
        );
      }

      if (data.description && data.description.length > rankData.limits.maxDescriptionLength) {
        throw new ValidationError(
          `Description must be ${rankData.limits.maxDescriptionLength} characters or less for your rank.`
        );
      }

      // 4. Update post
      const post = await this.postRepo.update(id, data);

      logger.info(`Post updated: ${id} by user ${userId}`);

      return post;
    } catch (error: any) {
      logger.error('Error in updatePost service:', error);
      throw error;
    }
  }

  async deletePost(id: string, userId: string) {
    try {
      // 1. Check ownership
      const isOwner = await this.postRepo.checkOwnership(id, userId);
      if (!isOwner) {
        throw new AuthorizationError('You can only delete your own posts');
      }

      // 2. Delete post
      await this.postRepo.delete(id);

      // 3. Remove from moderation queue (async, don't wait)
      this.queueService.removeFromQueue(id)
        .catch(err => logger.error('Failed to remove from moderation queue:', err));

      logger.info(`Post deleted: ${id} by user ${userId}`);
    } catch (error: any) {
      logger.error('Error in deletePost service:', error);
      throw error;
    }
  }

  async getUserPosts(userId: string, page: number, pageSize: number) {
    try {
      return await this.postRepo.getUserPosts(userId, page, pageSize);
    } catch (error: any) {
      logger.error('Error in getUserPosts service:', error);
      throw error;
    }
  }

  async updatePostStatus(id: string, status: string) {
    try {
      const post = await this.postRepo.findById(id);
      
      if (!post) {
        throw new NotFoundError('Post not found');
      }

      await this.postRepo.updateStatus(id, status);

      logger.info(`Post status updated: ${id} to ${status}`);
    } catch (error: any) {
      logger.error('Error in updatePostStatus service:', error);
      throw error;
    }
  }
}