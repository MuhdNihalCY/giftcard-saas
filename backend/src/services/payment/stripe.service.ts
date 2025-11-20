import Stripe from 'stripe';
import { env } from '../../config/env';
import { ValidationError } from '../../utils/errors';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export interface CreatePaymentIntentData {
  amount: number;
  currency: string;
  giftCardId: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

export interface ConfirmPaymentData {
  paymentIntentId: string;
  paymentMethodId?: string;
}

export class StripeService {
  /**
   * Create payment intent
   */
  async createPaymentIntent(data: CreatePaymentIntentData) {
    const { amount, currency, giftCardId, customerId, metadata = {} } = data;

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        customer: customerId,
        metadata: {
          giftCardId,
          ...metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
      };
    } catch (error: any) {
      throw new ValidationError(`Stripe error: ${error.message}`);
    }
  }

  /**
   * Confirm payment intent
   */
  async confirmPaymentIntent(data: ConfirmPaymentData) {
    const { paymentIntentId, paymentMethodId } = data;

    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      });

      return {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        transactionId: paymentIntent.latest_charge as string,
      };
    } catch (error: any) {
      throw new ValidationError(`Stripe confirmation error: ${error.message}`);
    }
  }

  /**
   * Retrieve payment intent
   */
  async getPaymentIntent(paymentIntentId: string) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convert from cents
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata,
        transactionId: paymentIntent.latest_charge as string,
      };
    } catch (error: any) {
      throw new ValidationError(`Stripe retrieval error: ${error.message}`);
    }
  }

  /**
   * Process refund
   */
  async refundPayment(paymentIntentId: string, amount?: number) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      const chargeId = paymentIntent.latest_charge as string;

      if (!chargeId) {
        throw new ValidationError('No charge found for this payment intent');
      }

      const refund = await stripe.refunds.create({
        charge: chargeId,
        amount: amount ? Math.round(amount * 100) : undefined, // Partial refund if amount specified
      });

      return {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
      };
    } catch (error: any) {
      throw new ValidationError(`Stripe refund error: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
    try {
      return stripe.webhooks.constructEvent(
        payload,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error: any) {
      throw new ValidationError(`Webhook signature verification failed: ${error.message}`);
    }
  }
}

export default new StripeService();

