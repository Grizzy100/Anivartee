import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export function createSubscriptionRoutes(
  controller: SubscriptionController
): Router {
  const router = Router();

  // New canonical endpoints
  router.post(
    '/',
    authenticate,
    asyncHandler((req, res) => controller.createSubscription(req, res))
  );

  router.post(
    '/renew',
    authenticate,
    asyncHandler((req, res) => controller.renewSubscription(req, res))
  );

  // Backwards-compatible legacy endpoints
  router.post(
    '/start',
    authenticate,
    asyncHandler((req, res) => controller.start(req, res))
  );

  router.post(
    '/cancel',
    authenticate,
    asyncHandler((req, res) => controller.cancel(req, res))
  );

  router.get(
    '/me',
    authenticate,
    asyncHandler((req, res) => controller.me(req, res))
  );

  return router;
}

