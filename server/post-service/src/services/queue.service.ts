import { QueueRepository } from '../repositories/queue.repository.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class QueueService {
  constructor(private queueRepo: QueueRepository) {}

  /**
   * Add a post to the moderation queue (called after post creation).
   */
  async addToQueue(postId: string, userId: string, priority: number = 0) {
    const existing = await this.queueRepo.findByPostId(postId);
    if (existing) {
      logger.warn(`Post ${postId} already in moderation queue`);
      return existing;
    }

    const item = await this.queueRepo.addToQueue(postId, userId, priority);
    logger.info(`Post ${postId} added to moderation queue`);
    return item;
  }

  /**
   * Get paginated list of pending queue items for fact-checkers.
   */
  async getQueue(page: number, pageSize: number) {
    return this.queueRepo.getPendingQueue(page, pageSize);
  }

  /**
   * Get a single queue item by ID.
   */
  async getQueueItem(id: string) {
    const item = await this.queueRepo.findById(id);
    if (!item) {
      throw new NotFoundError('Queue item not found');
    }
    return item;
  }

  /**
   * Get queue item by post ID.
   */
  async getQueueItemByPost(postId: string) {
    const item = await this.queueRepo.findByPostId(postId);
    if (!item) {
      throw new NotFoundError('Post not found in moderation queue');
    }
    return item;
  }

  /**
   * Mark a queue item as completed (after verdict is submitted).
   */
  async markCompleted(postId: string) {
    const item = await this.queueRepo.findByPostId(postId);
    if (!item) {
      logger.warn(`Cannot complete non-existent queue item for post ${postId}`);
      return;
    }
    await this.queueRepo.updateStatus(item.id, 'COMPLETED');
    logger.info(`Queue item for post ${postId} marked as completed`);
  }

  /**
   * Mark a queue item back to PENDING (after claim expires or is abandoned).
   */
  async markPending(queueId: string) {
    await this.queueRepo.updateStatus(queueId, 'PENDING');
  }

  /**
   * Mark a queue item as CLAIMED.
   */
  async markClaimed(queueId: string) {
    await this.queueRepo.updateStatus(queueId, 'CLAIMED');
  }

  /**
   * Remove a post from the queue (e.g., when the post is deleted).
   */
  async removeFromQueue(postId: string) {
    await this.queueRepo.removeByPostId(postId);
    logger.info(`Post ${postId} removed from moderation queue`);
  }
}
