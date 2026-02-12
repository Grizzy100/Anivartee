//server\post-service\src\services\comment.service.ts
import { CommentRepository } from '../repositories/comment.repository.js';
import { PostRepository } from '../repositories/post.repository.js';
import { PointsClient } from './clients/points.client.js';
import { ActivityService } from './activity.service.js';
import { CreateCommentInput, UpdateCommentInput } from '../validators/comment.schema.js';
import { NotFoundError, AuthorizationError, RateLimitError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class CommentService {
  constructor(
    private commentRepo: CommentRepository,
    private postRepo: PostRepository,
    private pointsClient: PointsClient,
    private activityService: ActivityService
  ) {}

  async createComment(linkId: string, userId: string, data: CreateCommentInput) {
    try {
      // 1. Validate post exists
      const post = await this.postRepo.findById(linkId);
      if (!post) {
        throw new NotFoundError('Post not found');
      }

      // 2. If replying, validate parent comment exists
      if (data.parentId) {
        const parentComment = await this.commentRepo.findById(data.parentId);
        if (!parentComment) {
          throw new NotFoundError('Parent comment not found');
        }
        if (parentComment.linkId !== linkId) {
          throw new NotFoundError('Parent comment does not belong to this post');
        }
      }

      // 3. Create comment
      const comment = await this.commentRepo.create(linkId, userId, data);

      // 4. Award points (async, don't wait)
      this.pointsClient.awardPoints(
        userId,
        2,
        'COMMENT_CREATED',
        comment.id
      ).catch(err => logger.error('Failed to award points:', err));

      // 5. Record activity (async, don't wait)
      this.activityService.recordActivity(userId, 'COMMENT_CREATED');

      logger.info(`Comment created: ${comment.id} by user ${userId} on post ${linkId}`);
      return comment;
    } catch (error: any) {
      logger.error('Error in createComment service:', error);
      throw error;
    }
  }

  async getComments(linkId: string, page: number, pageSize: number) {
    try {
      // Validate post exists
      const post = await this.postRepo.findById(linkId);
      if (!post) {
        throw new NotFoundError('Post not found');
      }

      return await this.commentRepo.getCommentsByPost(linkId, page, pageSize);
    } catch (error: any) {
      logger.error('Error in getComments service:', error);
      throw error;
    }
  }

  async updateComment(id: string, userId: string, data: UpdateCommentInput) {
    try {
      // 1. Check ownership
      const isOwner = await this.commentRepo.checkOwnership(id, userId);
      if (!isOwner) {
        throw new AuthorizationError('You can only edit your own comments');
      }

      // 2. Enforce comment edit time window based on rank
      const rankData = await this.pointsClient.getUserRank(userId);
      const windowHours = rankData.limits.commentEditWindowHours;

      if (windowHours !== null) {
        const comment = await this.commentRepo.findById(id);
        if (comment) {
          const ageMs = Date.now() - new Date(comment.createdAt).getTime();
          const windowMs = windowHours * 60 * 60 * 1000;
          if (ageMs > windowMs) {
            throw new RateLimitError(
              `Comments can only be edited within ${windowHours} hours of posting. Increase your rank to edit anytime.`
            );
          }
        }
      }

      // 3. Update comment
      const comment = await this.commentRepo.update(id, data.content);

      logger.info(`Comment updated: ${id} by user ${userId}`);

      return comment;
    } catch (error: any) {
      logger.error('Error in updateComment service:', error);
      throw error;
    }
  }

  async deleteComment(id: string, userId: string) {
    try {
      // 1. Check ownership
      const isOwner = await this.commentRepo.checkOwnership(id, userId);
      if (!isOwner) {
        throw new AuthorizationError('You can only delete your own comments');
      }

      // 2. Delete comment (cascade deletes replies)
      await this.commentRepo.delete(id);

      logger.info(`Comment deleted: ${id} by user ${userId}`);
    } catch (error: any) {
      logger.error('Error in deleteComment service:', error);
      throw error;
    }
  }
}