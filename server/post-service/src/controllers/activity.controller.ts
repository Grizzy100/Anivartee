//server\post-service\src\controllers\activity.controller.ts
import { Request, Response } from 'express';
import { ActivityService } from '../services/activity.service.js';
import { recordActivitySchema, calendarQuerySchema } from '../validators/activity.schema.js';
import { ResponseUtil } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { getParam } from '../utils/request.js';
import type { AuthRequest } from '../types/auth.types.js';

export class ActivityController {
  constructor(private activityService: ActivityService) {}

  /**
   * POST /api/internal/activity/record   (internal, x-service-token)
   * Called by post-service itself or other services to log an activity event.
   */
  async record(req: Request, res: Response) {
    try {
      const data = recordActivitySchema.parse(req.body);
      await this.activityService.recordActivity(data.userId, data.activityType);
      return ResponseUtil.success(res, { message: 'Activity recorded' });
    } catch (error: any) {
      logger.error('Record activity controller error:', error);

      if (error.name === 'ZodError') {
        return ResponseUtil.error(res, 'Validation failed', 400, 'VALIDATION_ERROR');
      }

      throw error;
    }
  }

  /**
   * GET /api/activity/calendar?year=2026&month=2   (authenticated user)
   * Returns days the user was active so the frontend can render blue dots.
   */
  async getCalendar(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { year, month } = calendarQuerySchema.parse(req.query);

      const calendar = await this.activityService.getCalendar(userId, year, month);
      return ResponseUtil.success(res, calendar);
    } catch (error: any) {
      logger.error('Get calendar controller error:', error);

      if (error.name === 'ZodError') {
        return ResponseUtil.error(res, 'Validation failed', 400, 'VALIDATION_ERROR');
      }

      throw error;
    }
  }

  /**
   * GET /api/internal/activity/:userId/calendar?year=2026&month=2   (internal)
   * Same data but for any user; intended for service-to-service calls.
   */
  async getCalendarInternal(req: Request, res: Response) {
    try {
      const userId = getParam(req.params.userId);
      const { year, month } = calendarQuerySchema.parse(req.query);

      const calendar = await this.activityService.getCalendar(userId, year, month);
      return ResponseUtil.success(res, calendar);
    } catch (error: any) {
      logger.error('Get calendar internal controller error:', error);

      if (error.name === 'ZodError') {
        return ResponseUtil.error(res, 'Validation failed', 400, 'VALIDATION_ERROR');
      }

      throw error;
    }
  }
}
