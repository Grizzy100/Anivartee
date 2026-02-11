import { Router } from 'express';
import { PointsController } from '../controllers/points.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export function createPointsRoutes(controller: PointsController): Router {
  const router = Router();

  // GET /api/points/leaderboard — Public
  router.get(
    '/leaderboard',
    asyncHandler((req, res) => controller.getLeaderboard(req, res))
  );

  // GET /api/points/me — Authenticated user's rank + balance
  router.get(
    '/me',
    authenticate,
    asyncHandler((req, res) => controller.getMyRank(req, res))
  );

  // GET /api/points/me/history — Authenticated user's points history
  router.get(
    '/me/history',
    authenticate,
    asyncHandler((req, res) => controller.getMyHistory(req, res))
  );

  return router;
}
