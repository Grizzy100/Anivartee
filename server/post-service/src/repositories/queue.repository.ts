//server\post-service\src\repositories\queue.repository.ts
import prisma from '../utils/prisma.js';
import { DatabaseError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import type { QueueStatus } from '../generated/prisma/index.js';

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
        include: { claim: true }
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
        include: { claim: true }
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
          orderBy: [{ priority: 'desc' }, { addedAt: 'asc' }],
          skip,
          take: pageSize
        }),
        prisma.moderationQueue.count({ where: { status: 'PENDING' } })
      ]);

      return { items, total, page, pageSize };
    } catch (error) {
      logger.error('Database error in queue.getPendingQueue:', error);
      throw new DatabaseError('Failed to fetch moderation queue');
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
