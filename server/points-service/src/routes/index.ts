import { Router } from 'express';
import healthRoutes from './health.routes.js';
import { createPointsRoutes } from './points.routes.js';
import { createInternalRoutes } from './internal.routes.js';
import { PointsController } from '../controllers/points.controller.js';
import { InternalController } from '../controllers/internal.controller.js';
import { PointsService } from '../services/points.service.js';
import { PointsRepository } from '../repositories/points.repository.js';
import { UserClient } from '../services/clients/user.client.js';
import { generalLimiter } from '../middlewares/rateLimit.middleware.js';

const router = Router();

// ─── Composition root (single instance of each dependency) ───
const pointsRepo = new PointsRepository();
const userClient = new UserClient();
const pointsService = new PointsService(pointsRepo, userClient);
const pointsController = new PointsController(pointsService);
const internalController = new InternalController(pointsService);

// Health check
router.use('/health', healthRoutes);

// Public / authenticated routes (rate-limited)
router.use('/points', generalLimiter, createPointsRoutes(pointsController));

// Internal routes — no rate limiting for service-to-service calls
router.use('/internal', createInternalRoutes(internalController));

export default router;
