import { Request, Response } from 'express';
import { SubscriptionService } from '../services/subscription.service.js';
import { ResponseUtil } from '../utils/response.js';

export class InternalController {
  constructor(private subscriptionService: SubscriptionService) { }

  async getUserSubscription(req: Request, res: Response) {
    const userId = req.params.userId;
    const subscription =
      await this.subscriptionService.getCurrentSubscriptionForUser(userId as string);
    return ResponseUtil.success(res, { subscription });
  }
}

