//server\post-service\src\controllers\queue.controller.ts
import { Request, Response } from 'express';
import { QueueService } from '../services/queue.service.js';
import { UserClient } from '../services/clients/user.client.js';
import { PointsClient } from '../services/clients/points.client.js';
import { enrichPostsWithUserData } from '../utils/enrichment.js';
import { ResponseUtil } from '../utils/response.js';
import { getParam } from '../utils/request.js';
import type { AuthRequest } from '../types/auth.types.js';

export class QueueController {
  constructor(
    private queueService: QueueService,
    private userClient: UserClient,
    private pointsClient: PointsClient,
  ) {}

  // ── Helpers ──────────────────────────────────────────────────────────────

  /** Parse page/pageSize from query string with sane bounds. */
  private parsePagination(query: Record<string, any>) {
    const page = Math.max(1, parseInt(query.page as string) || 1);
    const pageSize = Math.min(Math.max(1, parseInt(query.pageSize as string) || 20), 100);
    return { page, pageSize };
  }

  /**
   * Enrich the nested `post` on each queue item with author + rank data.
   * Returns a new array — originals are not mutated.
   */
  private async enrichItems(items: Record<string, any>[]) {
    const posts = items.map((i) => i.post).filter(Boolean);
    if (posts.length === 0) return items;

    const enriched = await enrichPostsWithUserData(posts, this.userClient, this.pointsClient);
    const enrichedMap = new Map(enriched.map((p: any) => [p.id, p]));

    return items.map((item) => ({
      ...item,
      post: item.post ? enrichedMap.get(item.post.id) ?? item.post : null,
    }));
  }

  // ── Public routes ────────────────────────────────────────────────────────

  /** GET /api/moderation/queue — Paginated pending queue for fact-checkers. */
  async getQueue(req: Request, res: Response) {
    const { page, pageSize } = this.parsePagination(req.query);
    const result = await this.queueService.getQueue(page, pageSize);
    const enriched = await this.enrichItems(result.items);
    return ResponseUtil.paginated(res, enriched, result.page, result.pageSize, result.total);
  }

  /** GET /api/moderation/queue/:id — Single queue item (enriched). */
  async getQueueItem(req: Request, res: Response) {
    const id = getParam(req.params.id);
    const item = await this.queueService.getQueueItem(id);
    const [enriched] = await this.enrichItems([item]);
    return ResponseUtil.success(res, enriched);
  }

  /** GET /api/moderation/queue/claimed — Posts claimed by the current user. */
  async getClaimedByMe(req: AuthRequest, res: Response) {
    const factCheckerId = req.user!.userId;
    const { page, pageSize } = this.parsePagination(req.query);
    const result = await this.queueService.getClaimedByFactChecker(factCheckerId, page, pageSize);
    const enriched = await this.enrichItems(result.items);
    return ResponseUtil.paginated(res, enriched, result.page, result.pageSize, result.total);
  }

  // ── Internal routes ──────────────────────────────────────────────────────

  /** POST /api/internal/queue/add — Add a post to the moderation queue. */
  async addToQueue(req: Request, res: Response) {
    const { postId, userId } = req.body;
    if (!postId || !userId) {
      return ResponseUtil.error(res, 'postId and userId are required', 400);
    }
    const item = await this.queueService.addToQueue(postId, userId);
    return ResponseUtil.created(res, item);
  }

  /** POST /api/internal/queue/remove — Remove a post from the moderation queue. */
  async removeFromQueue(req: Request, res: Response) {
    const { postId } = req.body;
    if (!postId) {
      return ResponseUtil.error(res, 'postId is required', 400);
    }
    await this.queueService.removeFromQueue(postId);
    return ResponseUtil.success(res, { message: 'Post removed from queue' });
  }
}
