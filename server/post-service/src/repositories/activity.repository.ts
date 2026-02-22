//server\post-service\src\repositories\activity.repository.ts
import prisma from '../utils/prisma.js';
import { DatabaseError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { getRequestTimezone } from '../utils/requestContext.js';

export type ActivityType = 'POST_CREATED' | 'POST_EDITED' | 'FACT_CHECK_COMPLETED';

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

  /**
   * Get today's edit count for a user (for daily edit limit enforcement).
   */
  async getEditCountToday(userId: string): Promise<number> {
    try {
      const today = this.todayDate();
      const row = await prisma.dailyActivity.findUnique({
        where: { userId_date: { userId, date: today } },
        select: { postsEdited: true }
      });
      return row?.postsEdited ?? 0;
    } catch (error) {
      logger.error('Database error in activity.getEditCountToday:', error);
      throw new DatabaseError('Failed to fetch edit count');
    }
  }

  /**
   * Resolve "today" in the caller's timezone (read from request context).
   * Falls back to UTC when no timezone header was sent.
   */
  private todayDate(): Date {
    const tz = getRequestTimezone();

    try {
      // Use formatToParts for robustness — no dependency on locale-specific separators
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).formatToParts(new Date());

      const get = (type: string) => Number(parts.find(p => p.type === type)!.value);
      return new Date(Date.UTC(get('year'), get('month') - 1, get('day')));
    } catch {
      // Invalid timezone string → fall back to UTC
      const now = new Date();
      return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    }
  }

  private fieldForType(type: ActivityType): string {
    switch (type) {
      case 'POST_CREATED':          return 'postsCreated';
      case 'POST_EDITED':           return 'postsEdited';
      case 'FACT_CHECK_COMPLETED':  return 'postsFactChecked';
      default:                      return 'postsCreated';
    }
  }

  /**
   * Decrement postsCreated for the date the post was originally created.
   * Uses GREATEST to prevent going below zero.
   */
  async decrementPostCreated(userId: string, postCreatedAt: Date): Promise<void> {
    try {
      // Derive the UTC-midnight date from the post's createdAt.
      // DailyActivity.date is stored as @db.Date (date-only, midnight UTC).
      const date = new Date(Date.UTC(
        postCreatedAt.getUTCFullYear(),
        postCreatedAt.getUTCMonth(),
        postCreatedAt.getUTCDate(),
      ));

      await prisma.$executeRaw`
        UPDATE "posts"."DailyActivity"
        SET "postsCreated" = GREATEST("postsCreated" - 1, 0),
            "updatedAt"    = NOW()
        WHERE "userId" = ${userId}::uuid
          AND "date"   = ${date}::date
      `;
    } catch (error) {
      logger.error('Database error in activity.decrementPostCreated:', error);
      throw new DatabaseError('Failed to decrement daily activity');
    }
  }
}