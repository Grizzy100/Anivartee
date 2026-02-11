import { Request, Response } from 'express';
import { VerdictService } from '../services/verdict.service.js';
import { AuthRequest } from '../types/auth.types.js';
import { ResponseUtil } from '../utils/response.js';
import { getParam } from '../utils/request.js';
import { submitVerdictSchema, saveDraftSchema } from '../validators/verdict.schema.js';
import { ValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class VerdictController {
  constructor(private verdictService: VerdictService) {}

  /**
   * POST /api/moderation/posts/:postId/verdict — Submit verdict.
   */
  async submitVerdict(req: AuthRequest, res: Response) {
    try {
      const postId = getParam(req.params.postId);
      const factCheckerId = req.user!.userId;

      const parsed = submitVerdictSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(
          parsed.error.issues.map(i => i.message).join(', ')
        );
      }

      const factCheck = await this.verdictService.submitVerdict(
        postId,
        factCheckerId,
        parsed.data
      );
      return ResponseUtil.created(res, factCheck);
    } catch (error: any) {
      logger.error('Submit verdict controller error:', error);
      throw error;
    }
  }

  /**
   * PUT /api/moderation/posts/:postId/draft — Auto-save draft.
   */
  async saveDraft(req: AuthRequest, res: Response) {
    try {
      const postId = getParam(req.params.postId);
      const factCheckerId = req.user!.userId;

      const parsed = saveDraftSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(
          parsed.error.issues.map(i => i.message).join(', ')
        );
      }

      const draft = await this.verdictService.saveDraft(
        postId,
        factCheckerId,
        parsed.data
      );
      return ResponseUtil.success(res, draft);
    } catch (error: any) {
      logger.error('Save draft controller error:', error);
      throw error;
    }
  }

  /**
   * GET /api/moderation/posts/:postId/draft — Get saved draft.
   */
  async getDraft(req: AuthRequest, res: Response) {
    try {
      const postId = getParam(req.params.postId);
      const factCheckerId = req.user!.userId;
      const draft = await this.verdictService.getDraft(postId, factCheckerId);
      return ResponseUtil.success(res, draft);
    } catch (error: any) {
      logger.error('Get draft controller error:', error);
      throw error;
    }
  }
}
