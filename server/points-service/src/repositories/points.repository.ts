import prisma from '../utils/prisma.js';
import { DatabaseError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class PointsRepository {
  /**
   * Add a ledger entry and update the aggregate balance atomically.
   */
  async addEntry(userId: string, points: number, reason: string, contextId?: string) {
    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Create immutable ledger entry
        const entry = await tx.pointsLedger.create({
          data: { userId, points, reason, contextId }
        });

        // 2. Upsert the aggregate balance and return it
        const balance = await tx.pointsBalance.upsert({
          where: { userId },
          create: { userId, balance: points },
          update: { balance: { increment: points } }
        });

        return { entry, newBalance: balance.balance };
      });
    } catch (error) {
      logger.error('Database error in points.addEntry:', error);
      throw new DatabaseError('Failed to record points');
    }
  }

  /**
   * Get the current balance for a user. Returns 0 if no record exists.
   */
  async getBalance(userId: string): Promise<number> {
    try {
      const record = await prisma.pointsBalance.findUnique({
        where: { userId }
      });
      return record?.balance ?? 0;
    } catch (error) {
      logger.error('Database error in points.getBalance:', error);
      throw new DatabaseError('Failed to fetch balance');
    }
  }

  /**
   * Get paginated points history for a user.
   */
  async getHistory(userId: string, page: number, pageSize: number) {
    try {
      const skip = (page - 1) * pageSize;

      const [entries, total] = await Promise.all([
        prisma.pointsLedger.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize
        }),
        prisma.pointsLedger.count({ where: { userId } })
      ]);

      return { entries, total, page, pageSize };
    } catch (error) {
      logger.error('Database error in points.getHistory:', error);
      throw new DatabaseError('Failed to fetch points history');
    }
  }

  /**
   * Get a leaderboard of top users by balance.
   */
  async getLeaderboard(limit: number = 20) {
    try {
      return await prisma.pointsBalance.findMany({
        orderBy: { balance: 'desc' },
        take: limit
      });
    } catch (error) {
      logger.error('Database error in points.getLeaderboard:', error);
      throw new DatabaseError('Failed to fetch leaderboard');
    }
  }
}
