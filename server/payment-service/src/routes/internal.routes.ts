import { StripePaymentProvider } from '../services/providers/stripePaymentProvider.js';
import { Router } from 'express';
import { InternalController } from '../controllers/internal.controller.js';
import { SubscriptionService } from '../services/subscription.service.js';
import { StripeClient } from '../integrations/stripe.client.js';
import { UserClient } from '../services/clients/user.client.js';
import { verifyInternalToken } from '../middlewares/internalAuth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export function createInternalRoutes(controller?: InternalController): Router {
  const router = Router();

  const stripeClient = new StripeClient();
  const userClient = new UserClient();
  const paymentProvider = new StripePaymentProvider(stripeClient);
  const subscriptionService = new SubscriptionService(stripeClient, userClient, paymentProvider);
  const internalController =
    controller ?? new InternalController(subscriptionService);

  router.get(
    '/users/:userId/subscription',
    verifyInternalToken,
    asyncHandler((req, res) => internalController.getUserSubscription(req, res))
  );

  return router;
}

