import { ClaimRepository } from '../repositories/claim.repository.js';
import { QueueService } from './queue.service.js';
import { PointsClient } from './clients/points.client.js';
import { NotFoundError, ConflictError, RateLimitError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class ClaimService {
  constructor(
    private claimRepo: ClaimRepository,
    private queueService: QueueService,
    private pointsClient: PointsClient
  ) {}

  /**
   * A fact-checker claims a post for review.
   * Enforces: post must be in queue & PENDING, no existing active claim,
   * and daily claim limit based on checker rank.
   */
  async claimPost(postId: string, factCheckerId: string) {
    // 1. Verify the post is in the queue and is PENDING
    const queueItem = await this.queueService.getQueueItemByPost(postId);

    if (queueItem.status !== 'PENDING') {
      throw new ConflictError('This post is already claimed or completed');
    }

    // 2. Check for existing active claim on this post
    const existingClaim = await this.claimRepo.findActiveClaimByPost(postId);
    if (existingClaim) {
      throw new ConflictError('This post is already claimed by another fact-checker');
    }

    // 3. Enforce daily claim limit based on rank
    const rankData = await this.pointsClient.getUserRank(factCheckerId);
    const claimsToday = await this.claimRepo.getClaimsToday(factCheckerId);

    if (claimsToday >= rankData.limits.postsPerDay) {
      throw new RateLimitError(
        `Daily claim limit (${rankData.limits.postsPerDay}) reached. Increase your rank to claim more.`
      );
    }

    // 4. Create the claim (30-min timer set in repository)
    const claim = await this.claimRepo.create(queueItem.id, postId, factCheckerId);

    // 5. Update queue status to CLAIMED
    await this.queueService.markClaimed(queueItem.id);

    logger.info(`Post ${postId} claimed by fact-checker ${factCheckerId}, expires at ${claim.expiresAt.toISOString()}`);
    return claim;
  }

  /**
   * A fact-checker abandons their claim on a post.
   */
  async abandonClaim(postId: string, factCheckerId: string) {
    const claim = await this.claimRepo.findActiveClaim(postId, factCheckerId);
    if (!claim) {
      throw new NotFoundError('No active claim found for this post');
    }

    await this.claimRepo.updateStatus(claim.id, 'ABANDONED');
    await this.queueService.markPending(claim.queueId);

    logger.info(`Claim on post ${postId} abandoned by ${factCheckerId}`);
    return { message: 'Claim abandoned' };
  }

  /**
   * Get the active claim for a post (if any).
   */
  async getActiveClaim(postId: string) {
    return this.claimRepo.findActiveClaimByPost(postId);
  }

  /**
   * Mark a claim as COMPLETED (called after verdict is submitted).
   */
  async completeClaim(postId: string, factCheckerId: string) {
    const claim = await this.claimRepo.findActiveClaim(postId, factCheckerId);
    if (!claim) {
      throw new NotFoundError('No active claim found');
    }
    await this.claimRepo.updateStatus(claim.id, 'COMPLETED');
    logger.info(`Claim on post ${postId} completed by ${factCheckerId}`);
  }

  /**
   * Expire all stale claims (called by cron job).
   * Returns the number of expired claims.
   */
  async expireStale(): Promise<number> {
    const expired = await this.claimRepo.findExpiredClaims();
    if (expired.length === 0) return 0;

    for (const claim of expired) {
      await this.claimRepo.updateStatus(claim.id, 'EXPIRED');
      // Return the queue item to PENDING so others can claim it
      await this.queueService.markPending(claim.queueId);
    }

    logger.info(`Expired ${expired.length} stale claim(s)`);
    return expired.length;
  }
}
