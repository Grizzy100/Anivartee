//server\post-service\src\controllers\post.controller.ts
import { Response } from 'express';
import { PostService } from '../services/post.service.js';
import { createPostSchema, updatePostSchema } from '../validators/post.schema.js';
import { ResponseUtil } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { getParam } from '../utils/request.js'; // ✅ ADD THIS
import type { AuthRequest } from '../types/auth.types.js';

export class PostController {
  constructor(private postService: PostService) {}

  async createPost(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const validatedData = createPostSchema.parse(req.body);
      
      const post = await this.postService.createPost(userId, validatedData);
      
      return ResponseUtil.created(res, post);
    } catch (error: any) {
      logger.error('Create post controller error:', error);
      
      if (error.name === 'ZodError') {
        return ResponseUtil.error(res, 'Validation failed', 400, 'VALIDATION_ERROR');
      }
      
      throw error;
    }
  }

  async getPost(req: AuthRequest, res: Response) {
    try {
      const id = getParam(req.params.id); // ✅ FIXED
      const userId = req.user?.userId;
      
      const post = await this.postService.getPost(id, userId);
      
      return ResponseUtil.success(res, post);
    } catch (error: any) {
      logger.error('Get post controller error:', error);
      throw error;
    }
  }

  async updatePost(req: AuthRequest, res: Response) {
    try {
      const id = getParam(req.params.id); // ✅ FIXED
      const userId = req.user!.userId;
      const validatedData = updatePostSchema.parse(req.body);
      
      const post = await this.postService.updatePost(id, userId, validatedData);
      
      return ResponseUtil.success(res, post);
    } catch (error: any) {
      logger.error('Update post controller error:', error);
      
      if (error.name === 'ZodError') {
        return ResponseUtil.error(res, 'Validation failed', 400, 'VALIDATION_ERROR');
      }
      
      throw error;
    }
  }

  async deletePost(req: AuthRequest, res: Response) {
    try {
      const id = getParam(req.params.id); // ✅ FIXED
      const userId = req.user!.userId;
      
      await this.postService.deletePost(id, userId);
      
      return ResponseUtil.noContent(res);
    } catch (error: any) {
      logger.error('Delete post controller error:', error);
      throw error;
    }
  }

  async getUserPosts(req: AuthRequest, res: Response) {
    try {
      const userId = getParam(req.params.userId); // ✅ FIXED
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      
      const result = await this.postService.getUserPosts(userId, page, pageSize);
      
      return ResponseUtil.paginated(
        res,
        result.posts,
        result.page,
        result.pageSize,
        result.total
      );
    } catch (error: any) {
      logger.error('Get user posts controller error:', error);
      throw error;
    }
  }
}