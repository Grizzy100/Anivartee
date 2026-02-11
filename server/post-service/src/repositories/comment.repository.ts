//server\post-service\src\repositories\comment.repository.ts
import prisma from '../utils/prisma.js';
import { CreateCommentInput } from '../validators/comment.schema.js';
import { logger } from '../utils/logger.js';
import { DatabaseError } from '../utils/errors.js';

export class CommentRepository {
  async create(linkId: string, userId: string, data: CreateCommentInput) {
    try {
      return await prisma.comment.create({
        data: {
          linkId,
          userId,
          content: data.content,
          parentId: data.parentId || null
        },
        include: {
          _count: {
            select: {
              likes: true,
              replies: true
            }
          }
        }
      });
    } catch (error: any) {
      logger.error('Database error in comment.create:', error);
      throw new DatabaseError('Failed to create comment');
    }
  }

  async findById(id: string) {
    try {
      return await prisma.comment.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              likes: true,
              replies: true
            }
          }
        }
      });
    } catch (error: any) {
      logger.error('Database error in comment.findById:', error);
      throw new DatabaseError('Failed to fetch comment');
    }
  }

  async update(id: string, content: string) {
    try {
      return await prisma.comment.update({
        where: { id },
        data: { content }
      });
    } catch (error: any) {
      logger.error('Database error in comment.update:', error);
      throw new DatabaseError('Failed to update comment');
    }
  }

  async delete(id: string) {
    try {
      return await prisma.comment.delete({
        where: { id }
      });
    } catch (error: any) {
      logger.error('Database error in comment.delete:', error);
      throw new DatabaseError('Failed to delete comment');
    }
  }

  async getCommentsByPost(linkId: string, page: number, pageSize: number) {
    try {
      const skip = (page - 1) * pageSize;

      // Get root comments (no parent)
      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          where: {
            linkId,
            parentId: null
          },
          include: {
            replies: {
              include: {
                replies: {
                  include: {
                    replies: true, // 3 levels deep
                    _count: {
                      select: { likes: true, replies: true }
                    }
                  }
                },
                _count: {
                  select: { likes: true, replies: true }
                }
              }
            },
            _count: {
              select: { likes: true, replies: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize
        }),
        prisma.comment.count({
          where: {
            linkId,
            parentId: null
          }
        })
      ]);

      return {
        comments,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      };
    } catch (error: any) {
      logger.error('Database error in comment.getCommentsByPost:', error);
      throw new DatabaseError('Failed to fetch comments');
    }
  }

  async checkOwnership(commentId: string, userId: string): Promise<boolean> {
    try {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { userId: true }
      });

      return comment?.userId === userId;
    } catch (error: any) {
      logger.error('Database error in comment.checkOwnership:', error);
      throw new DatabaseError('Failed to check comment ownership');
    }
  }
}