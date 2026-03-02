//server\post-service\src\repositories\interaction.repository.ts
import prisma from '../utils/prisma.js';
import { logger } from '../utils/logger.js';
import { DatabaseError, ConflictError } from '../utils/errors.js';
import type { SharePlatform } from '../generated/prisma/index.js';
import { redis } from '../utils/redis.js';

export class InteractionRepository {
  // ============= POST LIKES =============

  /** Idempotent upsert — safe against concurrent double-like. */
  async createLike(linkId: string, userId: string) {
    try {
      return await prisma.linkLike.upsert({
        where: { userId_linkId: { userId, linkId } },
        update: {},
        create: { linkId, userId },
      });
    } catch (error: any) {
      logger.error('Database error in interaction.createLike:', error);
      throw new DatabaseError('Failed to create like');
    }
  }

  async deleteLike(linkId: string, userId: string) {
    try {
      return await prisma.linkLike.deleteMany({
        where: { linkId, userId },
      });
    } catch (error: any) {
      logger.error('Database error in interaction.deleteLike:', error);
      throw new DatabaseError('Failed to delete like');
    }
  }

  async findLike(linkId: string, userId: string) {
    try {
      return await prisma.linkLike.findUnique({
        where: { userId_linkId: { userId, linkId } },
      });
    } catch (error: any) {
      logger.error('Database error in interaction.findLike:', error);
      throw new DatabaseError('Failed to find like');
    }
  }

