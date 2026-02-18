//server\post-service\src\repositories\factCheck.repository.ts
import prisma from '../utils/prisma.js';
import { CreateFactCheckInput } from '../validators/factCheck.schema.js';
import type { FactCheckVerdict } from '../generated/prisma/index.js';
import { logger } from '../utils/logger.js';
import { DatabaseError } from '../utils/errors.js';

export class FactCheckRepository {
  async create(postId: string, factCheckerId: string, data: CreateFactCheckInput) {
    try {
      return await prisma.factCheck.create({
        data: {
          postId,
          factCheckerId,
          verdict: data.verdict as unknown as FactCheckVerdict,
          header: data.header,
          description: data.description,
          referenceUrls: data.referenceUrls
        }
      });
    } catch (error: any) {
      logger.error('Database error in factCheck.create:', error);
      throw new DatabaseError('Failed to create fact-check');
    }
  }

  async findById(id: string) {
    try {
      return await prisma.factCheck.findUnique({
        where: { id }
      });
    } catch (error: any) {
      logger.error('Database error in factCheck.findById:', error);
      throw new DatabaseError('Failed to fetch fact-check');
    }
  }

  async getFactChecksByPost(postId: string) {
    try {
      return await prisma.factCheck.findMany({
        where: { postId },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error: any) {
      logger.error('Database error in factCheck.getFactChecksByPost:', error);
      throw new DatabaseError('Failed to fetch fact-checks');
    }
  }

  async findByPostAndChecker(postId: string, factCheckerId: string) {
    try {
      return await prisma.factCheck.findFirst({
        where: {
          postId,
          factCheckerId
        }
      });
    } catch (error: any) {
      logger.error('Database error in factCheck.findByPostAndChecker:', error);
      throw new DatabaseError('Failed to find fact-check');
    }
  }

  /**
   * Get all fact-checks submitted by a specific checker, with enriched post data.
   * Used for the "My Fact-Checks" tab on the fact-checker dashboard.
   */
  async getFactChecksByChecker(factCheckerId: string, page: number, pageSize: number) {
    try {
      const skip = (page - 1) * pageSize;
      const where = { factCheckerId };

      const [factChecks, total] = await Promise.all([
        prisma.factCheck.findMany({
          where,
          include: {
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
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize,
        }),
        prisma.factCheck.count({ where }),
      ]);

      return {
        factChecks,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (error: any) {
      logger.error('Database error in factCheck.getFactChecksByChecker:', error);
      throw new DatabaseError('Failed to fetch fact-checks by checker');
    }
  }
}