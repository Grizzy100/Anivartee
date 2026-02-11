//server\post-service\src\services\factCheck.service.ts
import { FactCheckRepository } from '../repositories/factCheck.repository.js';
import { PostRepository } from '../repositories/post.repository.js';
import { PointsClient } from './clients/points.client.js';
import { ActivityService } from './activity.service.js';
import { CreateFactCheckInput } from '../validators/factCheck.schema.js';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class FactCheckService {
  constructor(
    private factCheckRepo: FactCheckRepository,
    private postRepo: PostRepository,
    private pointsClient: PointsClient,
    private activityService: ActivityService
  ) {}

  async createFactCheck(postId: string, factCheckerId: string, data: CreateFactCheckInput) {
    try {
      // 1. Check if post exists
      const post = await this.postRepo.findById(postId);
      if (!post) {
        throw new NotFoundError('Post not found');
      }

      // 2. Get fact-checker's rank
      const rankData = await this.pointsClient.getUserRank(factCheckerId);

      // 3. Validate rank-based limits
      if (data.header.length > rankData.limits.maxHeaderLength) {
        throw new ValidationError(
          `Header must be ${rankData.limits.maxHeaderLength} characters or less for your rank.`
        );
      }

      if (data.description && data.description.length > rankData.limits.maxDescriptionLength) {
        throw new ValidationError(
          `Description must be ${rankData.limits.maxDescriptionLength} characters or less for your rank.`
        );
      }

      // 4. Check if already fact-checked by this user
      const existingCheck = await this.factCheckRepo.findByPostAndChecker(postId, factCheckerId);
      if (existingCheck) {
        throw new ConflictError('You have already fact-checked this post');
      }

      // 5. Create fact-check
      const factCheck = await this.factCheckRepo.create(postId, factCheckerId, data);

      // 6. Update post status based on verdict
      const newStatus = data.verdict === 'VALIDATED' ? 'VALIDATED' : 'DEBUNKED';
      await this.postRepo.updateStatus(postId, newStatus);

      // 7. Award points (async, don't wait)
      const points = data.verdict === 'VALIDATED' ? rankData.limits.postPoints : rankData.limits.postPoints;
      this.pointsClient.awardPoints(
        factCheckerId,
        points,
        'FACT_CHECK_COMPLETED',
        factCheck.id
      ).catch(err => logger.error('Failed to award points:', err));

      // 8. Record activity (async, don't wait)
      this.activityService.recordActivity(factCheckerId, 'FACT_CHECK_COMPLETED');

      logger.info(`Fact-check created: ${factCheck.id} for post ${postId} with verdict ${data.verdict}`);
      return factCheck;
    } catch (error: any) {
      logger.error('Error in createFactCheck service:', error);
      throw error;
    }
  }

  async getFactChecks(postId: string) {
    try {
      // Validate post exists
      const post = await this.postRepo.findById(postId);
      if (!post) {
        throw new NotFoundError('Post not found');
      }

      return await this.factCheckRepo.getFactChecksByPost(postId);
    } catch (error: any) {
      logger.error('Error in getFactChecks service:', error);
      throw error;
    }
  }
}