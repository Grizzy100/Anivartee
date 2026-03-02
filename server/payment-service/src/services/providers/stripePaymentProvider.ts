import type Stripe from 'stripe';
import { StripeClient } from '../../integrations/stripe.client.js';
import {
  type PaymentProvider,
  type ProviderPaymentInitArgs,
  type ProviderPaymentInitResult,
  type ProviderWebhookResult,
} from './paymentProvider.js';

export class StripePaymentProvider implements PaymentProvider {
  constructor(private stripeClient: StripeClient) { }

  async createInitialPayment(
    args: ProviderPaymentInitArgs
  ): Promise<ProviderPaymentInitResult> {
    // For now we rely on Stripe Subscriptions created directly via SubscriptionService.
    // This method is a placeholder for future PaymentIntent / Checkout-based flows.
    // We still return a minimal structure so the interface is satisfied.
    return {
      provider: 'STRIPE',
      providerRef: '',
    };
  }

  parseWebhookEvent(event: Stripe.Event): ProviderWebhookResult | null {
    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        const subscriptionId =
          typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription?.id ?? null;
        const country =
          invoice.customer_address?.country ??
          invoice.customer_shipping?.address?.country ??
          null;

        if (!subscriptionId) {
          return null;
        }

        return {
          provider: 'STRIPE',
          providerRef: subscriptionId,
          eventType: 'PAYMENT_SUCCEEDED',
          billingCountry: country,
          raw: event,
        };
      }
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id ?? null;

        const country = session.customer_details?.address?.country ?? null;

        if (!subscriptionId) {
          return null; // One-time payments not handled here
        }

        return {
          provider: 'STRIPE',
          providerRef: subscriptionId,
          eventType: 'PAYMENT_SUCCEEDED',
          billingCountry: country,
          raw: event,
        };
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const subscriptionId =
          typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription?.id ?? null;
        const country =
          invoice.customer_address?.country ??
          invoice.customer_shipping?.address?.country ??
          null;

        if (!subscriptionId) {
          return null;
        }

        return {
          provider: 'STRIPE',
          providerRef: subscriptionId,
          eventType: 'PAYMENT_FAILED',
          billingCountry: country,
          raw: event,
        };
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        return {
          provider: 'STRIPE',
          providerRef: subscription.id,
          eventType: 'SUBSCRIPTION_CANCELED',
          billingCountry: null,
          raw: event,
        };
      }
      default:
        return null;
    }
  }
}

