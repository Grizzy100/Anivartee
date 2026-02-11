//server\post-service\src\controllers\feed.controller.ts
import { Response } from 'express';
import { FeedService } from '../services/feed.service.js';
import { ResponseUtil } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import type { AuthRequest } from '../types/auth.types.js';

export class FeedController {
  constructor(private feedService: FeedService) {}

  async getHomeFeed(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId || null;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      
      const result = await this.feedService.getHomeFeed(userId, page, pageSize);
      
      return ResponseUtil.paginated(
        res,
        result.posts,
        result.page,
        result.pageSize,
        result.total
      );
    } catch (error: any) {
      logger.error('Get home feed controller error:', error);
      throw error;
    }
  }

  async getTrendingFeed(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      
      const result = await this.feedService.getTrendingFeed(page, pageSize);
      
      return ResponseUtil.paginated(
        res,
        result.posts,
        result.page,
        result.pageSize,
        result.total
      );
    } catch (error: any) {
      logger.error('Get trending feed controller error:', error);
      throw error;
    }
  }

  async getControversialFeed(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      
      const result = await this.feedService.getControversialFeed(page, pageSize);
      
      return ResponseUtil.paginated(
        res,
        result.posts,
        result.page,
        result.pageSize,
        result.total
      );
    } catch (error: any) {
      logger.error('Get controversial feed controller error:', error);
      throw error;
    }
  }
}