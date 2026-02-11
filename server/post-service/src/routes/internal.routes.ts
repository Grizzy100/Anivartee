//server\post-service\src\routes\internal.routes.ts
import { Router } from 'express';
import { InternalController } from '../controllers/internal.controller.js';
import { ActivityController } from '../controllers/activity.controller.js';
import { QueueController } from '../controllers/queue.controller.js';
import { PostService } from '../services/post.service.js';
import { FactCheckService } from '../services/factCheck.service.js';
import { ActivityService } from '../services/activity.service.js';
import { QueueService } from '../services/queue.service.js';
import { PostRepository } from '../repositories/post.repository.js';
import { FactCheckRepository } from '../repositories/factCheck.repository.js';
import { ActivityRepository } from '../repositories/activity.repository.js';
import { QueueRepository } from '../repositories/queue.repository.js';
import { PointsClient } from '../services/clients/points.client.js';
import { verifyInternalToken } from '../middlewares/internalAuth.middleware.js';

import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Initialize dependencies
const postRepo = new PostRepository();
const factCheckRepo = new FactCheckRepository();
const queueRepo = new QueueRepository();
const pointsClient = new PointsClient();
const activityRepo = new ActivityRepository();
const queueService = new QueueService(queueRepo);
const activityService = new ActivityService(activityRepo);
const postService = new PostService(postRepo, pointsClient, queueService, activityService);
const factCheckService = new FactCheckService(factCheckRepo, postRepo, pointsClient, activityService);
const internalController = new InternalController(postService, factCheckService);
const activityController = new ActivityController(activityService);
const queueController = new QueueController(queueService);

// All internal routes require service token
router.use(verifyInternalToken);

// Routes
router.get('/posts/:id', asyncHandler((req, res) => 
  internalController.getPost(req, res)
));
router.patch('/posts/:id/status', asyncHandler((req, res) => 
  internalController.updatePostStatus(req, res)
));
router.post('/posts/:linkId/fact-checks', asyncHandler((req, res) => 
  internalController.saveFactCheck(req, res)
));

// ─── Activity tracking (internal) ───
router.post('/activity/record', asyncHandler((req, res) =>
  activityController.record(req, res)
));
router.get('/activity/:userId/calendar', asyncHandler((req, res) =>
  activityController.getCalendarInternal(req, res)
));

// ─── Queue management (internal — called by PostService inline now) ───
router.post('/queue/add', asyncHandler((req, res) =>
  queueController.addToQueue(req, res)
));
router.post('/queue/remove', asyncHandler((req, res) =>
  queueController.removeFromQueue(req, res)
));

export default router;