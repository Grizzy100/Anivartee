import type Stripe from 'stripe';
import { env } from '../config/env.js';
import prisma from '../utils/prisma.js';
import { StripeClient } from '../integrations/stripe.client.js';
import { UserClient } from './clients/user.client.js';
import { logger } from '../utils/logger.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import {
  type PaymentProvider,
  type ProviderWebhookResult,
} from './providers/paymentProvider.js';
import { RegionTier } from '../generated/prisma/client.js';

export class SubscriptionService {
  constructor(
    private stripeClient: StripeClient,
    private userClient: UserClient,
    private paymentProvider: PaymentProvider
  ) { }

  async createOrGetCustomerForUser(userId: string) {
    const existing = await prisma.userPaymentCustomer.findUnique({
      where: { userId },
    });
    if (existing) return existing;

    const user = await this.userClient.getUserById(userId);
    if (!user || !user.email) {
      throw new ValidationError('User email is required to create a customer');
    }

    const customer = await this.stripeClient.createCustomer({
      email: user.email,
      metadata: { userId },
    });

    return prisma.userPaymentCustomer.create({
      data: {
        userId,
        stripeCustomerId: customer.id,
      },
    });
  }

  async startSubscription(userId: string, planId: string, regionTier?: RegionTier) {
    let plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    // Auto-seed the Pro Plan if it doesn't exist
    if (!plan && planId === '550e8400-e29b-41d4-a716-446655440000') {
      logger.info('Auto-seeding Pro plan and regional prices...');
      plan = await prisma.subscriptionPlan.create({
        data: {
          id: planId,
          name: 'Pro',
          description: 'Advanced Analytics and More',
          interval: 'MONTHLY',
          stripePriceId: 'price_1xxxxxxxxxxxxx_global', // fallback
        }
      });

      const regionalPrices = [
        { region: RegionTier.IN, amount: 60, currency: "INR", stripePriceId: env.STRIPE_PRICE_ID_IN || 'price_1xxxxxxxxxxxxx_in' },
        { region: RegionTier.SEA, amount: 500, currency: "USD", stripePriceId: env.STRIPE_PRICE_ID_SEA || 'price_1xxxxxxxxxxxxx_sea' },
        { region: RegionTier.GLOBAL, amount: 1000, currency: "USD", stripePriceId: env.STRIPE_PRICE_ID_GLOBAL || 'price_1xxxxxxxxxxxxx_global' },
        { region: RegionTier.EU, amount: 800, currency: "EUR", stripePriceId: env.STRIPE_PRICE_ID_EU || 'price_1xxxxxxxxxxxxx_eu' },
        { region: RegionTier.JP, amount: 500, currency: "JPY", stripePriceId: env.STRIPE_PRICE_ID_JP || 'price_1xxxxxxxxxxxxx_jp' },
        { region: RegionTier.ME, amount: 800, currency: "USD", stripePriceId: env.STRIPE_PRICE_ID_ME || 'price_1xxxxxxxxxxxxx_me' },
      ];

      for (const rp of regionalPrices) {
        await prisma.planPrice.create({
          data: {
            planId: plan.id,
            regionTier: rp.region,
            amount: rp.amount,
            currency: rp.currency,
            stripePriceId: rp.stripePriceId,
          }
        });
      }
    }

    if (!plan || !plan.active) {
      throw new NotFoundError('Subscription plan not found or inactive');
    }

    let targetStripePriceId = plan.stripePriceId;

    if (regionTier) {
      const regionalPrice = await prisma.planPrice.findUnique({
        where: {
          planId_regionTier: {
            planId,
            regionTier
          }
        }
      });

      if (regionalPrice && regionalPrice.stripePriceId) {
        targetStripePriceId = regionalPrice.stripePriceId;
      } else {
        logger.warn(`No Stripe Price ID found for plan ${planId} in region ${regionTier}. Falling back to default GLOBAL price.`);
      }
    }

    if (!targetStripePriceId) {
      throw new ValidationError('Subscription plan is missing a generic Stripe Price ID fallback.');
    }

    const customer = await this.createOrGetCustomerForUser(userId);

    const session = await this.stripeClient.createCheckoutSession({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customer.stripeCustomerId,
      line_items: [{ price: targetStripePriceId, quantity: 1 }],
      success_url: `${env.FRONTEND_URL}/dashboard?checkout_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.FRONTEND_URL}/pricing?checkout_canceled=true`,
      metadata: {
        userId,
        planId,
        regionTier: regionTier || 'GLOBAL'
      }
    });

    if (!session.url) {
      throw new Error('Failed to create Stripe Checkout Session');
    }

    return { checkoutUrl: session.url };
  }

  async createSubscription(userId: string, planId: string, regionTier?: RegionTier) {
    return this.startSubscription(userId, planId, regionTier);
  }

  async renewSubscription(userId: string, planId: string, regionTier?: RegionTier) {
    // For now, treat renewals as starting a new subscription period
    // while keeping business logic centralized in startSubscription.
    return this.startSubscription(userId, planId, regionTier);
  }

