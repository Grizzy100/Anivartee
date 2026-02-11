//server\post-service\src\middlewares\rankLimit.middleware.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import { PointsClient } from '../services/clients/points.client.js';
import { RateLimitError } from '../utils/errors.js';
import prisma from '../utils/prisma.js';

/** Shared singleton — no need to create a new client per request. */
const pointsClient = new PointsClient();

export function enforcePostLimit() {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return next(new RateLimitError('User not authenticated'));

    try {
      const rankData = await pointsClient.getUserRank(req.user.userId);
      const { postsPerDay } = rankData.limits;

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const todayPostCount = await prisma.link.count({
        where: {
          userId: req.user.userId,
          createdAt: { gte: startOfDay }
        }
      });

      if (todayPostCount >= postsPerDay) {
        throw new RateLimitError(
          `Daily post limit (${postsPerDay}) reached. Increase your rank to post more.`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export function enforceFlagLimit() {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return next(new RateLimitError('User not authenticated'));

    try {
      const rankData = await pointsClient.getUserRank(req.user.userId);
      const { flagsPerDay } = rankData.limits;

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const todayFlagCount = await prisma.linkFlag.count({
        where: {
          flaggerUserId: req.user.userId,
          createdAt: { gte: startOfDay }
        }
      });

      if (todayFlagCount >= flagsPerDay) {
        throw new RateLimitError(
          `Daily flag limit (${flagsPerDay}) reached. Increase your rank to flag more posts.`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}