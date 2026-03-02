//server\post-service\src\services\interaction.service.ts
import { InteractionRepository } from '../repositories/interaction.repository.js';
import { PostRepository } from '../repositories/post.repository.js';
import { CommentRepository } from '../repositories/comment.repository.js';
import { FlagRepository } from '../repositories/flag.repository.js';
import { PointsClient } from './clients/points.client.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import type { SharePlatform } from '../generated/prisma/index.js';

/** Hard cap for page size to prevent abuse. */
const MAX_PAGE_SIZE = 100;
function clampPageSize(raw: number): number {
  return Math.min(Math.max(raw, 1), MAX_PAGE_SIZE);
}

export class InteractionService {
  constructor(
    private interactionRepo: InteractionRepository,
    private postRepo: PostRepository,
    private commentRepo: CommentRepository,
    private flagRepo: FlagRepository,
    private pointsClient: PointsClient
  ) { }

  // ============= POST LIKES =============

  async likePost(linkId: string, userId: string) {
    // Parallel: validate post + check duplicate
    const [post, existingLike] = await Promise.all([
      this.postRepo.findById(linkId),
      this.interactionRepo.findLike(linkId, userId),
    ]);

    if (!post) throw new NotFoundError('Post not found');
    if (existingLike) throw new ConflictError('You have already liked this post');

    // Mutually exclusive logic: Remove flag if it exists
    const existingFlag = await this.interactionRepo.findFlag(linkId, userId);
    if (existingFlag) {
      await this.interactionRepo.deleteFlag(linkId, userId);
      logger.info(`User ${userId} liked post ${linkId} (removed existing flag)`);
      // We don't recalculate the flag score yet; the like creation below handles the overall state re-evaluation
    }

    // Create like + bump counter
    await this.interactionRepo.createLike(linkId, userId);
    await this.postRepo.incrementLikes(linkId);

    // Revert FLAGGED → PENDING if likes now outweigh flags
    if (post.status === 'FLAGGED') {
      const { shouldBeFlagged } = await this.flagRepo.calculateWeightedFlagScore(linkId);
      if (!shouldBeFlagged) {
        await this.postRepo.updateStatus(linkId, 'PENDING');
        logger.info(`Post ${linkId} reverted to PENDING (likes increased)`);
      }
    }

    // Fire-and-forget
    this.pointsClient.awardPoints(userId, 1, 'POST_LIKED', linkId)
      .catch(err => logger.error('Failed to award points:', err));
    this.postRepo.recalculateHotScore(linkId)
      .catch(err => logger.error('Failed to recalculate hot score:', err));

    logger.info(`User ${userId} liked post ${linkId}`);
  }

  async unlikePost(linkId: string, userId: string) {
    const [post, existingLike] = await Promise.all([
      this.postRepo.findById(linkId),
      this.interactionRepo.findLike(linkId, userId),
    ]);

    if (!post) throw new NotFoundError('Post not found');
    if (!existingLike) throw new NotFoundError('You have not liked this post');

    // Delete like + decrement (GREATEST prevents negative)
    await this.interactionRepo.deleteLike(linkId, userId);
    await this.postRepo.decrementLikes(linkId);

    // Check if should become FLAGGED
    const { shouldBeFlagged } = await this.flagRepo.calculateWeightedFlagScore(linkId);
    if (shouldBeFlagged && post.status !== 'FLAGGED') {
      await this.postRepo.updateStatus(linkId, 'FLAGGED');
      logger.info(`Post ${linkId} changed to FLAGGED (likes decreased)`);
    }

    this.postRepo.recalculateHotScore(linkId)
      .catch(err => logger.error('Failed to recalculate hot score:', err));

    logger.info(`User ${userId} unliked post ${linkId}`);
  }

  async hasUserLiked(linkId: string, userId: string): Promise<boolean> {
    const like = await this.interactionRepo.findLike(linkId, userId);
    return !!like;
  }

  // ============= POST FLAGS =============

  async flagPost(linkId: string, userId: string, role: string, rankLevel: number) {
    const [post, existingFlag] = await Promise.all([
      this.postRepo.findById(linkId),
      this.interactionRepo.findFlag(linkId, userId),
    ]);

    if (!post) throw new NotFoundError('Post not found');
    if (existingFlag) throw new ConflictError('You have already flagged this post');

    // Mutually exclusive logic: Remove like if it exists
    const existingLike = await this.interactionRepo.findLike(linkId, userId);
    if (existingLike) {
      await this.interactionRepo.deleteLike(linkId, userId);
      await this.postRepo.decrementLikes(linkId);
      logger.info(`User ${userId} flagged post ${linkId} (removed existing like)`);
    }

    // Create flag
    await this.interactionRepo.createFlag(linkId, userId, role, rankLevel);

    // Check if should become FLAGGED
    const { shouldBeFlagged } = await this.flagRepo.calculateWeightedFlagScore(linkId);
    if (shouldBeFlagged && post.status !== 'FLAGGED') {
      await this.postRepo.updateStatus(linkId, 'FLAGGED');
      logger.info(`Post ${linkId} changed to FLAGGED (flags increased)`);
    }

    // Fire-and-forget
    this.postRepo.recalculateHotScore(linkId)
      .catch(err => logger.error('Failed to recalculate hot score:', err));

    logger.info(`User ${userId} flagged post ${linkId}`);
  }

