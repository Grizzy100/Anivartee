//server\post-service\src\repositories\interaction.repository.ts
import prisma from '../utils/prisma.js';
import { logger } from '../utils/logger.js';
import { DatabaseError, ConflictError } from '../utils/errors.js';
import type { SharePlatform } from '../generated/prisma/index.js';

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

      return {
        posts: saves.map(s => s.link),
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
      const threshold = new Date(Date.now() - hours * 60 * 60 * 1000);

      const view = await prisma.linkView.findFirst({
        where: {
          linkId,
          userId,
          createdAt: {
            gte: threshold
          }
        }
      });

      return !!view;
    } catch (error: any) {
      logger.error('Database error in interaction.hasUserViewedRecently:', error);
      throw new DatabaseError('Failed to check view history');
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