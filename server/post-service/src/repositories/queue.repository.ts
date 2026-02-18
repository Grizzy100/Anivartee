//server\post-service\src\repositories\queue.repository.ts
import prisma from '../utils/prisma.js';
import { DatabaseError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import type { QueueStatus } from '../generated/prisma/index.js';

/** Shared include block — attaches the full post (with sources + counts) and claim. */
const queueInclude = {
  claim: true,
  post: {
    include: {
      sources: true,
      _count: {
        select: {
          likes: true,
          comments: true,
          views: true,
          flags: true,
          shares: true,
        },
      },
    },
  },
} as const;

export class QueueRepository {
  async addToQueue(postId: string, userId: string, priority: number = 0) {
    try {
      return await prisma.moderationQueue.create({
        data: { postId, userId, priority }
      });
    } catch (error) {
      logger.error('Database error in queue.addToQueue:', error);
      throw new DatabaseError('Failed to add post to moderation queue');
    }
  }

  async findByPostId(postId: string) {
    try {
      return await prisma.moderationQueue.findUnique({
        where: { postId },
        include: queueInclude,
      });
    } catch (error) {
      logger.error('Database error in queue.findByPostId:', error);
      throw new DatabaseError('Failed to find queue item');
    }
  }

  async findById(id: string) {
    try {
      return await prisma.moderationQueue.findUnique({
        where: { id },
        include: queueInclude,
      });
    } catch (error) {
      logger.error('Database error in queue.findById:', error);
      throw new DatabaseError('Failed to find queue item');
    }
  }

  async getPendingQueue(page: number, pageSize: number) {
    try {
      const skip = (page - 1) * pageSize;

      const [items, total] = await Promise.all([
        prisma.moderationQueue.findMany({
          where: { status: 'PENDING' },
          include: queueInclude,
          orderBy: [{ priority: 'desc' }, { addedAt: 'asc' }],
          skip,
          take: pageSize,
        }),
        prisma.moderationQueue.count({ where: { status: 'PENDING' } }),
      ]);

      return { items, total, page, pageSize };
    } catch (error) {
      logger.error('Database error in queue.getPendingQueue:', error);
      throw new DatabaseError('Failed to fetch moderation queue');
    }
  }

  /**
   * Get items claimed by a specific fact-checker (status = CLAIMED,
   * claim is ACTIVE and belongs to the given checker).
   */
  async getClaimedByFactChecker(factCheckerId: string, page: number, pageSize: number) {
    try {
      const skip = (page - 1) * pageSize;
      const where = {
        status: 'CLAIMED' as const,
        claim: { factCheckerId, status: 'ACTIVE' as const },
      };

      const [items, total] = await Promise.all([
        prisma.moderationQueue.findMany({
          where,
          include: queueInclude,
          orderBy: { claim: { claimedAt: 'desc' } },
          skip,
          take: pageSize,
        }),
        prisma.moderationQueue.count({ where }),
      ]);

      return { items, total, page, pageSize };
    } catch (error) {
      logger.error('Database error in queue.getClaimedByFactChecker:', error);
      throw new DatabaseError('Failed to fetch claimed posts');
    }
  }

  async updateStatus(id: string, status: QueueStatus) {
    try {
      return await prisma.moderationQueue.update({
        where: { id },
        data: { status }
      });
    } catch (error) {
      logger.error('Database error in queue.updateStatus:', error);
      throw new DatabaseError('Failed to update queue status');
    }
  }

  async removeByPostId(postId: string) {
    try {
      const item = await prisma.moderationQueue.findUnique({ where: { postId } });
      if (!item) return;

      await prisma.moderationQueue.update({
        where: { postId },
        data: { status: 'REMOVED' }
      });
    } catch (error) {
      logger.error('Database error in queue.removeByPostId:', error);
      throw new DatabaseError('Failed to remove queue item');
    }
  }
}
