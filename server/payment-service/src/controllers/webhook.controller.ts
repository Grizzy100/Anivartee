import { Request, Response } from 'express';
import { StripeClient } from '../integrations/stripe.client.js';
import { SubscriptionService } from '../services/subscription.service.js';
import { ResponseUtil } from '../utils/response.js';
import type { PaymentProvider } from '../services/providers/paymentProvider.js';

export class WebhookController {
  constructor(
    private stripeClient: StripeClient,
    private paymentProvider: PaymentProvider,
    private subscriptionService: SubscriptionService
  ) {}

  async handleStripeWebhook(req: Request, res: Response) {
      const sigHeader = req.headers['stripe-signature'];
      const sig = Array.isArray(sigHeader) ? sigHeader[0] : sigHeader;
      if (!sig) {
        return ResponseUtil.error(
          res,
          'Missing Stripe signature',
          400,
          'MISSING_SIGNATURE'
        );
      }

      const payload = req.body as Buffer;

      const event = this.stripeClient.constructWebhookEvent(payload, sig);
      const normalized = this.paymentProvider.parseWebhookEvent(event);

    if (normalized) {
      await this.subscriptionService.handleProviderWebhook(normalized);
    }

    return ResponseUtil.success(res, { received: true });
  }
}

