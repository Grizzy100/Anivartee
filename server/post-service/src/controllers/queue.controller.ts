//server\post-service\src\controllers\queue.controller.ts
import { Request, Response } from 'express';
import { QueueService } from '../services/queue.service.js';
import { ResponseUtil } from '../utils/response.js';
import { getParam } from '../utils/request.js';
import { logger } from '../utils/logger.js';

export class QueueController {
  constructor(private queueService: QueueService) {}

  /**
   * GET /api/queue — Get paginated list of pending posts for fact-checkers.
   */
  async getQueue(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;

      const result = await this.queueService.getQueue(page, pageSize);

      return ResponseUtil.paginated(
        res,
        result.items,
        result.page,
        result.pageSize,
        result.total
      );
    } catch (error: any) {
      logger.error('Get queue controller error:', error);
      throw error;
    }
  }

  /**
   * GET /api/queue/:id — Get a single queue item.
   */
  async getQueueItem(req: Request, res: Response) {
    try {
      const id = getParam(req.params.id);
      const item = await this.queueService.getQueueItem(id);
      return ResponseUtil.success(res, item);
    } catch (error: any) {
      logger.error('Get queue item controller error:', error);
      throw error;
    }
  }

  /**
   * POST /api/internal/queue/add — Internal: add a post to queue.
   */
  async addToQueue(req: Request, res: Response) {
    try {
      const { postId, userId } = req.body;
      const item = await this.queueService.addToQueue(postId, userId);
      return ResponseUtil.created(res, item);
    } catch (error: any) {
      logger.error('Add to queue controller error:', error);
      throw error;
    }
  }

  /**
   * POST /api/internal/queue/remove — Internal: remove a post from queue.
   */
  async removeFromQueue(req: Request, res: Response) {
    try {
      const { postId } = req.body;
      await this.queueService.removeFromQueue(postId);
      return ResponseUtil.success(res, { message: 'Post removed from queue' });
    } catch (error: any) {
      logger.error('Remove from queue controller error:', error);
      throw error;
    }
  }
}
