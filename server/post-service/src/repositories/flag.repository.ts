//server\post-service\src\repositories\flag.repository.ts
import prisma from '../utils/prisma.js';
import { logger } from '../utils/logger.js';
import { DatabaseError, NotFoundError } from '../utils/errors.js';

export class FlagRepository {
  async create(linkId: string, userId: string, role: string, rankLevel: number) {
    try {
      return await prisma.linkFlag.create({
        data: {
          linkId,
          flaggerUserId: userId,
          flaggerRole: role,
          flaggerRankLevel: rankLevel
        }
      });
    } catch (error: any) {
      logger.error('Database error in flag.create:', error);
      throw new DatabaseError('Failed to create flag');
    }
  }

  async findFlag(linkId: string, userId: string) {
    try {
      return await prisma.linkFlag.findFirst({
        where: {
          linkId,
          flaggerUserId: userId
        }
      });
    } catch (error: any) {
      logger.error('Database error in flag.findFlag:', error);
      throw new DatabaseError('Failed to find flag');
    }
  }

  async deleteFlag(linkId: string, userId: string) {
    try {
      return await prisma.linkFlag.deleteMany({
        where: {
          linkId,
          flaggerUserId: userId
        }
      });
    } catch (error: any) {
      logger.error('Database error in flag.deleteFlag:', error);
      throw new DatabaseError('Failed to delete flag');
    }
  }

  async getFlagsByLink(linkId: string) {
    try {
      return await prisma.linkFlag.findMany({
        where: { linkId },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error: any) {
      logger.error('Database error in flag.getFlagsByLink:', error);
      throw new DatabaseError('Failed to fetch flags');
    }
  }

  async getFlagCountToday(userId: string): Promise<number> {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      return await prisma.linkFlag.count({
        where: {
          flaggerUserId: userId,
          createdAt: {
            gte: startOfDay
          }
        }
      });
    } catch (error: any) {
      logger.error('Database error in flag.getFlagCountToday:', error);
      throw new DatabaseError('Failed to count flags');
    }
  }

  async calculateWeightedFlagScore(linkId: string, weightedLikeScore: number): Promise<{
    totalFlags: number;
    weightedScore: number;
    shouldBeFlagged: boolean;
  }> {
    try {
      const flags = await this.getFlagsByLink(linkId);

      // Calculate weighted score
      const weightedScore = flags.reduce((total, flag) => {
        const weight = this.getFlagWeight(flag.flaggerRole, flag.flaggerRankLevel);
        return total + weight;
      }, 0);

      const shouldBeFlagged = weightedScore > weightedLikeScore;

      return {
        totalFlags: flags.length,
        weightedScore,
        shouldBeFlagged
      };
    } catch (error: any) {
      logger.error('Database error in flag.calculateWeightedFlagScore:', error);
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to calculate flag score');
    }
  }

  private getFlagWeight(role: string, rankLevel: number): number {
    if (role === 'USER') {
      // User rank weights: [NOVICE, CONTRIBUTOR, RESEARCHER, TRUSTED, ELITE, LEGEND]
      const userWeights = [1.0, 1.2, 1.4, 1.6, 1.8, 2.0];
      return userWeights[rankLevel] ?? 1.0;
    }

    if (role === 'FACT_CHECKER') {
      // Fact-checker rank weights: [APPRENTICE, ANALYST, INVESTIGATOR, SPECIALIST, SENTINEL, GUARDIAN]
      const checkerWeights = [1.2, 1.5, 2.0, 2.5, 3.0, 3.5];
      return checkerWeights[rankLevel] ?? 1.2;
    }

    return 1.0; // Default
  }
}