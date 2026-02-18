//server\post-service\src\controllers\factCheck.controller.ts
import { Response } from 'express';
import { FactCheckService } from '../services/factCheck.service.js';
import { createFactCheckSchema } from '../validators/factCheck.schema.js';
import { ResponseUtil } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { getParam } from '../utils/request.js'; // ✅ ADD THIS
import type { AuthRequest } from '../types/auth.types.js';

export class FactCheckController {
  constructor(private factCheckService: FactCheckService) {}

  async createFactCheck(req: AuthRequest, res: Response) {
    try {
      const linkId = getParam(req.params.linkId); // ✅ FIXED
      const factCheckerId = req.user!.userId;
      const validatedData = createFactCheckSchema.parse(req.body);
      
      const factCheck = await this.factCheckService.createFactCheck(
        linkId,
        factCheckerId,
        validatedData
      );
      
      return ResponseUtil.created(res, factCheck);
    } catch (error: any) {
      logger.error('Create fact-check controller error:', error);
      
      if (error.name === 'ZodError') {
        return ResponseUtil.error(res, 'Validation failed', 400, 'VALIDATION_ERROR');
      }
      
      throw error;
    }
  }

  async getFactChecks(req: AuthRequest, res: Response) {
    try {
      const linkId = getParam(req.params.linkId); // ✅ FIXED
      
      const factChecks = await this.factCheckService.getFactChecks(linkId);
      
      return ResponseUtil.success(res, factChecks);
    } catch (error: any) {
      logger.error('Get fact-checks controller error:', error);
      throw error;
    }
  }

  async getMyFactChecks(req: AuthRequest, res: Response) {
    try {
      const factCheckerId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = Math.min(parseInt(req.query.pageSize as string) || 20, 100);

      const result = await this.factCheckService.getFactChecksByChecker(factCheckerId, page, pageSize);

      return ResponseUtil.paginated(
        res,
        result.factChecks,
        result.page,
        result.pageSize,
        result.total
      );
    } catch (error: any) {
      logger.error('Get my fact-checks controller error:', error);
      throw error;
    }
  }
}