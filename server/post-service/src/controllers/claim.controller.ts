import { Request, Response } from 'express';
import { ClaimService } from '../services/claim.service.js';
import { AuthRequest } from '../types/auth.types.js';
import { ResponseUtil } from '../utils/response.js';
import { getParam } from '../utils/request.js';
import { logger } from '../utils/logger.js';

export class ClaimController {
  constructor(private claimService: ClaimService) {}

  /**
   * POST /api/moderation/posts/:postId/claim — Fact-checker claims a post.
   */
  async claimPost(req: AuthRequest, res: Response) {
    try {
      const postId = getParam(req.params.postId);
      const factCheckerId = req.user!.userId;

      const claim = await this.claimService.claimPost(postId, factCheckerId);
      return ResponseUtil.created(res, claim);
    } catch (error: any) {
      logger.error('Claim post controller error:', error);
      throw error;
    }
  }

  /**
   * DELETE /api/moderation/posts/:postId/claim — Abandon a claim.
   */
  async abandonClaim(req: AuthRequest, res: Response) {
    try {
      const postId = getParam(req.params.postId);
      const factCheckerId = req.user!.userId;

      const result = await this.claimService.abandonClaim(postId, factCheckerId);
      return ResponseUtil.success(res, result);
    } catch (error: any) {
      logger.error('Abandon claim controller error:', error);
      throw error;
    }
  }

  /**
   * GET /api/moderation/posts/:postId/claim — Get active claim for a post.
   */
  async getActiveClaim(req: AuthRequest, res: Response) {
    try {
      const postId = getParam(req.params.postId);
      const claim = await this.claimService.getActiveClaim(postId);
      return ResponseUtil.success(res, claim);
    } catch (error: any) {
      logger.error('Get active claim controller error:', error);
      throw error;
    }
  }
}
