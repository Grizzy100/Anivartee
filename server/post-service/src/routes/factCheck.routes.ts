//server\post-service\src\routes\factCheck.routes.ts
import { Router } from 'express';
import { FactCheckController } from '../controllers/factCheck.controller.js';
import { FactCheckService } from '../services/factCheck.service.js';
import { FactCheckRepository } from '../repositories/factCheck.repository.js';
import { PostRepository } from '../repositories/post.repository.js';
import { PointsClient } from '../services/clients/points.client.js';
import { ActivityService } from '../services/activity.service.js';
import { ActivityRepository } from '../repositories/activity.repository.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Initialize dependencies
const factCheckRepo = new FactCheckRepository();
const postRepo = new PostRepository();
const pointsClient = new PointsClient();
const activityRepo = new ActivityRepository();
const activityService = new ActivityService(activityRepo);
const factCheckService = new FactCheckService(factCheckRepo, postRepo, pointsClient, activityService);
const factCheckController = new FactCheckController(factCheckService);

// Routes (only FACT_CHECKERs can create fact-checks)
router.post('/posts/:linkId/fact-checks', 
  authenticate, 
  requireRole(['FACT_CHECKER', 'ADMIN']),
  asyncHandler((req, res) => factCheckController.createFactCheck(req, res))
);
router.get('/posts/:linkId/fact-checks', asyncHandler((req, res) => 
  factCheckController.getFactChecks(req, res)
));

export default router;