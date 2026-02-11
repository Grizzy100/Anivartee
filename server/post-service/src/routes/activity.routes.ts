//server\post-service\src\routes\activity.routes.ts
import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller.js';
import { ActivityService } from '../services/activity.service.js';
import { ActivityRepository } from '../repositories/activity.repository.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Initialize dependencies
const activityRepo = new ActivityRepository();
const activityService = new ActivityService(activityRepo);
const activityController = new ActivityController(activityService);

// ─── Public (authenticated) routes ───
// GET /api/activity/calendar?year=2026&month=2
router.get(
  '/calendar',
  authenticate,
  asyncHandler((req, res) => activityController.getCalendar(req, res))
);

export default router;
