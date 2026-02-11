import { Router } from 'express';
import { InternalController } from '../controllers/internal.controller.js';
import { verifyInternalToken } from '../middlewares/internalAuth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export function createInternalRoutes(controller: InternalController): Router {
  const router = Router();

  // All internal routes require service token
  router.use(verifyInternalToken);

  // GET /api/internal/users/:userId/rank — Get user rank data
  router.get(
    '/users/:userId/rank',
    asyncHandler((req, res) => controller.getUserRank(req, res))
  );

  // POST /api/internal/points/award — Award points
  router.post(
    '/points/award',
    asyncHandler((req, res) => controller.awardPoints(req, res))
  );

  return router;
}
