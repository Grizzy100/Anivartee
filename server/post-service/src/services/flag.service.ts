//server\post-service\src\services\flag.service.ts
import { FlagRepository } from '../repositories/flag.repository.js';
import { PostRepository } from '../repositories/post.repository.js';
import { PointsClient } from './clients/points.client.js';
import { NotFoundError, ConflictError, RateLimitError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class FlagService {
  constructor(
    private flagRepo: FlagRepository,
    private postRepo: PostRepository,
    private pointsClient: PointsClient
  ) {}

  async flagPost(linkId: string, userId: string) {
    try {
      // 1. Check if post exists
      const post = await this.postRepo.findById(linkId);
      if (!post) {
        throw new NotFoundError('Post not found');
      }

      // 2. Get user's rank
      const rankData = await this.pointsClient.getUserRank(userId);

      // 3. Check daily flag limit
      const todayFlagCount = await this.flagRepo.getFlagCountToday(userId);
      if (todayFlagCount >= rankData.limits.flagsPerDay) {
        throw new RateLimitError(
          `Daily flag limit (${rankData.limits.flagsPerDay}) reached`
        );
      }

      // 4. Check if already flagged
      const existingFlag = await this.flagRepo.findFlag(linkId, userId);
      if (existingFlag) {
        throw new ConflictError('You have already flagged this post');
      }

      // 5. Create flag
      await this.flagRepo.create(
        linkId,
        userId,
        rankData.role,
        rankData.rankLevel
      );

      // 6. Calculate weighted flag score and check if should be FLAGGED
      const { shouldBeFlagged, weightedScore } = 
        await this.flagRepo.calculateWeightedFlagScore(linkId);

      // 7. Update post status if threshold exceeded
      if (shouldBeFlagged && post.status !== 'FLAGGED') {
        await this.postRepo.updateStatus(linkId, 'FLAGGED');
        logger.info(`Post ${linkId} status changed to FLAGGED (score: ${weightedScore})`);
      }

      // 8. Award points for flagging (async, don't wait)
      this.pointsClient.awardPoints(
        userId,
        1,
        'POST_FLAGGED',
        linkId
      ).catch(err => logger.error('Failed to award flag points:', err));

      logger.info(`User ${userId} flagged post ${linkId}`);
    } catch (error: any) {
      logger.error('Error in flagPost service:', error);
      throw error;
    }
  }

  async unflagPost(linkId: string, userId: string) {
    try {
      // 1. Check if post exists
      const post = await this.postRepo.findById(linkId);
      if (!post) {
        throw new NotFoundError('Post not found');
      }

      // 2. Check if flag exists
      const existingFlag = await this.flagRepo.findFlag(linkId, userId);
      if (!existingFlag) {
        throw new NotFoundError('You have not flagged this post');
      }

      // 3. Delete flag
      await this.flagRepo.deleteFlag(linkId, userId);

      // 4. Recalculate weighted score
      const { shouldBeFlagged, weightedScore } = 
        await this.flagRepo.calculateWeightedFlagScore(linkId);

      // 5. Update post status if no longer exceeds threshold
      if (!shouldBeFlagged && post.status === 'FLAGGED') {
        await this.postRepo.updateStatus(linkId, 'PENDING');
        logger.info(`Post ${linkId} status reverted to PENDING (score: ${weightedScore})`);
      }

      logger.info(`User ${userId} unflagged post ${linkId}`);
    } catch (error: any) {
      logger.error('Error in unflagPost service:', error);
      throw error;
    }
  }

  async getFlagScore(linkId: string) {
    try {
      return await this.flagRepo.calculateWeightedFlagScore(linkId);
    } catch (error: any) {
      logger.error('Error in getFlagScore service:', error);
      throw error;
    }
  }
}