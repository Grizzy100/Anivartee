import { PointsRepository } from '../repositories/points.repository.js';
import { UserClient } from './clients/user.client.js';
import {
  USER_RANKS, CHECKER_RANKS,
  RankConfig
} from '../config/ranks.js';
import { CONSTANTS } from '../config/constants.js';
import type { UserRankData, RankLimits } from '../types/auth.types.js';
import { logger } from '../utils/logger.js';

export class PointsService {
  /** In-memory TTL cache for the public leaderboard. */
  private leaderboardCache: { data: any[]; expiry: number } | null = null;
  private static LEADERBOARD_CACHE_TTL = 60_000; // 60 seconds

  constructor(
    private pointsRepo: PointsRepository,
    private userClient: UserClient
  ) {}

  // ─── Rank computation ──────────────────────────────────────

  private buildLimits(cfg: RankConfig): RankLimits {
    return {
      maxHeaderLength: cfg.maxHeaderLength,
      maxDescriptionLength: cfg.maxDescriptionLength,
      postsPerDay: cfg.postsPerDay,
      editsPerDay: cfg.editsPerDay,
      commentEditWindowHours: cfg.commentEditWindowHours,
      flagsPerDay: cfg.flagsPerDay,
      postPoints: cfg.postPoints,
      flagWeight: cfg.flagWeight
    };
  }

  private computeUserRank(points: number) {
    const rankKeys = Object.keys(USER_RANKS);
    let matchedRank: RankConfig | null = null;
    let rankLevel = 1;
    for (let i = 0; i < rankKeys.length; i++) {
      const cfg = USER_RANKS[rankKeys[i]];
      if (points >= cfg.minPoints) {
        matchedRank = cfg;
        rankLevel = i + 1;
      }
    }
    const fallback = USER_RANKS.NOVICE;
    const finalRank = matchedRank || fallback;
    return { rankName: finalRank.rank, rankLevel, limits: this.buildLimits(finalRank) };
  }

  private computeCheckerRank(points: number) {
    const rankKeys = Object.keys(CHECKER_RANKS);
    let matchedRank: RankConfig | null = null;
    let rankLevel = 1;
    for (let i = 0; i < rankKeys.length; i++) {
      const cfg = CHECKER_RANKS[rankKeys[i]];
      if (points >= cfg.minPoints) {
        matchedRank = cfg;
        rankLevel = i + 1;
      }
    }
    const fallback = CHECKER_RANKS.APPRENTICE;
    const finalRank = matchedRank || fallback;
    return { rankName: finalRank.rank, rankLevel, limits: this.buildLimits(finalRank) };
  }

  // ─── Public API ────────────────────────────────────────────

  /**
   * Get a user's rank data including their points, rank name, and limits.
   * Called by post-service via GET /api/internal/users/:userId/rank
   */
  async getUserRank(userId: string): Promise<UserRankData> {
    // 1. Get current points balance
    const points = await this.pointsRepo.getBalance(userId);

    // 2. Get user role from user-service
    const user = await this.userClient.getUserById(userId);
    const role = (user?.role === 'FACT_CHECKER') ? 'FACT_CHECKER'
               : (user?.role === 'ADMIN') ? 'ADMIN'
               : 'USER';

    // 3. Compute rank based on role + points
    const isChecker = role === 'FACT_CHECKER';
    const { rankName, rankLevel, limits } = isChecker
      ? this.computeCheckerRank(points)
      : this.computeUserRank(points);

    return {
      userId,
      role: role as 'USER' | 'FACT_CHECKER' | 'ADMIN',
      rankLevel,
      rankName,
      points,
      limits
    };
  }

  /**
   * Award (or deduct) points to a user.
   * Called by post-service via POST /api/internal/points/award
   */
  async awardPoints(userId: string, points: number, reason: string, contextId?: string) {
    const { entry, newBalance } = await this.pointsRepo.addEntry(userId, points, reason, contextId);

    // Invalidate leaderboard cache since balances changed
    this.leaderboardCache = null;

    logger.info(`Points awarded: ${points} to ${userId} for ${reason} (balance: ${newBalance})`);

    return {
      entryId: entry.id,
      userId,
      points,
      reason,
      newBalance
    };
  }

  /**
   * Get a user's current balance.
   */
  async getBalance(userId: string) {
    const balance = await this.pointsRepo.getBalance(userId);
    return { userId, balance };
  }

  /**
   * Get paginated points history for a user.
   */
  async getHistory(userId: string, page: number, pageSize: number) {
    return this.pointsRepo.getHistory(userId, page, pageSize);
  }

  /**
   * Get the leaderboard (cached for 60 s to reduce DB load on this public endpoint).
   */
  async getLeaderboard(limit: number = 20) {
    const now = Date.now();

    if (this.leaderboardCache && this.leaderboardCache.expiry > now) {
      return this.leaderboardCache.data.slice(0, limit);
    }

    // Fetch the max allowed and cache the full set; slice per-request
    const data = await this.pointsRepo.getLeaderboard(CONSTANTS.MAX_PAGE_SIZE);
    this.leaderboardCache = { data, expiry: now + PointsService.LEADERBOARD_CACHE_TTL };
    return data.slice(0, limit);
  }
}
