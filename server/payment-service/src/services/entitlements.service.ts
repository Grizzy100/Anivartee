import prisma from '../utils/prisma.js';
import { SubscriptionStatus } from '../generated/prisma/client.js';

export interface SubscriptionEntitlements {
  extraPosts: number;
  extraEdits: number;
  hasAnalytics: boolean;
  hasDrafts: boolean;
  hasProBadge: boolean;
}

const NO_ENTITLEMENTS: SubscriptionEntitlements = {
  extraPosts: 0,
  extraEdits: 0,
  hasAnalytics: false,
  hasDrafts: false,
  hasProBadge: false,
};

export class EntitlementsService {
  async getEntitlementsForUser(userId: string): Promise<SubscriptionEntitlements> {
    const now = new Date();

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: {
          gt: now,
        },
      },
    });

    if (!subscription) {
      return NO_ENTITLEMENTS;
    }

    return {
      extraPosts: 1,
      extraEdits: 1,
      hasAnalytics: true,
      hasDrafts: true,
      hasProBadge: true,
    };
  }
}

