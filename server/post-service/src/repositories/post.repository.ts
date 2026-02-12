//server\post-service\src\repositories\post.repository.ts
import prisma from '../utils/prisma.js';
import { CreatePostInput } from '../validators/post.schema.js';
import { logger } from '../utils/logger.js';
import { DatabaseError, NotFoundError } from '../utils/errors.js';

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
      return await prisma.link.update({
        where: { id },
        data: {
          totalLikes: {
            decrement: 1
          }
        }
      });
    } catch (error: any) {
      logger.error('Database error in post.decrementLikes:', error);
      throw new DatabaseError('Failed to decrement likes');
    }
  }

  async getUserPosts(userId: string, page: number, pageSize: number) {
    try {
      const skip = (page - 1) * pageSize;

      const [posts, total] = await Promise.all([
        prisma.link.findMany({
          where: { userId },
          include: {
            sources: true,
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
          where: { userId }
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

  async checkOwnership(postId: string, userId: string): Promise<boolean> {
    try {
      const post = await prisma.link.findUnique({
        where: { id: postId },
        select: { userId: true }
      });

      return post?.userId === userId;
    } catch (error: any) {
      logger.error('Database error in post.checkOwnership:', error);
      throw new DatabaseError('Failed to check ownership');
    }
  }
}