  async unflagPost(linkId: string, userId: string) {
    const [post, existingFlag] = await Promise.all([
      this.postRepo.findById(linkId),
      this.interactionRepo.findFlag(linkId, userId),
    ]);

    if (!post) throw new NotFoundError('Post not found');
    if (!existingFlag) throw new NotFoundError('You have not flagged this post');

    await this.interactionRepo.deleteFlag(linkId, userId);

    // Revert FLAGGED → PENDING if flags no longer outweigh likes
    if (post.status === 'FLAGGED') {
      const { shouldBeFlagged } = await this.flagRepo.calculateWeightedFlagScore(linkId);
      if (!shouldBeFlagged) {
        await this.postRepo.updateStatus(linkId, 'PENDING');
        logger.info(`Post ${linkId} reverted to PENDING (flags decreased)`);
      }
    }

    this.postRepo.recalculateHotScore(linkId)
      .catch(err => logger.error('Failed to recalculate hot score:', err));

    logger.info(`User ${userId} unflagged post ${linkId}`);
  }

  // ============= COMMENT LIKES =============

  async likeComment(commentId: string, userId: string) {
    const [comment, existingLike] = await Promise.all([
      this.commentRepo.findById(commentId),
      this.interactionRepo.findCommentLike(commentId, userId),
    ]);

    if (!comment) throw new NotFoundError('Comment not found');
    if (existingLike) throw new ConflictError('You have already liked this comment');

    await this.interactionRepo.createCommentLike(commentId, userId);

    this.pointsClient.awardPoints(userId, 1, 'COMMENT_LIKED', commentId)
      .catch(err => logger.error('Failed to award points:', err));

    logger.info(`User ${userId} liked comment ${commentId}`);
  }

  async unlikeComment(commentId: string, userId: string) {
    const [comment, existingLike] = await Promise.all([
      this.commentRepo.findById(commentId),
      this.interactionRepo.findCommentLike(commentId, userId),
    ]);

    if (!comment) throw new NotFoundError('Comment not found');
    if (!existingLike) throw new NotFoundError('You have not liked this comment');

    await this.interactionRepo.deleteCommentLike(commentId, userId);
    logger.info(`User ${userId} unliked comment ${commentId}`);
  }

  // ============= SAVES =============

  async savePost(linkId: string, userId: string) {
    const [post, existing] = await Promise.all([
      this.postRepo.findById(linkId),
      this.interactionRepo.findSave(linkId, userId),
    ]);

    if (!post) throw new NotFoundError('Post not found');
    if (existing) throw new ConflictError('You have already saved this post');

    await this.interactionRepo.createSave(linkId, userId);
    logger.info(`User ${userId} saved post ${linkId}`);
  }

  async unsavePost(linkId: string, userId: string) {
    const [post, existing] = await Promise.all([
      this.postRepo.findById(linkId),
      this.interactionRepo.findSave(linkId, userId),
    ]);

    if (!post) throw new NotFoundError('Post not found');
    if (!existing) throw new NotFoundError('You have not saved this post');

    await this.interactionRepo.deleteSave(linkId, userId);
    logger.info(`User ${userId} unsaved post ${linkId}`);
  }

  async getSavedPosts(userId: string, page: number, pageSize: number) {
    return this.interactionRepo.getSavedPostsByUser(userId, page, clampPageSize(pageSize));
  }

  // ============= VIEWS =============

  async trackView(linkId: string, userId: string | null, sessionId?: string) {
    // Validate post — throw so controller returns 404
    const post = await this.postRepo.findById(linkId);
    if (!post) throw new NotFoundError('Post not found');

    // De-duplicate: logged-in users by userId, anonymous by sessionId
    if (userId) {
      const viewedRecently = await this.interactionRepo.hasUserViewedRecently(linkId, userId, 24);
      if (viewedRecently) return;
    }

    try {
      await this.interactionRepo.createView(linkId, userId, undefined, sessionId);
    } catch (err: any) {
      // View persistence failure must not block the response
      logger.error('Failed to persist view:', err);
      return;
    }

    this.postRepo.recalculateHotScore(linkId)
      .catch(err => logger.error('Failed to recalculate hot score:', err));

    logger.debug(`View tracked for post ${linkId}`);
  }

  // ============= SHARES =============

  async sharePost(linkId: string, userId: string, platform?: SharePlatform) {
    const post = await this.postRepo.findById(linkId);
    if (!post) throw new NotFoundError('Post not found');

    await this.interactionRepo.createShare(linkId, userId, platform);

    this.pointsClient.awardPoints(userId, 2, 'POST_SHARED', linkId)
      .catch(err => logger.error('Failed to award points:', err));

    logger.info(`User ${userId} shared post ${linkId} on ${platform || 'unknown'}`);
  }
}