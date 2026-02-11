//server\post-service\src\controllers\comment.controller.ts
import { Response } from 'express';
import { CommentService } from '../services/comment.service.js';
import { createCommentSchema, updateCommentSchema } from '../validators/comment.schema.js';
import { ResponseUtil } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { getParam } from '../utils/request.js'; // ✅ ADD THIS
import type { AuthRequest } from '../types/auth.types.js';

export class CommentController {
  constructor(private commentService: CommentService) {}

  async createComment(req: AuthRequest, res: Response) {
    try {
      const linkId = getParam(req.params.linkId); // ✅ FIXED
      const userId = req.user!.userId;
      const validatedData = createCommentSchema.parse(req.body);
      
      const comment = await this.commentService.createComment(linkId, userId, validatedData);
      
      return ResponseUtil.created(res, comment);
    } catch (error: any) {
      logger.error('Create comment controller error:', error);
      
      if (error.name === 'ZodError') {
        return ResponseUtil.error(res, 'Validation failed', 400, 'VALIDATION_ERROR');
      }
      
      throw error;
    }
  }

  async getComments(req: AuthRequest, res: Response) {
    try {
      const linkId = getParam(req.params.linkId); // ✅ FIXED
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      
      const result = await this.commentService.getComments(linkId, page, pageSize);
      
      return ResponseUtil.paginated(
        res,
        result.comments,
        result.page,
        result.pageSize,
        result.total
      );
    } catch (error: any) {
      logger.error('Get comments controller error:', error);
      throw error;
    }
  }

  async updateComment(req: AuthRequest, res: Response) {
    try {
      const id = getParam(req.params.id); // ✅ FIXED
      const userId = req.user!.userId;
      const validatedData = updateCommentSchema.parse(req.body);
      
      const comment = await this.commentService.updateComment(id, userId, validatedData);
      
      return ResponseUtil.success(res, comment);
    } catch (error: any) {
      logger.error('Update comment controller error:', error);
      
      if (error.name === 'ZodError') {
        return ResponseUtil.error(res, 'Validation failed', 400, 'VALIDATION_ERROR');
      }
      
      throw error;
    }
  }

  async deleteComment(req: AuthRequest, res: Response) {
    try {
      const id = getParam(req.params.id); // ✅ FIXED
      const userId = req.user!.userId;
      
      await this.commentService.deleteComment(id, userId);
      
      return ResponseUtil.noContent(res);
    } catch (error: any) {
      logger.error('Delete comment controller error:', error);
      throw error;
    }
  }
}