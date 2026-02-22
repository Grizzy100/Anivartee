//server\post-service\src\repositories\feed.repository.ts
import prisma from '../utils/prisma.js';
import { logger } from '../utils/logger.js';
import { DatabaseError } from '../utils/errors.js';

import { LinkStatus } from '../generated/prisma/index.js';

/** Reusable filter to exclude soft-deleted posts. */
const NOT_DELETED = { deletedAt: null } as const;

// Shared Prisma include block for feed queries
function feedInclude(userId: string | null) {
  return {
    sources: true,
    factChecks: {
      orderBy: { createdAt: 'desc' as const },
      take: 1,
    },
    _count: {
      select: {
        likes: true,
        comments: true,
        views: true,
        flags: true,
        shares: true,
      },
    },
    // Per-user interaction state (empty array when no match)
    ...(userId
      ? {
        likes: {
          where: { userId },
          select: { id: true },
          take: 1,
        },
        saves: {
          where: { userId },
          select: { id: true },
          take: 1,
        },
      }
      : {}),
  };
}

export class FeedRepository {
  async getHomeFeed(userId: string | null, page: number, pageSize: number) {
    try {
      const skip = (page - 1) * pageSize;
      const where = { status: { in: [LinkStatus.VALIDATED, LinkStatus.PENDING, LinkStatus.UNDER_REVIEW] }, ...NOT_DELETED };

      const [posts, total] = await Promise.all([
        prisma.link.findMany({
          where,
          include: feedInclude(userId),
          orderBy: { hotScore: 'desc' },
          skip,
          take: pageSize,
        }),
        prisma.link.count({ where }),
      ]);

      return { posts, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    } catch (error: any) {
      logger.error('Database error in feed.getHomeFeed:', error);
      throw new DatabaseError('Failed to fetch home feed');
    }
  }

  async getTrendingFeed(userId: string | null, page: number, pageSize: number) {
    try {
      const skip = (page - 1) * pageSize;
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const where = {
        status: 'VALIDATED' as const,
        createdAt: { gte: sevenDaysAgo },
        ...NOT_DELETED,
      };

      const [posts, total] = await Promise.all([
        prisma.link.findMany({
          where,
          include: feedInclude(userId),
          orderBy: { hotScore: 'desc' },
          skip,
          take: pageSize,
        }),
        prisma.link.count({ where }),
      ]);

      return { posts, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    } catch (error: any) {
      logger.error('Database error in feed.getTrendingFeed:', error);
      throw new DatabaseError('Failed to fetch trending feed');
    }
  }

  async getControversialFeed(page: number, pageSize: number) {
    try {
      const skip = (page - 1) * pageSize;

      // Get posts with both high likes and high flags
      const posts = await prisma.$queryRaw<any[]>`
        SELECT l.*, 
               COUNT(*) OVER() as total,
               COUNT(lf.id) as flag_count
        FROM posts.links l
        LEFT JOIN posts.link_flags lf ON l.id = lf.link_id
        WHERE l.status IN ('VALIDATED', 'FLAGGED')
          AND l."deletedAt" IS NULL
          AND l.total_likes > 5
        GROUP BY l.id
        HAVING COUNT(lf.id) > 2
        ORDER BY (COUNT(lf.id) * l.total_likes) DESC
        LIMIT ${pageSize} OFFSET ${skip}
      `;

      const total = posts[0]?.total || 0;

      return {
        posts,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      };
    } catch (error: any) {
      logger.error('Database error in feed.getControversialFeed:', error);
      throw new DatabaseError('Failed to fetch controversial feed');
    }
  }
}