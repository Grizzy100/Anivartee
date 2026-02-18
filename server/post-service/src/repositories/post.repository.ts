//server\post-service\src\repositories\post.repository.ts
import prisma from '../utils/prisma.js';
import { CreatePostInput } from '../validators/post.schema.js';
import { logger } from '../utils/logger.js';
import { DatabaseError, NotFoundError } from '../utils/errors.js';
import { computeHotScore } from '../utils/hotScore.js';

export class PostRepository {
  async create(data: CreatePostInput, userId: string) {
    try {
      const { sources, ...postData } = data;

      return await prisma.link.create({
        data: {
          ...postData,
          userId,
          sources: sources && sources.length > 0 ? {
            create: sources.map(url => ({ url }))
          } : undefined
        },
        include: {
          sources: true,
          _count: {
            select: {
              likes: true,
              comments: true,
              views: true,
              flags: true,
              shares: true
            }
          }
        }
      });
    } catch (error: any) {
      logger.error('Database error in post.create:', error);
      throw new DatabaseError('Failed to create post');
    }
  }

  async findById(id: string) {
    try {
      return await prisma.link.findUnique({
        where: { id },
        include: {
          sources: true,
          factChecks: {
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              views: true,
              flags: true,
              shares: true
            }
          }
        }
      });
    } catch (error: any) {
      logger.error('Database error in post.findById:', error);
      throw new DatabaseError('Failed to fetch post');
    }
  }

  async update(id: string, data: Partial<CreatePostInput>) {
    try {
      const { sources, ...postData } = data as any;

      const updateData: any = { ...postData };
      logger.info('Preparing to update post', { id, updateData });

      if (sources && Array.isArray(sources)) {
        updateData.sources = {
          deleteMany: {}, // remove existing sources and replace with provided list
          create: sources.map((url: string) => ({ url }))
        };
      }

      const result = await prisma.link.update({
        where: { id },
        data: updateData,
        include: {
          sources: true
        }
      });

      logger.info('Prisma update result:', { id, result });

      return result;
    } catch (error: any) {
      logger.error('Database error in post.update:', error);
      throw new DatabaseError('Failed to update post');
    }
  }

  async delete(id: string) {
    try {
      return await prisma.link.delete({
        where: { id }
      });
    } catch (error: any) {
      logger.error('Database error in post.delete:', error);
      throw new DatabaseError('Failed to delete post');
    }
  }

  async updateStatus(id: string, status: string) {
    try {
      return await prisma.link.update({
        where: { id },
        data: { status: status as any }
      });
    } catch (error: any) {
      logger.error('Database error in post.updateStatus:', error);
      throw new DatabaseError('Failed to update post status');
    }
  }

  async incrementLikes(id: string) {
    try {
      return await prisma.link.update({
        where: { id },
        data: {
          totalLikes: {
            increment: 1
          }
        }
      });
    } catch (error: any) {
      logger.error('Database error in post.incrementLikes:', error);
      throw new DatabaseError('Failed to increment likes');
    }
  }

  async decrementLikes(id: string) {
    try {
      // Use raw SQL with GREATEST to prevent negative totalLikes
      await prisma.$executeRaw`
        UPDATE "posts"."Link"
        SET "totalLikes" = GREATEST("totalLikes" - 1, 0),
            "updatedAt" = NOW()
        WHERE "id" = ${id}::uuid
      `;
    } catch (error: any) {
      logger.error('Database error in post.decrementLikes:', error);
      throw new DatabaseError('Failed to decrement likes');
    }
  }

  async getUserPosts(
    userId: string,
    page: number,
    pageSize: number,
    status?: string,
    sortBy?: string
  ) {
    try {
      const skip = (page - 1) * pageSize;

      // Build WHERE clause
      const where: Record<string, unknown> = { userId };
      if (status) {
        where.status = status;
      }

      // Build ORDER BY clause
      let orderBy: Record<string, string> = { createdAt: 'desc' };
      switch (sortBy) {
        case 'oldest':
          orderBy = { createdAt: 'asc' };
          break;
        case 'most-liked':
          orderBy = { totalLikes: 'desc' };
          break;
        case 'most-flagged':
          // Sort by flag count requires a different approach
          break;
        case 'newest':
        default:
          orderBy = { createdAt: 'desc' };
      }

      const [posts, total] = await Promise.all([
        prisma.link.findMany({
          where,
          include: {
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
              }
            }
          },
          orderBy,
          skip,
          take: pageSize
        }),
        prisma.link.count({ where })
      ]);

      // If sorting by most-flagged, sort in-memory (flag count is a computed relation)
      let sortedPosts = posts;
      if (sortBy === 'most-flagged') {
        sortedPosts = [...posts].sort(
          (a, b) => (b._count?.flags ?? 0) - (a._count?.flags ?? 0)
        );
      }
      if (sortBy === 'most-shared') {
        sortedPosts = [...posts].sort(
          (a, b) => (b._count?.shares ?? 0) - (a._count?.shares ?? 0)
        );
      }

      return {
        posts: sortedPosts,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      };
    } catch (error: any) {
      logger.error('Database error in post.getUserPosts:', error);
      throw new DatabaseError('Failed to fetch user posts');
    }
  }

  async getPostCountToday(userId: string): Promise<number> {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      return await prisma.link.count({
        where: {
          userId,
          createdAt: {
            gte: startOfDay
          }
        }
      });
    } catch (error: any) {
      logger.error('Database error in post.getPostCountToday:', error);
      throw new DatabaseError('Failed to count posts');
    }
  }

  /**
   * Returns true if post exists and belongs to userId.
   * Throws NotFoundError if post doesn't exist.
   */
  async checkOwnership(postId: string, userId: string): Promise<boolean> {
    try {
      const post = await prisma.link.findUnique({
        where: { id: postId },
        select: { userId: true }
      });

      if (!post) throw new NotFoundError('Post not found');
      return post.userId === userId;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      logger.error('Database error in post.checkOwnership:', error);
      throw new DatabaseError('Failed to check ownership');
    }
  }

  /**
   * Recalculate and persist the hot score for a post.
   * Fetches current engagement counts, computes the score, and updates the row.
   */
  async recalculateHotScore(postId: string): Promise<void> {
    try {
      const post = await prisma.link.findUnique({
        where: { id: postId },
        select: {
          status: true,
          totalLikes: true,
          createdAt: true,
          _count: {
            select: {
              comments: true,
              views: true,
            },
          },
        },
      });

      if (!post) return;

      const score = computeHotScore({
        likes: post.totalLikes,
        comments: post._count.comments,
        views: post._count.views,
        status: post.status,
        createdAt: post.createdAt,
      });

      await prisma.link.update({
        where: { id: postId },
        data: { hotScore: score },
      });
    } catch (error: any) {
      // Hot-score update is non-critical — log but don't throw
      logger.error('Failed to recalculate hot score:', error);
    }
  }
}