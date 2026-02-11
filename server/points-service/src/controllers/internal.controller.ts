import { Request, Response } from 'express';
import { PointsService } from '../services/points.service.js';
import { ResponseUtil } from '../utils/response.js';
import { getUuidParam } from '../utils/request.js';
import { awardPointsSchema } from '../validators/points.schema.js';
import { ValidationError } from '../utils/errors.js';

/**
 * Handles internal (service-to-service) endpoints.
 * All routes require x-service-token authentication.
 */
export class InternalController {
  constructor(private pointsService: PointsService) {}

  /**
   * GET /api/internal/users/:userId/rank — Get user rank data.
   * Called by post-service's PointsClient.getUserRank()
   */
  async getUserRank(req: Request, res: Response) {
    const userId = getUuidParam(req.params.userId);
    const rankData = await this.pointsService.getUserRank(userId);
    return ResponseUtil.success(res, rankData);
  }

  /**
   * POST /api/internal/points/award — Award points to a user.
   * Called by post-service's PointsClient.awardPoints()
   * Body: { userId, points, reason, contextId? }
   */
  async awardPoints(req: Request, res: Response) {
    const parsed = awardPointsSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map(i => i.message).join(', ')
      );
    }

    const { userId, points, reason, contextId } = parsed.data;
    const result = await this.pointsService.awardPoints(userId, points, reason, contextId);
    return ResponseUtil.created(res, result);
  }
}
