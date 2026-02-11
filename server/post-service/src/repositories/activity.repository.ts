//server\post-service\src\repositories\activity.repository.ts
import prisma from '../utils/prisma.js';
import { DatabaseError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export type ActivityType = 'POST_CREATED' | 'COMMENT_CREATED' | 'FACT_CHECK_COMPLETED';

export class ActivityRepository {
  /**
   * Upsert a daily activity row: increment the relevant counter for today.
   * Uses UNIQUE(userId, date) to keep one row per user per day.
   */
  async record(userId: string, activityType: ActivityType) {
    try {
      const today = this.todayDate();

      const incrementField = this.fieldForType(activityType);

      await prisma.dailyActivity.upsert({
        where: {
          userId_date: { userId, date: today }
        },
        create: {
          userId,
          date: today,
          [incrementField]: 1
        },
        update: {
          [incrementField]: { increment: 1 }
        }
      });
    } catch (error) {
      logger.error('Database error in activity.record:', error);
      throw new DatabaseError('Failed to record daily activity');
    }
  }

  /**
   * Return all rows for a user within a month (used by calendar endpoint).
   */
  async getByMonth(userId: string, year: number, month: number) {
    try {
      const start = new Date(Date.UTC(year, month - 1, 1));
      const end = new Date(Date.UTC(year, month, 1)); // exclusive upper bound

      return await prisma.dailyActivity.findMany({
        where: {
          userId,
          date: { gte: start, lt: end }
        },
        orderBy: { date: 'asc' }
      });
    } catch (error) {
      logger.error('Database error in activity.getByMonth:', error);
      throw new DatabaseError('Failed to fetch monthly activity');
    }
  }

  // ─── helpers ───

  private todayDate(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

  private fieldForType(type: ActivityType): string {
    switch (type) {
      case 'POST_CREATED':          return 'postsCreated';
      case 'COMMENT_CREATED':       return 'commentsCreated';
      case 'FACT_CHECK_COMPLETED':  return 'postsFactChecked';
      default:                      return 'postsCreated';
    }
  }
}
