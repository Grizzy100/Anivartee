//server\post-service\src\routes\post.routes.ts
import { Router } from 'express';
import { PostController } from '../controllers/post.controller.js';
import { PostService } from '../services/post.service.js';
import { PostRepository } from '../repositories/post.repository.js';
import { PointsClient } from '../services/clients/points.client.js';
import { UserClient } from '../services/clients/user.client.js';
import { QueueService } from '../services/queue.service.js';
import { QueueRepository } from '../repositories/queue.repository.js';
import { ActivityService } from '../services/activity.service.js';
import { ActivityRepository } from '../repositories/activity.repository.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ResponseUtil } from '../utils/response.js';
import { redis } from '../utils/redis.js';
import { logger } from '../utils/logger.js';
import type { AuthRequest } from '../types/auth.types.js';

const router = Router();

// Initialize dependencies
const postRepo = new PostRepository();
const pointsClient = new PointsClient();
const userClient = new UserClient();
const queueRepo = new QueueRepository();
const queueService = new QueueService(queueRepo);
const activityRepo = new ActivityRepository();
const activityService = new ActivityService(activityRepo);
const postService = new PostService(postRepo, pointsClient, queueService, activityService, userClient);
const postController = new PostController(postService);

// ─── Achievement computation helpers ─────────────────────────────────────────

/** Returns true when dates contains today AND the previous N-1 days consecutively. */
function hasConsecutiveStreak(sortedDates: string[], days: number): boolean {
    if (sortedDates.length < days) return false;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const dateSet = new Set(sortedDates);
    for (let i = 0; i < days; i++) {
        const d = new Date(today);
        d.setUTCDate(d.getUTCDate() - i);
        if (!dateSet.has(d.toISOString().slice(0, 10))) return false;
    }
    return true;
}

/** Return unique posting days within the last N calendar days. */
function uniqueDaysInLast(sortedDates: string[], days: number): number {
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - days);
    cutoff.setUTCHours(0, 0, 0, 0);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return sortedDates.filter(d => d >= cutoffStr).length;
}

// ─── Routes ──────────────────────────────────────────────────────────────────

router.post('/', authenticate, asyncHandler((req, res) => postController.createPost(req, res)));
router.get('/user/:userId/stats', asyncHandler((req, res) => postController.getUserStats(req, res)));
router.get('/user/:userId', asyncHandler((req, res) => postController.getUserPosts(req, res)));

/** GET /api/posts/me/achievements — Returns unlocked achievement keys for the current user. */
router.get('/me/achievements', authenticate, asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!.userId;
    const cacheKey = `achievements:${userId}`;

    // Cache for 5 minutes — achievements are not real-time critical
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) {
        try {
            return ResponseUtil.success(res, JSON.parse(cached));
        } catch { /* fall through on parse error */ }
    }

    const [postDates, totalPosts] = await Promise.all([
        postRepo.getPostDatesForUser(userId),
        postRepo.countUserPosts(userId),
    ]);

    const unlocked: string[] = [];

    // FIRST_POST — exactly 1 post AND it was created in the last 24h
    if (totalPosts === 1 && postDates.length === 1) {
        const today = new Date().toISOString().slice(0, 10);
        const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
        if (postDates[0] === today || postDates[0] === yesterday) {
            unlocked.push('FIRST_POST');
        }
    }

    // STREAK_7_DAYS — posted on each of the last 7 consecutive calendar days
    if (hasConsecutiveStreak(postDates, 7)) unlocked.push('STREAK_7_DAYS');

    // STREAK_1_MONTH — posted on ≥20 unique days within the last 30 days
    if (uniqueDaysInLast(postDates, 30) >= 20) unlocked.push('STREAK_1_MONTH');

    // PROLIFIC_25 — edge case: user has 25+ total posts
    if (totalPosts >= 25) unlocked.push('PROLIFIC_25');

    const result = { unlocked };
    await redis.setex(cacheKey, 300, JSON.stringify(result)).catch(err => logger.warn('Achievement cache write failed:', err));

    return ResponseUtil.success(res, result);
}));

router.get('/:id', optionalAuth, asyncHandler((req, res) => postController.getPost(req, res)));
router.patch('/:id', authenticate, asyncHandler((req, res) => postController.updatePost(req, res)));
router.delete('/:id', authenticate, asyncHandler((req, res) => postController.deletePost(req, res)));

export default router;