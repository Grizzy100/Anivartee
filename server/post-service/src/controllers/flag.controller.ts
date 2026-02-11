//server\post-service\src\controllers\flag.controller.ts
import { Response } from 'express';
import { FlagService } from '../services/flag.service.js';
import { ResponseUtil } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { getParam } from '../utils/request.js'; // ✅ ADD THIS
import type { AuthRequest } from '../types/auth.types.js';

export class FlagController {
  constructor(private flagService: FlagService) {}

  async flagPost(req: AuthRequest, res: Response) {
    try {
      const linkId = getParam(req.params.linkId); // ✅ FIXED
      const userId = req.user!.userId;
      
      await this.flagService.flagPost(linkId, userId);
      
      return ResponseUtil.success(res, { message: 'Post flagged successfully' });
    } catch (error: any) {
      logger.error('Flag post controller error:', error);
      throw error;
    }
  }

  async unflagPost(req: AuthRequest, res: Response) {
    try {
      const linkId = getParam(req.params.linkId); // ✅ FIXED
      const userId = req.user!.userId;
      
      await this.flagService.unflagPost(linkId, userId);
      
      return ResponseUtil.success(res, { message: 'Post unflagged successfully' });
    } catch (error: any) {
      logger.error('Unflag post controller error:', error);
      throw error;
    }
  }

  async getFlagScore(req: AuthRequest, res: Response) {
    try {
      const linkId = getParam(req.params.linkId); // ✅ FIXED
      
      const score = await this.flagService.getFlagScore(linkId);
      
      return ResponseUtil.success(res, score);
    } catch (error: any) {
      logger.error('Get flag score controller error:', error);
      throw error;
    }
  }
}