  async cancelSubscription(userId: string) {
    const existing = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
    });

    if (!existing) {
      throw new NotFoundError('Active subscription not found');
    }

    const stripeSub = await this.stripeClient.cancelSubscription(
      existing.stripeSubscriptionId
    );

    const updated = await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        status: stripeSub.status.toUpperCase() as any,
        cancelAt: stripeSub.cancel_at
          ? new Date(stripeSub.cancel_at * 1000)
          : existing.cancelAt,
        canceledAt: stripeSub.canceled_at
          ? new Date(stripeSub.canceled_at * 1000)
          : existing.canceledAt,
      },
      include: {
        plan: true,
      },
    });

    return { subscription: updated, stripeSubscription: stripeSub };
  }

  async getCurrentSubscriptionForUser(userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: {
          in: ['ACTIVE', 'TRIALING', 'PAST_DUE'],
        },
      },
      include: {
        plan: true,
      },
    });

    return subscription;
  }

  async syncSubscriptionFromStripe(stripeSubscriptionId: string) {
    const stripeSub = await this.stripeClient.retrieveSubscription(
      stripeSubscriptionId
    );

    const periodStart = (stripeSub as any).current_period_start
      ? new Date((stripeSub as any).current_period_start * 1000)
      : null;
    const periodEnd = (stripeSub as any).current_period_end
      ? new Date((stripeSub as any).current_period_end * 1000)
      : null;

    const existing = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId },
    });

    const data = {
      userId: (stripeSub.metadata as any)?.userId ?? existing?.userId,
      customerId: existing?.customerId ?? undefined,
      planId: existing?.planId ?? undefined,
      stripeSubscriptionId: stripeSub.id,
      status: stripeSub.status.toUpperCase() as any,
      currentPeriodStart: periodStart ?? undefined,
      currentPeriodEnd: periodEnd ?? undefined,
      cancelAt: stripeSub.cancel_at
        ? new Date(stripeSub.cancel_at * 1000)
        : existing?.cancelAt,
      canceledAt: stripeSub.canceled_at
        ? new Date(stripeSub.canceled_at * 1000)
        : existing?.canceledAt,
      provider: existing?.provider ?? 'STRIPE',
      providerRef: existing?.providerRef ?? stripeSub.id,
    };

    const subscription = existing
      ? await prisma.subscription.update({
        where: { id: existing.id },
        data,
      })
      : await prisma.subscription.create({ data: data as any });

    return subscription;
  }

  async recordWebhookEvent(event: Stripe.Event) {
    try {
      const existing = await prisma.paymentEvent.findUnique({
        where: { stripeEventId: event.id },
      });

      if (existing) {
        return existing;
      }

      return await prisma.paymentEvent.create({
        data: {
          stripeEventId: event.id,
          type: event.type,
          payload: event as any,
          processedAt: new Date(),
        },
      });
    } catch (error: any) {
      logger.error('Failed to record payment event', error.message);
      throw error;
    }
  }

  async handleProviderWebhook(result: ProviderWebhookResult) {
    await this.recordWebhookEvent(result.raw);

    switch (result.eventType) {
      case 'PAYMENT_SUCCEEDED': {
        await this.handlePaymentSuccess(result);
        break;
      }
      case 'PAYMENT_FAILED': {
        await this.handlePaymentFailure(result);
        break;
      }
      case 'SUBSCRIPTION_CANCELED': {
        await this.handleSubscriptionCanceled(result);
        break;
      }
      default:
        break;
    }
  }

  private mapCountryToRegionTier(country?: string | null): RegionTier | null {
    if (!country) return null;
    const upper = country.toUpperCase();
    if (upper === 'IN') return RegionTier.IN;
    const seaCountries = new Set([
      'SG',
      'MY',
      'ID',
      'TH',
      'PH',
      'VN',
      'KH',
      'LA',
      'MM',
      'BN',
      'TL',
    ]);
    if (seaCountries.has(upper)) return RegionTier.SEA;
    return RegionTier.GLOBAL;
  }

  private async handlePaymentSuccess(result: ProviderWebhookResult) {
    const regionTier = this.mapCountryToRegionTier(result.billingCountry);

    await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.findUnique({
        where: { stripeSubscriptionId: result.providerRef },
      });

      if (!subscription) {
        logger.warn(
          'Payment success for unknown subscription',
          result.providerRef
        );
        return;
      }

      const plan = await tx.subscriptionPlan.findUnique({
        where: { id: subscription.planId },
      });
      if (!plan) {
        logger.warn(
          'Payment success for subscription with missing plan',
          subscription.id
        );
        return;
      }

      const intervalMonths = plan.interval === 'YEARLY' ? 12 : 1;
      const now = new Date();
      const currentEnd =
        subscription.currentPeriodEnd && subscription.currentPeriodEnd > now
          ? subscription.currentPeriodEnd
          : now;
      const nextEnd = new Date(currentEnd);
      nextEnd.setMonth(nextEnd.getMonth() + intervalMonths);

      await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: nextEnd,
          regionTier: subscription.regionTier ?? regionTier ?? undefined,
          provider: 'STRIPE',
          providerRef: subscription.providerRef ?? result.providerRef,
        },
      });
    });
  }

  private async handlePaymentFailure(result: ProviderWebhookResult) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: result.providerRef },
      data: {
        status: 'PAST_DUE',
      },
    });
  }

  private async handleSubscriptionCanceled(result: ProviderWebhookResult) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: result.providerRef },
      data: {
        status: 'CANCELED',
        cancelAt: new Date(),
      },
    });
  }

  async expirePastSubscriptions(referenceDate: Date = new Date()) {
    await prisma.subscription.updateMany({
      where: {
        status: 'ACTIVE',
        currentPeriodEnd: {
          lt: referenceDate,
        },
      },
      data: {
        status: 'INCOMPLETE_EXPIRED',
      },
    });
  }
}

