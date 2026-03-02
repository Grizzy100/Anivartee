import { Router } from 'express';
import { EntitlementsController } from '../controllers/entitlements.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyInternalToken } from '../middlewares/internalAuth.middleware.js';

export function createEntitlementsRoutes(
  controller: EntitlementsController
): Router {
  const router = Router();

  router.get(
    '/:userId',
    verifyInternalToken,
    asyncHandler((req, res) => controller.getUserEntitlements(req, res))
  );

  return router;
}

