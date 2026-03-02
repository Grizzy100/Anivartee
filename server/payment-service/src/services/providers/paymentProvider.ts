import type Stripe from 'stripe';

export type ProviderType = 'STRIPE' | 'RAZORPAY';

export type ProviderEventType =
  | 'PAYMENT_SUCCEEDED'
  | 'PAYMENT_FAILED'
  | 'SUBSCRIPTION_CANCELED';

export interface ProviderPaymentInitArgs {
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}

export interface ProviderPaymentInitResult {
  provider: ProviderType;
  providerRef: string;
  /// For client-side integrations using PaymentIntents or Checkout
  clientSecret?: string;
  checkoutUrl?: string;
}

export interface ProviderWebhookResult {
  provider: ProviderType;
  providerRef: string;
  eventType: ProviderEventType;
  billingCountry?: string | null;
  raw: Stripe.Event;
}

export interface PaymentProvider {
  /**
   * Initialize a new payment for a subscription period.
   * For Stripe this may be implemented via a Subscription or PaymentIntent/Checkout session.
   */
  createInitialPayment(
    args: ProviderPaymentInitArgs
  ): Promise<ProviderPaymentInitResult>;

  /**
   * Normalize a raw provider event (e.g. Stripe.Event) into a domain-level webhook result.
   */
  parseWebhookEvent(event: Stripe.Event): ProviderWebhookResult | null;
}

