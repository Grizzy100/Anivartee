//server\post-service\src\services\clients\points.client.ts
import httpClient from '../../utils/http.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import type { UserRankData } from '../../types/auth.types.js';

/** Lowest-tier fallback when points-service is completely unreachable. */
const NOVICE_FALLBACK: Omit<UserRankData, 'userId'> = {
  role: 'USER',
  rankLevel: 0,
  rankName: 'Novice',
  points: 0,
  limits: {
    maxHeaderLength: 20,
    maxDescriptionLength: 60,
    postsPerDay: 2,
    flagsPerDay: 2,
    postPoints: 3,
    flagWeight: 0.5
  }
} as const;

export class PointsClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.POINTS_SERVICE_URL;
  }

  /**
   * Fetch a user's rank data from points-service.
   * Falls back to the lowest rank (Novice) if the service is unreachable.
   */
  async getUserRank(userId: string): Promise<UserRankData> {
    try {
      const response = await httpClient.get(
        `${this.baseUrl}/api/internal/users/${userId}/rank`
      );
      return response.data.data;
    } catch (error: any) {
      logger.error(`Failed to fetch rank for user ${userId}:`, error.message);
      return { userId, ...NOVICE_FALLBACK };
    }
  }

  /**
   * Award (or deduct) points. Fire-and-forget safe — callers should not
   * block on or fail from a points error.
   */
  async awardPoints(
    userId: string,
    points: number,
    reason: string,
    contextId?: string
  ): Promise<void> {
    try {
      await httpClient.post(`${this.baseUrl}/api/internal/points/award`, {
        userId,
        points,
        reason,
        contextId
      });
      logger.debug(`Awarded ${points} points to user ${userId} for ${reason}`);
    } catch (error: any) {
      logger.error('Failed to award points:', error.message);
    }
  }
}