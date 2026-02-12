//server\post-service\src\services\activity.service.ts
import { ActivityRepository, ActivityType } from '../repositories/activity.repository.js';
import { ValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class ActivityService {
  constructor(private activityRepo: ActivityRepository) {}

  /**
   * Record a single activity event for a user (fire-and-forget safe).
   */
  async recordActivity(userId: string, activityType: ActivityType) {
    try {
      await this.activityRepo.record(userId, activityType);
      logger.debug(`Activity recorded: ${activityType} for user ${userId}`);
    } catch (error) {
      // Never let activity tracking break the main flow
      logger.error('Error recording activity:', error);
    }
  }

  /**
   * Get the number of post edits a user has made today.
   */
  async getEditCountToday(userId: string): Promise<number> {
    return this.activityRepo.getEditCountToday(userId);
  }

  /**
   * Return calendar data for a given month.
   *
   * Response shape:
   * {
   *   year, month,
   *   activeDays: ["2026-02-01", "2026-02-05"],
   *   details: { "2026-02-01": { posts: 1, comments: 3, factChecks: 0 }, ... }
   * }
   */
  async getCalendar(userId: string, year: number, month: number) {
    if (month < 1 || month > 12) {
      throw new ValidationError('Month must be between 1 and 12');
    }
    if (year < 2020 || year > 2100) {
      throw new ValidationError('Year must be between 2020 and 2100');
    }

    const rows = await this.activityRepo.getByMonth(userId, year, month);

    const activeDays: string[] = [];
    const details: Record<string, { posts: number; edits: number; comments: number; factChecks: number }> = {};

    for (const row of rows) {
      const total = row.postsCreated + row.postsEdited + row.commentsCreated + row.postsFactChecked;
      if (total === 0) continue;

      const dateStr = row.date.toISOString().slice(0, 10); // "YYYY-MM-DD"
      activeDays.push(dateStr);
      details[dateStr] = {
        posts: row.postsCreated,
        edits: row.postsEdited,
        comments: row.commentsCreated,
        factChecks: row.postsFactChecked
      };
    }

    return { year, month, activeDays, details };
  }
}