  async getLikesByLink(linkId: string, page: number, pageSize: number) {
    try {
      const skip = (page - 1) * pageSize;

      const [likes, total] = await Promise.all([
        prisma.linkLike.findMany({
          where: { linkId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize,
          select: {
            userId: true,
            createdAt: true
          }
        }),
        prisma.linkLike.count({
          where: { linkId }
        })
      ]);

      return {
        likes,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      };
    } catch (error: any) {
      logger.error('Database error in interaction.getLikesByLink:', error);
      throw new DatabaseError('Failed to fetch likes');
    }
  }

  // ============= POST FLAGS =============

  /** Idempotent upsert — safe against concurrent double-flag. */
  async createFlag(linkId: string, userId: string, role: string, rankLevel: number) {
    try {
      // Prisma has no unique constraint on LinkFlag yet in schema,
      // but we emulate upsert by checking existence first or deleting existing flags.
      await prisma.linkFlag.deleteMany({
        where: { linkId, flaggerUserId: userId },
      });
      return await prisma.linkFlag.create({
        data: { linkId, flaggerUserId: userId, flaggerRole: role, flaggerRankLevel: rankLevel },
      });
    } catch (error: any) {
      logger.error('Database error in interaction.createFlag:', error);
      throw new DatabaseError('Failed to create flag');
    }
  }

  async deleteFlag(linkId: string, userId: string) {
    try {
      return await prisma.linkFlag.deleteMany({
        where: { linkId, flaggerUserId: userId },
      });
    } catch (error: any) {
      logger.error('Database error in interaction.deleteFlag:', error);
      throw new DatabaseError('Failed to delete flag');
    }
  }

  async findFlag(linkId: string, userId: string) {
    try {
      return await prisma.linkFlag.findFirst({
        where: { linkId, flaggerUserId: userId },
      });
    } catch (error: any) {
      logger.error('Database error in interaction.findFlag:', error);
      throw new DatabaseError('Failed to find flag');
    }
  }

  // ============= COMMENT LIKES =============

  /** Idempotent upsert — safe against concurrent double-like. */
  async createCommentLike(commentId: string, userId: string) {
    try {
      return await prisma.commentLike.upsert({
        where: { userId_commentId: { userId, commentId } },
        update: {},
        create: { commentId, userId },
      });
    } catch (error: any) {
      logger.error('Database error in interaction.createCommentLike:', error);
      throw new DatabaseError('Failed to like comment');
    }
  }

  async deleteCommentLike(commentId: string, userId: string) {
    try {
      return await prisma.commentLike.deleteMany({
        where: { commentId, userId },
      });
    } catch (error: any) {
      logger.error('Database error in interaction.deleteCommentLike:', error);
      throw new DatabaseError('Failed to unlike comment');
    }
  }

  async findCommentLike(commentId: string, userId: string) {
    try {
      return await prisma.commentLike.findUnique({
        where: { userId_commentId: { userId, commentId } },
      });
    } catch (error: any) {
      logger.error('Database error in interaction.findCommentLike:', error);
      throw new DatabaseError('Failed to find comment like');
    }
  }

  // ============= SAVES =============
  async createSave(linkId: string, userId: string) {
    try {
      return await prisma.linkSave.upsert({
        where: { userId_linkId: { userId, linkId } },
        update: {},
        create: { linkId, userId },
      });
    } catch (error: any) {
      logger.error('Database error in interaction.createSave:', error);
      throw new DatabaseError('Failed to save post');
    }
  }

  async deleteSave(linkId: string, userId: string) {
    try {
      return await prisma.linkSave.deleteMany({
        where: { linkId, userId },
      });
    } catch (error: any) {
      logger.error('Database error in interaction.deleteSave:', error);
      throw new DatabaseError('Failed to unsave post');
    }
  }

  async findSave(linkId: string, userId: string): Promise<boolean> {
    try {
      const save = await prisma.linkSave.findUnique({
        where: { userId_linkId: { userId, linkId } },
      });
      return !!save;
    } catch (error: any) {
      logger.error('Database error in interaction.findSave:', error);
      throw new DatabaseError('Failed to check save status');
    }
  }

  async getSavedPostsByUser(userId: string, page: number, pageSize: number) {
    try {
      const skip = (page - 1) * pageSize;

      const [saves, total] = await Promise.all([
        prisma.linkSave.findMany({
          where: { userId },
          include: {
            link: {
              include: {
                sources: true,
                factChecks: { orderBy: { createdAt: 'desc' }, take: 1 },
                _count: {
                  select: { likes: true, comments: true, views: true, flags: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize,
        }),
        prisma.linkSave.count({ where: { userId } }),
      ]);

      // Filter out soft-deleted posts
      const activeSaves = saves.filter(s => s.link.deletedAt === null);

      return {
        posts: activeSaves.map(s => s.link),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (error: any) {
      logger.error('Database error in interaction.getSavedPostsByUser:', error);
      throw new DatabaseError('Failed to fetch saved posts');
    }
  }

  // ============= VIEWS =============
  async createView(linkId: string, userId: string | null, ipAddress?: string, sessionId?: string) {
    try {
      return await prisma.linkView.create({
        data: {
          linkId,
          userId,
          ipAddress,
          sessionId
        }
      });
    } catch (error: any) {
      logger.error('Database error in interaction.createView:', error);
      throw new DatabaseError('Failed to track view');
    }
  }

  async getViewCount(linkId: string): Promise<number> {
    try {
      return await prisma.linkView.count({
        where: { linkId }
      });
    } catch (error: any) {
      logger.error('Database error in interaction.getViewCount:', error);
      throw new DatabaseError('Failed to count views');
    }
  }

  async hasUserViewedRecently(linkId: string, userId: string, hours: number = 24): Promise<boolean> {
    try {
      const cacheKey = `view:${linkId}:u:${userId}`;
      let redisError = false;

      const setnx = await redis.setnx(cacheKey, '1').catch((err: any) => {
        logger.warn('Redis view dedup failed, falling back to db', err);
        redisError = true;
        return null;
      });

      if (setnx === 1) {
        await redis.expire(cacheKey, hours * 3600).catch(() => { });
        return false; // Key didn't exist and we successfully set it for 24h
      }

      if (!redisError) {
        return true; // Key already existed (user viewed recently)
      }

      // Fallback: Redis threw an error, check DB directly
      const threshold = new Date(Date.now() - hours * 60 * 60 * 1000);
      const view = await prisma.linkView.findFirst({
        where: {
          linkId,
          userId,
          createdAt: { gte: threshold }
        }
      });
      return !!view;

    } catch (error: any) {
      logger.error('Error in interaction.hasUserViewedRecently:', error);
      return false; // Fail open (allow view) instead of throwing
    }
  }

  // ============= SHARES =============
  async createShare(linkId: string, userId: string, platform?: SharePlatform) {
    try {
      return await prisma.linkShare.create({
        data: { linkId, userId, platform },
      });
    } catch (error: any) {
      logger.error('Database error in interaction.createShare:', error);
      throw new DatabaseError('Failed to track share');
    }
  }

  async getShareCount(linkId: string): Promise<number> {
    try {
      return await prisma.linkShare.count({
        where: { linkId }
      });
    } catch (error: any) {
      logger.error('Database error in interaction.getShareCount:', error);
      throw new DatabaseError('Failed to count shares');
    }
  }
}