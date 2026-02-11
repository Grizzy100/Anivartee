import { ClaimService } from '../services/claim.service.js';
import { ClaimRepository } from '../repositories/claim.repository.js';
import { QueueService } from '../services/queue.service.js';
import { QueueRepository } from '../repositories/queue.repository.js';
import { PointsClient } from '../services/clients/points.client.js';
import { logger } from '../utils/logger.js';

const INTERVAL_MS = 60 * 1000; // Run every 60 seconds

let timer: ReturnType<typeof setInterval> | null = null;

/**
 * Starts the claim-expiry background job.
 * Every 60 seconds, finds claims past their 30-minute timer and expires them,
 * returning their queue items to PENDING so other fact-checkers can pick them up.
 */
export function startClaimExpiryJob(): void {
  if (timer) {
    logger.warn('Claim expiry job is already running');
    return;
  }

  // Build the service graph
  const queueRepo = new QueueRepository();
  const claimRepo = new ClaimRepository();
  const pointsClient = new PointsClient();
  const queueService = new QueueService(queueRepo);
  const claimService = new ClaimService(claimRepo, queueService, pointsClient);

  logger.info('Claim expiry job started (interval: 60s)');

  timer = setInterval(async () => {
    try {
      const count = await claimService.expireStale();
      if (count > 0) {
        logger.info(`Claim expiry job: expired ${count} claim(s)`);
      }
    } catch (error) {
      logger.error('Claim expiry job error:', error);
    }
  }, INTERVAL_MS);
}

/**
 * Stops the claim-expiry background job (for graceful shutdown).
 */
export function stopClaimExpiryJob(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
    logger.info('Claim expiry job stopped');
  }
}
