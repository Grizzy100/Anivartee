import { Router } from 'express';
import healthRoutes from './health.routes.js';
import { createSubscriptionRoutes } from './subscription.routes.js';
import { createInternalRoutes } from './internal.routes.js';
import { createWebhookRoutes } from './webhook.routes.js';
import { createEntitlementsRoutes } from './entitlements.routes.js';
import { SubscriptionController } from '../controllers/subscription.controller.js';
import { SubscriptionService } from '../services/subscription.service.js';
import { StripeClient } from '../integrations/stripe.client.js';
import { UserClient } from '../services/clients/user.client.js';
import { generalLimiter } from '../middlewares/rateLimit.middleware.js';
import { StripePaymentProvider } from '../services/providers/stripePaymentProvider.js';
import { EntitlementsController } from '../controllers/entitlements.controller.js';
import { EntitlementsService } from '../services/entitlements.service.js';

const router = Router();

const stripeClient = new StripeClient();
const userClient = new UserClient();
const paymentProvider = new StripePaymentProvider(stripeClient);
const subscriptionService = new SubscriptionService(
  stripeClient,
  userClient,
  paymentProvider
);
const subscriptionController = new SubscriptionController(subscriptionService);
const entitlementsService = new EntitlementsService();
const entitlementsController = new EntitlementsController(entitlementsService);

router.use('/health', healthRoutes);

router.use(
  '/subscriptions',
  generalLimiter,
  createSubscriptionRoutes(subscriptionController)
);

router.use('/internal', createInternalRoutes());

router.use('/webhooks', createWebhookRoutes());

router.use(
  '/entitlements',
  createEntitlementsRoutes(entitlementsController)
);

export default router;

