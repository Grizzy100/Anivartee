import { Router } from 'express';
import { QueueController } from '../controllers/queue.controller.js';
import { QueueService } from '../services/queue.service.js';
import { QueueRepository } from '../repositories/queue.repository.js';
import { UserClient } from '../services/clients/user.client.js';
import { PointsClient } from '../services/clients/points.client.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Initialize dependencies
const queueRepo = new QueueRepository();
const queueService = new QueueService(queueRepo);
const userClient = new UserClient();
const pointsClient = new PointsClient();
const queueController = new QueueController(queueService, userClient, pointsClient);

// GET /api/moderation/queue — Paginated list of pending posts (fact-checkers + admins)
router.get(
  '/',
  authenticate,
  requireRole(['FACT_CHECKER', 'ADMIN']),
  asyncHandler((req, res) => queueController.getQueue(req, res))
);

// GET /api/moderation/queue/claimed — Posts claimed by the current user
router.get(
  '/claimed',
  authenticate,
  requireRole(['FACT_CHECKER', 'ADMIN']),
  asyncHandler((req, res) => queueController.getClaimedByMe(req, res))
);

// GET /api/moderation/queue/:id — Single queue item
router.get(
  '/:id',
  authenticate,
  requireRole(['FACT_CHECKER', 'ADMIN']),
  asyncHandler((req, res) => queueController.getQueueItem(req, res))
);

export default router;
