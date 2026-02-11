//server\post-service\src\controllers\interaction.controller.ts
import { Response } from 'express';
import { InteractionService } from '../services/interaction.service.js';
import { createViewSchema, createShareSchema } from '../validators/interaction.schema.js';
import { ResponseUtil } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { getParam } from '../utils/request.js'; // ✅ ADD THIS
import type { AuthRequest } from '../types/auth.types.js';

export class InteractionController {
  constructor(private interactionService: InteractionService) {}

  // ============= POST LIKES =============
  async likePost(req: AuthRequest, res: Response) {
    try {
      const linkId = getParam(req.params.linkId); // ✅ FIXED
      const userId = req.user!.userId;
      
      await this.interactionService.likePost(linkId, userId);
      
      return ResponseUtil.success(res, { message: 'Post liked successfully' });
    } catch (error: any) {
      logger.error('Like post controller error:', error);
      throw error;
    }
  }

  async unlikePost(req: AuthRequest, res: Response) {
    try {
      const linkId = getParam(req.params.linkId); // ✅ FIXED
      const userId = req.user!.userId;
      
      await this.interactionService.unlikePost(linkId, userId);
      
      return ResponseUtil.success(res, { message: 'Post unliked successfully' });
    } catch (error: any) {
      logger.error('Unlike post controller error:', error);
      throw error;
    }
  }

  // ============= COMMENT LIKES =============
  async likeComment(req: AuthRequest, res: Response) {
    try {
      const commentId = getParam(req.params.commentId); // ✅ FIXED
      const userId = req.user!.userId;
      
      await this.interactionService.likeComment(commentId, userId);
      
      return ResponseUtil.success(res, { message: 'Comment liked successfully' });
    } catch (error: any) {
      logger.error('Like comment controller error:', error);
      throw error;
    }
  }

  async unlikeComment(req: AuthRequest, res: Response) {
    try {
      const commentId = getParam(req.params.commentId); // ✅ FIXED
      const userId = req.user!.userId;
      
      await this.interactionService.unlikeComment(commentId, userId);
      
      return ResponseUtil.success(res, { message: 'Comment unliked successfully' });
    } catch (error: any) {
      logger.error('Unlike comment controller error:', error);
      throw error;
    }
  }

  // ============= SAVES =============
  async savePost(req: AuthRequest, res: Response) {
    try {
      const linkId = getParam(req.params.linkId); // ✅ FIXED
      const userId = req.user!.userId;
      
      await this.interactionService.savePost(linkId, userId);
      
      return ResponseUtil.success(res, { message: 'Post saved successfully' });
    } catch (error: any) {
      logger.error('Save post controller error:', error);
      throw error;
    }
  }

  async unsavePost(req: AuthRequest, res: Response) {
    try {
      const linkId = getParam(req.params.linkId); // ✅ FIXED
      const userId = req.user!.userId;
      
      await this.interactionService.unsavePost(linkId, userId);
      
      return ResponseUtil.success(res, { message: 'Post unsaved successfully' });
    } catch (error: any) {
      logger.error('Unsave post controller error:', error);
      throw error;
    }
  }

  async getSavedPosts(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      
      const result = await this.interactionService.getSavedPosts(userId, page, pageSize);
      
      return ResponseUtil.paginated(
        res,
        result.posts,
        result.page,
        result.pageSize,
        result.total
      );
    } catch (error: any) {
      logger.error('Get saved posts controller error:', error);
      throw error;
    }
  }

  // ============= VIEWS =============
  async trackView(req: AuthRequest, res: Response) {
    try {
      const linkId = getParam(req.params.linkId); // ✅ FIXED
      const userId = req.user?.userId || null;
      const validatedData = createViewSchema.parse(req.body);
      
      await this.interactionService.trackView(linkId, userId, validatedData.sessionId);
      
      return ResponseUtil.success(res, { message: 'View tracked successfully' });
    } catch (error: any) {
      logger.error('Track view controller error:', error);
      throw error;
    }
  }

  // ============= SHARES =============
  async sharePost(req: AuthRequest, res: Response) {
    try {
      const linkId = getParam(req.params.linkId); // ✅ FIXED
      const userId = req.user!.userId;
      const validatedData = createShareSchema.parse(req.body);
      
      await this.interactionService.sharePost(linkId, userId, validatedData.platform);
      
      return ResponseUtil.success(res, { message: 'Share tracked successfully' });
    } catch (error: any) {
      logger.error('Share post controller error:', error);
      
      if (error.name === 'ZodError') {
        return ResponseUtil.error(res, 'Validation failed', 400, 'VALIDATION_ERROR');
      }
      
      throw error;
    }
  }
}