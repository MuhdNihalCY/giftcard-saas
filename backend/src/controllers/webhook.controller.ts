import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { Decimal } from '@prisma/client/runtime/library';
import stripeService from '../services/payment/stripe.service';
import chargebackService from '../services/chargeback.service';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import prisma from '../config/database';
import { env } from '../config/env';
import logger from '../utils/logger';

export class WebhookController {
  async stripeWebhook(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const event = stripeService.verifyWebhookSignature(req.body, signature);

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handleStripePaymentSuccess(event.data.object as unknown as Record<string, unknown>);
          break;

        case 'payment_intent.payment_failed':
          await this.handleStripePaymentFailed(event.data.object as unknown as Record<string, unknown>);
          break;

        case 'charge.refunded':
          await this.handleStripeRefund(event.data.object as unknown as Record<string, unknown>);
          break;

        case 'charge.dispute.created':
        case 'chargeback.created':
          await this.handleStripeChargeback(event.data.object as unknown as Record<string, unknown>);
          break;

        default:
          logger.info('Unhandled Stripe webhook event type', { eventType: event.type });
      }

      return res.json({ received: true });
    } catch (error) {
      return next(error);
    }
  }

  private async handleStripePaymentSuccess(paymentIntent: Record<string, unknown>): Promise<void> {
    const metadata = paymentIntent.metadata as Record<string, unknown> | undefined;
    const giftCardId = metadata?.giftCardId as string | undefined;
    if (!giftCardId) return;

    const paymentIntentId = paymentIntent.id as string | undefined;
    if (!paymentIntentId) return;

    // Find payment by payment intent ID
    const payment = await prisma.payment.findFirst({
      where: {
        paymentIntentId,
        paymentMethod: PaymentMethod.STRIPE,
      },
    });

    if (!payment || payment.status === PaymentStatus.COMPLETED) {
      return;
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        transactionId: (paymentIntent.latest_charge as string | undefined) || null,
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        giftCardId: payment.giftCardId,
        type: 'PURCHASE',
        amount: payment.amount,
        balanceBefore: new Decimal(0),
        balanceAfter: payment.amount,
        userId: payment.customerId || null,
        metadata: {
          paymentId: payment.id,
          paymentMethod: PaymentMethod.STRIPE,
        } satisfies { paymentId: string; paymentMethod: PaymentMethod },
      },
    });
  }

  private async handleStripePaymentFailed(paymentIntent: Record<string, unknown>): Promise<void> {
    const paymentIntentId = paymentIntent.id as string | undefined;
    if (!paymentIntentId) return;
    
    const payment = await prisma.payment.findFirst({
      where: {
        paymentIntentId,
        paymentMethod: PaymentMethod.STRIPE,
      },
    });

    if (payment && payment.status !== PaymentStatus.FAILED) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });
    }
  }

  private async handleStripeRefund(charge: Record<string, unknown>): Promise<void> {
    // Handle refund webhook if needed
    const chargeId = charge.id as string | undefined;
    if (chargeId) {
      logger.info('Stripe refund webhook received', { chargeId });
    }
  }

  private async handleStripeChargeback(dispute: Record<string, unknown>): Promise<void> {
    try {
      const disputeId = dispute.id as string | undefined;
      const chargeId = dispute.charge as string | undefined;
      const amount = dispute.amount as number | undefined;
      const currency = dispute.currency as string | undefined;
      const reason = dispute.reason as string | undefined;

      if (!disputeId || !chargeId || !amount) {
        logger.warn('Invalid chargeback webhook data', { disputeId, chargeId });
        return;
      }

      // Find payment by charge ID (transaction ID)
      const payment = await prisma.payment.findFirst({
        where: {
          transactionId: chargeId,
          paymentMethod: PaymentMethod.STRIPE,
        },
      });

      if (!payment) {
        logger.warn('Payment not found for chargeback', { chargeId, disputeId });
        return;
      }

      // Convert amount from cents to dollars
      const chargebackAmount = amount / 100;
      const fee = (dispute.balance_transaction as Record<string, unknown>)?.fee
        ? Number((dispute.balance_transaction as Record<string, unknown>).fee) / 100
        : 0;

      await chargebackService.handleChargeback({
        paymentId: payment.id,
        paymentMethod: PaymentMethod.STRIPE,
        chargebackId: disputeId,
        amount: chargebackAmount,
        currency: currency || 'USD',
        reason: reason || 'Chargeback received from Stripe',
        fee,
        disputeId,
      });

      logger.info('Stripe chargeback processed', { disputeId, paymentId: payment.id });
    } catch (error: any) {
      logger.error('Error handling Stripe chargeback', { error: error.message });
    }
  }

  async razorpayWebhook(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const event = req.body;

      // Verify webhook signature
      const text = JSON.stringify(req.body);
      const signature = req.headers['x-razorpay-signature'] as string;

      const expectedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      if (signature !== expectedSignature) {
        return res.status(400).json({ error: 'Invalid signature' });
      }

      // Handle different event types
      switch (event.event) {
        case 'payment.captured':
          await this.handleRazorpayPaymentSuccess(event.payload.payment.entity);
          break;

        case 'payment.failed':
          await this.handleRazorpayPaymentFailed(event.payload.payment.entity);
          break;

        case 'payment.dispute.created':
        case 'chargeback.created':
          await this.handleRazorpayChargeback(event.payload.dispute?.entity || event.payload.chargeback?.entity);
          break;

        default:
          logger.info('Unhandled Razorpay webhook event', { eventType: event.event });
      }

      return res.json({ received: true });
    } catch (error) {
      return next(error);
    }
  }

  private async handleRazorpayPaymentSuccess(payment: Record<string, unknown>): Promise<void> {
    const paymentId = payment.id as string | undefined;
    if (!paymentId) return;
    
    // Check for both Razorpay and UPI payments (UPI uses Razorpay infrastructure)
    const paymentMethod = (payment.method as string)?.toLowerCase() === 'upi' 
      ? PaymentMethod.UPI 
      : PaymentMethod.RAZORPAY;
    
    const paymentRecord = await prisma.payment.findFirst({
      where: {
        paymentIntentId: paymentId,
        paymentMethod: {
          in: [PaymentMethod.RAZORPAY, PaymentMethod.UPI],
        },
      },
    });

    if (!paymentRecord || paymentRecord.status === PaymentStatus.COMPLETED) {
      return;
    }

    await prisma.payment.update({
      where: { id: paymentRecord.id },
      data: {
        status: PaymentStatus.COMPLETED,
        transactionId: paymentId,
      },
    });

    await prisma.transaction.create({
      data: {
        giftCardId: paymentRecord.giftCardId,
        type: 'PURCHASE',
        amount: paymentRecord.amount,
        balanceBefore: new Decimal(0),
        balanceAfter: paymentRecord.amount,
        userId: paymentRecord.customerId || null,
        metadata: {
          paymentId: paymentRecord.id,
          paymentMethod: paymentRecord.paymentMethod,
        } satisfies { paymentId: string; paymentMethod: PaymentMethod },
      },
    });
  }

  private async handleRazorpayPaymentFailed(payment: Record<string, unknown>): Promise<void> {
    const paymentId = payment.id as string | undefined;
    if (!paymentId) return;
    
    // Check for both Razorpay and UPI payments
    const paymentRecord = await prisma.payment.findFirst({
      where: {
        paymentIntentId: paymentId,
        paymentMethod: {
          in: [PaymentMethod.RAZORPAY, PaymentMethod.UPI],
        },
      },
    });

    if (paymentRecord && paymentRecord.status !== PaymentStatus.FAILED) {
      await prisma.payment.update({
        where: { id: paymentRecord.id },
        data: { status: PaymentStatus.FAILED },
      });
    }
  }

  private async handleRazorpayChargeback(dispute: Record<string, unknown>): Promise<void> {
    try {
      const disputeId = dispute.id as string | undefined;
      const paymentId = dispute.payment_id as string | undefined;
      const amount = dispute.amount as number | undefined;
      const currency = dispute.currency as string | undefined;
      const reason = dispute.reason as string | undefined;

      if (!disputeId || !paymentId || !amount) {
        logger.warn('Invalid Razorpay chargeback data', { disputeId, paymentId });
        return;
      }

      // Find payment
      const payment = await prisma.payment.findFirst({
        where: {
          paymentIntentId: paymentId,
          paymentMethod: {
            in: [PaymentMethod.RAZORPAY, PaymentMethod.UPI],
          },
        },
      });

      if (!payment) {
        logger.warn('Payment not found for chargeback', { paymentId, disputeId });
        return;
      }

      // Convert amount from paise to rupees
      const chargebackAmount = amount / 100;
      const fee = dispute.fee ? Number(dispute.fee) / 100 : 0;

      await chargebackService.handleChargeback({
        paymentId: payment.id,
        paymentMethod: payment.paymentMethod,
        chargebackId: disputeId,
        amount: chargebackAmount,
        currency: currency || 'INR',
        reason: reason || 'Chargeback received from Razorpay',
        fee,
        disputeId,
      });

      logger.info('Razorpay chargeback processed', { disputeId, paymentId: payment.id });
    } catch (error: any) {
      logger.error('Error handling Razorpay chargeback', { error: error.message });
    }
  }
}

export default new WebhookController();

