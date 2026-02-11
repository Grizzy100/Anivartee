//server\post-service\src\services\interaction.service.ts
import { InteractionRepository } from '../repositories/interaction.repository.js';
import { PostRepository } from '../repositories/post.repository.js';
import { CommentRepository } from '../repositories/comment.repository.js';
import { FlagRepository } from '../repositories/flag.repository.js';
import { PointsClient } from './clients/points.client.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class InteractionService {
  constructor(
    private interactionRepo: InteractionRepository,
    private postRepo: PostRepository,
    private commentRepo: CommentRepository,
    private flagRepo: FlagRepository,
    private pointsClient: PointsClient
  ) {}

  // ============= POST LIKES =============
  async likePost(linkId: string, userId: string) {
    try {
      // 1. Check if post exists
      const post = await this.postRepo.findById(linkId);
      if (!post) {
        throw new NotFoundError('Post not found');
      }

      // 2. Check if already liked
      const existingLike = await this.interactionRepo.findLike(linkId, userId);
      if (existingLike) {
        throw new ConflictError('You have already liked this post');
      }

      // 3. Create like
      await this.interactionRepo.createLike(linkId, userId);

      // 4. Increment like count
      await this.postRepo.incrementLikes(linkId);

      // 5. Check if should revert from FLAGGED status
      if (post.status === 'FLAGGED') {
        const { shouldBeFlagged } = await this.flagRepo.calculateWeightedFlagScore(linkId);
        
        if (!shouldBeFlagged) {
          await this.postRepo.updateStatus(linkId, 'PENDING');
          logger.info(`Post ${linkId} reverted to PENDING (likes increased)`);
        }
      }

      // 6. Award points (async, don't wait)
      this.pointsClient.awardPoints(
        userId,
        1,
        'POST_LIKED',
        linkId
      ).catch(err => logger.error('Failed to award points:', err));

      logger.info(`User ${userId} liked post ${linkId}`);
    } catch (error: any) {
      logger.error('Error in likePost service:', error);
      throw error;
    }
  }

  async unlikePost(linkId: string, userId: string) {
    try {
      // 1. Check if post exists
      const post = await this.postRepo.findById(linkId);
      if (!post) {
        throw new NotFoundError('Post not found');
      }

      // 2. Check if liked
      const existingLike = await this.interactionRepo.findLike(linkId, userId);
      if (!existingLike) {
        throw new NotFoundError('You have not liked this post');
      }

      // 3. Delete like
      await this.interactionRepo.deleteLike(linkId, userId);

      // 4. Decrement like count
      await this.postRepo.decrementLikes(linkId);

      // 5. Check if should become FLAGGED
      const { shouldBeFlagged } = await this.flagRepo.calculateWeightedFlagScore(linkId);
      
      if (shouldBeFlagged && post.status !== 'FLAGGED') {
        await this.postRepo.updateStatus(linkId, 'FLAGGED');
        logger.info(`Post ${linkId} changed to FLAGGED (likes decreased)`);
      }

      logger.info(`User ${userId} unliked post ${linkId}`);
    } catch (error: any) {
      logger.error('Error in unlikePost service:', error);
      throw error;
    }
  }

  async hasUserLiked(linkId: string, userId: string): Promise<boolean> {
    try {
      const like = await this.interactionRepo.findLike(linkId, userId);
      return !!like;
    } catch (error: any) {
      logger.error('Error in hasUserLiked service:', error);
      throw error;
    }
  }

  // ============= COMMENT LIKES =============
  async likeComment(commentId: string, userId: string) {
    try {
      // 1. Check if comment exists
      const comment = await this.commentRepo.findById(commentId);
      if (!comment) {
        throw new NotFoundError('Comment not found');
      }

      // 2. Check if already liked
      const existingLike = await this.interactionRepo.findCommentLike(commentId, userId);
      if (existingLike) {
        throw new ConflictError('You have already liked this comment');
      }

      // 3. Create like
      await this.interactionRepo.createCommentLike(commentId, userId);

      // 4. Award points (async, don't wait)
      this.pointsClient.awardPoints(
        userId,
        1,
        'COMMENT_LIKED',
        commentId
      ).catch(err => logger.error('Failed to award points:', err));

      logger.info(`User ${userId} liked comment ${commentId}`);
    } catch (error: any) {
      logger.error('Error in likeComment service:', error);
      throw error;
    }
  }

  async unlikeComment(commentId: string, userId: string) {
    try {
      // 1. Check if comment exists
      const comment = await this.commentRepo.findById(commentId);
      if (!comment) {
        throw new NotFoundError('Comment not found');
      }

      // 2. Check if liked
      const existingLike = await this.interactionRepo.findCommentLike(commentId, userId);
      if (!existingLike) {
        throw new NotFoundError('You have not liked this comment');
      }

      // 3. Delete like
      await this.interactionRepo.deleteCommentLike(commentId, userId);

      logger.info(`User ${userId} unliked comment ${commentId}`);
    } catch (error: any) {
      logger.error('Error in unlikeComment service:', error);
      throw error;
    }
  }

  // ============= SAVES =============
  async savePost(linkId: string, userId: string) {
    try {
      // 1. Check if post exists
      const post = await this.postRepo.findById(linkId);
      if (!post) {
        throw new NotFoundError('Post not found');
      }

      // 2. Check if already saved
      const isSaved = await this.interactionRepo.findSave(linkId, userId);
      if (isSaved) {
        throw new ConflictError('You have already saved this post');
      }

      // 3. Save post
      await this.interactionRepo.createSave(linkId, userId);

      logger.info(`User ${userId} saved post ${linkId}`);
    } catch (error: any) {
      logger.error('Error in savePost service:', error);
      throw error;
    }
  }

  async unsavePost(linkId: string, userId: string) {
    try {
      // 1. Check if post exists
      const post = await this.postRepo.findById(linkId);
      if (!post) {
        throw new NotFoundError('Post not found');
      }

      // 2. Check if saved
      const isSaved = await this.interactionRepo.findSave(linkId, userId);
      if (!isSaved) {
        throw new NotFoundError('You have not saved this post');
      }

      // 3. Unsave post
      await this.interactionRepo.deleteSave(linkId, userId);

      logger.info(`User ${userId} unsaved post ${linkId}`);
    } catch (error: any) {
      logger.error('Error in unsavePost service:', error);
      throw error;
    }
  }

  async getSavedPosts(userId: string, page: number, pageSize: number) {
    try {
      return await this.interactionRepo.getSavedPostsByUser(userId, page, pageSize);
    } catch (error: any) {
      logger.error('Error in getSavedPosts service:', error);
      throw error;
    }
  }

  // ============= VIEWS =============
  async trackView(linkId: string, userId: string | null, sessionId?: string) {
    try {
      // 1. Check if post exists
      const post = await this.postRepo.findById(linkId);
      if (!post) {
        throw new NotFoundError('Post not found');
      }

      // 2. If user is logged in, check if viewed recently (24h)
      if (userId) {
        const viewedRecently = await this.interactionRepo.hasUserViewedRecently(linkId, userId, 24);
        if (viewedRecently) {
          return; // Don't track duplicate view
        }
      }

      // 3. Track view
      await this.interactionRepo.createView(linkId, userId, undefined, sessionId);

      logger.debug(`View tracked for post ${linkId}`);
    } catch (error: any) {
      // Don't throw error for view tracking failures
      logger.error('Error in trackView service:', error);
    }
  }

  // ============= SHARES =============
  async sharePost(linkId: string, userId: string, platform?: string) {
    try {
      // 1. Check if post exists
      const post = await this.postRepo.findById(linkId);
      if (!post) {
        throw new NotFoundError('Post not found');
      }

      // 2. Track share
      await this.interactionRepo.createShare(linkId, userId, platform);

      // 3. Award points (async, don't wait)
      this.pointsClient.awardPoints(
        userId,
        2,
        'POST_SHARED',
        linkId
      ).catch(err => logger.error('Failed to award points:', err));

      logger.info(`User ${userId} shared post ${linkId} on ${platform || 'unknown'}`);
    } catch (error: any) {
      logger.error('Error in sharePost service:', error);
      throw error;
    }
  }
}