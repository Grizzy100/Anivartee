import { ClaimRepository } from '../repositories/claim.repository.js';
import { QueueService } from './queue.service.js';
import { PostRepository } from '../repositories/post.repository.js';
import { PointsClient } from './clients/points.client.js';
import { NotFoundError, ConflictError, RateLimitError, AuthorizationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

// Post statuses that indicate the post is no longer in the reviewable PENDING state
const TERMINAL_STATUSES = new Set(['VALIDATED', 'DEBUNKED', 'FLAGGED']);

export class ClaimService {
  constructor(
    private claimRepo: ClaimRepository,
    private queueService: QueueService,
    private pointsClient: PointsClient,
    private postRepo: PostRepository  // needed for cases 6 & 7
  ) { }

  /**
   * A fact-checker claims a post for review.
   * Enforces: post must be in queue & PENDING, no existing active claim,
   * checker cannot claim their own post, and daily claim limit based on rank.
   */
  async claimPost(postId: string, factCheckerId: string) {
    // 1. Verify the post is in the queue and is PENDING
    const queueItem = await this.queueService.getQueueItemByPost(postId);

    if (queueItem.status !== 'PENDING') {
      throw new ConflictError('This post is already claimed or completed');
    }

    // Case 1: Prevent a fact-checker from claiming their own post
    if (queueItem.userId === factCheckerId) {
      throw new AuthorizationError('You cannot claim your own post for review');
    }

    // Case 3: Guard against inconsistent state — post itself may already be resolved
    const postStatus = (queueItem as any).post?.status as string | undefined;
    if (postStatus && TERMINAL_STATUSES.has(postStatus)) {
      throw new ConflictError(`This post has already been ${postStatus.toLowerCase()} and cannot be claimed`);
    }

    // 2. Check for existing active claim on this post
    // NOTE: findActiveClaimByPost now filters out expired claims (case 2 — fixed in repo)
    const existingClaim = await this.claimRepo.findActiveClaimByPost(postId);
    if (existingClaim) {
      throw new ConflictError('This post is already claimed by another fact-checker');
    }

    // 3. Enforce daily claim limit based on rank
    // NOTE: getClaimsToday now only counts ACTIVE/COMPLETED (case 4 — fixed in repo)
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

    // Case 7: Update the post's own Link.status to UNDER_REVIEW
    await this.postRepo.updateStatus(postId, 'UNDER_REVIEW');

    logger.info(`Post ${postId} claimed by fact-checker ${factCheckerId}, expires at ${claim.expiresAt.toISOString()}`);
    return claim;
  }

  /**
   * A fact-checker abandons their claim on a post.
   * Resets both the queue item and the post's own status back to PENDING.
   */
  async abandonClaim(postId: string, factCheckerId: string) {
    const claim = await this.claimRepo.findActiveClaim(postId, factCheckerId);
    if (!claim) {
      throw new NotFoundError('No active claim found for this post');
    }

    await this.claimRepo.updateStatus(claim.id, 'ABANDONED');
    await this.queueService.markPending(claim.queueId);
    // Reset post status back to PENDING so it re-appears correctly
    await this.postRepo.updateStatus(postId, 'PENDING');

    logger.info(`Claim on post ${postId} abandoned by ${factCheckerId}`);
    return { message: 'Claim abandoned' };
  }

  /**
   * Get the active claim for a post (if any).
   * Returns null if there is no active non-expired claim.
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
   * Expire all stale claims (called by cron job every 60s).
   * Resets both queue item AND post Link.status back to PENDING.
   * Returns the number of expired claims.
   */
  async expireStale(): Promise<number> {
    const expired = await this.claimRepo.findExpiredClaims();
    if (expired.length === 0) return 0;

    for (const claim of expired) {
      await this.claimRepo.updateStatus(claim.id, 'EXPIRED');
      // Return the queue item to PENDING so others can claim it
      await this.queueService.markPending(claim.queueId);
      // Case 6: Also reset the post's own status so the feed reflects it correctly
      await this.postRepo.updateStatus(claim.postId, 'PENDING');
    }

    logger.info(`Expired ${expired.length} stale claim(s)`);
    return expired.length;
  }
}
