import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { SubscriptionService } from '../services/subscription.service.js';
import { startSubscriptionSchema } from '../validators/subscription.schema.js';
import { ValidationError } from '../utils/errors.js';
import { ResponseUtil } from '../utils/response.js';
import { RegionTier } from '../generated/prisma/client.js';

export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) { }

  async start(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const parseResult = startSubscriptionSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid subscription request');
    }

    const result = await this.subscriptionService.startSubscription(
      userId,
      parseResult.data.planId,
      parseResult.data.regionTier as RegionTier | undefined
    );

    return ResponseUtil.created(res, {
      checkoutUrl: result.checkoutUrl,
    });
  }

  async cancel(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const result = await this.subscriptionService.cancelSubscription(userId);
    return ResponseUtil.success(res, {
      subscription: result.subscription,
      stripeSubscriptionId: result.stripeSubscription.id,
    });
  }

  async me(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const subscription = await this.subscriptionService.getCurrentSubscriptionForUser(
      userId
    );
    return ResponseUtil.success(res, { subscription });
  }

  async createSubscription(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const parseResult = startSubscriptionSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid subscription request');
    }

    const result = await this.subscriptionService.createSubscription(
      userId,
      parseResult.data.planId,
      parseResult.data.regionTier as RegionTier | undefined
    );

    return ResponseUtil.created(res, {
      checkoutUrl: result.checkoutUrl,
    });
  }

  async renewSubscription(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const parseResult = startSubscriptionSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid subscription request');
    }

    const result = await this.subscriptionService.renewSubscription(
      userId,
      parseResult.data.planId,
      parseResult.data.regionTier as RegionTier | undefined
    );

    return ResponseUtil.success(res, {
      checkoutUrl: result.checkoutUrl,
    });
  }
}

