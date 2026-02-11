//server\post-service\src\controllers\internal.controller.ts
import { Request, Response } from 'express';
import { PostService } from '../services/post.service.js';
import { FactCheckService } from '../services/factCheck.service.js';
import { ResponseUtil } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { getParam } from '../utils/request.js'; // ✅ ADD THIS

export class InternalController {
  constructor(
    private postService: PostService,
    private factCheckService: FactCheckService
  ) {}

  async getPost(req: Request, res: Response) {
    try {
      const id = getParam(req.params.id); // ✅ FIXED
      
      const post = await this.postService.getPost(id);
      
      return ResponseUtil.success(res, post);
    } catch (error: any) {
      logger.error('Internal get post error:', error);
      throw error;
    }
  }

  async updatePostStatus(req: Request, res: Response) {
    try {
      const id = getParam(req.params.id); // ✅ FIXED
      const { status } = req.body;
      
      await this.postService.updatePostStatus(id, status);
      
      return ResponseUtil.success(res, { message: 'Post status updated' });
    } catch (error: any) {
      logger.error('Internal update post status error:', error);
      throw error;
    }
  }

  async saveFactCheck(req: Request, res: Response) {
    try {
      const linkId = getParam(req.params.linkId); // ✅ FIXED
      const { factCheckerId, verdict, header, description, referenceUrls } = req.body;
      
      const factCheck = await this.factCheckService.createFactCheck(
        linkId,
        factCheckerId,
        { verdict, header, description, referenceUrls }
      );
      
      return ResponseUtil.created(res, factCheck);
    } catch (error: any) {
      logger.error('Internal save fact-check error:', error);
      throw error;
    }
  }
}