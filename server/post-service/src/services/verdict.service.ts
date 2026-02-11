import { ClaimService } from './claim.service.js';
import { QueueService } from './queue.service.js';
import { DraftRepository } from '../repositories/draft.repository.js';
import { FactCheckRepository } from '../repositories/factCheck.repository.js';
import { PostRepository } from '../repositories/post.repository.js';
import { PointsClient } from './clients/points.client.js';
import { ActivityService } from './activity.service.js';
import { SubmitVerdictInput, SaveDraftInput } from '../validators/verdict.schema.js';
import { NotFoundError, ConflictError, AuthorizationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class VerdictService {
  constructor(
    private claimService: ClaimService,
    private queueService: QueueService,
    private draftRepo: DraftRepository,
    private factCheckRepo: FactCheckRepository,
    private postRepo: PostRepository,
    private pointsClient: PointsClient,
    private activityService: ActivityService
  ) {}

  /**
   * Submit a verdict for a claimed post.
   * Validates that the checker has an active claim, creates the fact-check,
   * updates the post status, awards points, and cleans up the queue + draft.
   */
  async submitVerdict(postId: string, factCheckerId: string, data: SubmitVerdictInput) {
    // 1. Verify that this checker has the active claim
    const activeClaim = await this.claimService.getActiveClaim(postId);
    if (!activeClaim || activeClaim.factCheckerId !== factCheckerId) {
      throw new AuthorizationError('You do not have an active claim on this post');
    }

    // 2. Check for duplicate fact-check
    const existingCheck = await this.factCheckRepo.findByPostAndChecker(postId, factCheckerId);
    if (existingCheck) {
      throw new ConflictError('You have already submitted a verdict for this post');
    }

    // 3. Verify post exists
    const post = await this.postRepo.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    // 4. Create the fact-check record
    const factCheck = await this.factCheckRepo.create(postId, factCheckerId, {
      verdict: data.verdict as 'VALIDATED' | 'DEBUNKED',
      header: data.header,
      description: data.description,
      referenceUrls: data.referenceUrls
    });

    // 5. Update post status based on verdict
    const newStatus = data.verdict === 'VALIDATED' ? 'VALIDATED' : 'DEBUNKED';
    await this.postRepo.updateStatus(postId, newStatus);

    // 6. Complete the claim and queue item
    await this.claimService.completeClaim(postId, factCheckerId);
    await this.queueService.markCompleted(postId);

    // 7. Delete any saved draft (cleanup)
    this.draftRepo.deleteByPostAndChecker(postId, factCheckerId)
      .catch(err => logger.error('Failed to delete draft after verdict:', err));

    // 8. Award points (async, fire-and-forget)
    const rankData = await this.pointsClient.getUserRank(factCheckerId);
    this.pointsClient.awardPoints(
      factCheckerId,
      rankData.limits.postPoints,
      'FACT_CHECK_COMPLETED',
      factCheck.id
    ).catch(err => logger.error('Failed to award points:', err));

    // 9. Record activity (async, fire-and-forget)
    this.activityService.recordActivity(factCheckerId, 'FACT_CHECK_COMPLETED');

    logger.info(`Verdict submitted: ${factCheck.id} for post ${postId} — ${data.verdict}`);
    return factCheck;
  }

  /**
   * Auto-save a draft while fact-checking.
   */
  async saveDraft(postId: string, factCheckerId: string, data: SaveDraftInput) {
    // Verify checker has active claim
    const activeClaim = await this.claimService.getActiveClaim(postId);
    if (!activeClaim || activeClaim.factCheckerId !== factCheckerId) {
      throw new AuthorizationError('You do not have an active claim on this post');
    }

    const draft = await this.draftRepo.upsert(postId, factCheckerId, data);
    logger.debug(`Draft saved for post ${postId} by ${factCheckerId}`);
    return draft;
  }

  /**
   * Get the current draft for a post/checker pair.
   */
  async getDraft(postId: string, factCheckerId: string) {
    return this.draftRepo.findByPostAndChecker(postId, factCheckerId);
  }
}
