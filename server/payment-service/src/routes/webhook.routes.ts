import express, { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller.js';
import { StripeClient } from '../integrations/stripe.client.js';
import { SubscriptionService } from '../services/subscription.service.js';
import { UserClient } from '../services/clients/user.client.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { StripePaymentProvider } from '../services/providers/stripePaymentProvider.js';

export function createWebhookRoutes(): Router {
  const router = Router();

  const stripeClient = new StripeClient();
  const userClient = new UserClient();
  const paymentProvider = new StripePaymentProvider(stripeClient);
  const subscriptionService = new SubscriptionService(
    stripeClient,
    userClient,
    paymentProvider
  );
  const controller = new WebhookController(
    stripeClient,
    paymentProvider,
    subscriptionService
  );

  router.post(
    '/stripe',
    express.raw({ type: 'application/json' }),
    asyncHandler((req, res) => controller.handleStripeWebhook(req, res))
  );

  return router;
}

