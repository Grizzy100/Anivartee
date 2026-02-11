//server\post-service\src\repositories\feed.repository.ts
import prisma from '../utils/prisma.js';
import { logger } from '../utils/logger.js';
import { DatabaseError } from '../utils/errors.js';

export class FeedRepository {
  async getHomeFeed(userId: string | null, page: number, pageSize: number) {
    try {
      const skip = (page - 1) * pageSize;

      const [posts, total] = await Promise.all([
        prisma.link.findMany({
          where: {
            status: {
              in: ['VALIDATED', 'PENDING']
            }
          },
          include: {
            sources: true,
            factChecks: {
              orderBy: { createdAt: 'desc' },
              take: 1
            },
            _count: {
              select: {
                likes: true,
                comments: true,
                views: true,
                flags: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize
        }),
        prisma.link.count({
          where: {
            status: {
              in: ['VALIDATED', 'PENDING']
            }
          }
        })
      ]);

      return {
        posts,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      };
    } catch (error: any) {
      logger.error('Database error in feed.getHomeFeed:', error);
      throw new DatabaseError('Failed to fetch home feed');
    }
  }

  async getTrendingFeed(page: number, pageSize: number) {
    try {
      const skip = (page - 1) * pageSize;
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const [posts, total] = await Promise.all([
        prisma.link.findMany({
          where: {
            status: 'VALIDATED',
            createdAt: {
              gte: sevenDaysAgo
            }
          },
          include: {
            sources: true,
            factChecks: {
              orderBy: { createdAt: 'desc' },
              take: 1
            },
            _count: {
              select: {
                likes: true,
                comments: true,
                views: true,
                flags: true
              }
            }
          },
          orderBy: [
            { totalLikes: 'desc' },
            { createdAt: 'desc' }
          ],
          skip,
          take: pageSize
        }),
        prisma.link.count({
          where: {
            status: 'VALIDATED',
            createdAt: {
              gte: sevenDaysAgo
            }
          }
        })
      ]);

      return {
        posts,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      };
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