import { Request, Response } from 'express';
import { PointsService } from '../services/points.service.js';
import { AuthRequest } from '../types/auth.types.js';
import { ResponseUtil } from '../utils/response.js';
import { CONSTANTS } from '../config/constants.js';

export class PointsController {
  constructor(private pointsService: PointsService) {}

  /**
   * GET /api/points/me — Get my balance + rank (authenticated user).
   */
  async getMyRank(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const rankData = await this.pointsService.getUserRank(userId);
    return ResponseUtil.success(res, rankData);
  }

  /**
   * GET /api/points/me/history — Get my points history.
   */
  async getMyHistory(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(
      CONSTANTS.MAX_HISTORY_PAGE_SIZE,
      Math.max(1, parseInt(req.query.pageSize as string) || CONSTANTS.DEFAULT_PAGE_SIZE)
    );

    const result = await this.pointsService.getHistory(userId, page, pageSize);
    return ResponseUtil.paginated(res, result.entries, result.page, result.pageSize, result.total);
  }

  /**
   * GET /api/points/leaderboard — Public leaderboard.
   */
  async getLeaderboard(req: Request, res: Response) {
    const limit = Math.min(
      CONSTANTS.MAX_PAGE_SIZE,
      Math.max(1, parseInt(req.query.limit as string) || CONSTANTS.DEFAULT_PAGE_SIZE)
    );
    const data = await this.pointsService.getLeaderboard(limit);
    return ResponseUtil.success(res, data);
  }
}
