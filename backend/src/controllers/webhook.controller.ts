import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { Decimal } from '@prisma/client/runtime/library';
import stripeService from '../services/payment/stripe.service';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import prisma from '../config/database';
import { env } from '../config/env';
import logger from '../utils/logger';

export class WebhookController {
  async stripeWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const event = stripeService.verifyWebhookSignature(req.body, signature);

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handleStripePaymentSuccess(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await this.handleStripePaymentFailed(event.data.object);
          break;

        case 'charge.refunded':
          await this.handleStripeRefund(event.data.object);
          break;

        default:
          logger.info('Unhandled Stripe webhook event type', { eventType: event.type });
      }

      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }

  private async handleStripePaymentSuccess(paymentIntent: any) {
    const giftCardId = paymentIntent.metadata?.giftCardId;
    if (!giftCardId) return;

    // Find payment by payment intent ID
    const payment = await prisma.payment.findFirst({
      where: {
        paymentIntentId: paymentIntent.id,
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
        transactionId: paymentIntent.latest_charge,
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
        } as any,
      },
    });
  }

  private async handleStripePaymentFailed(paymentIntent: any) {
    const payment = await prisma.payment.findFirst({
      where: {
        paymentIntentId: paymentIntent.id,
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

  private async handleStripeRefund(charge: any) {
    // Handle refund webhook if needed
    logger.info('Stripe refund webhook received', { chargeId: charge.id });
  }

  async razorpayWebhook(req: Request, res: Response, next: NextFunction) {
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

        default:
          logger.info('Unhandled Razorpay webhook event', { eventType: event.event });
      }

      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }

  private async handleRazorpayPaymentSuccess(payment: any) {
    const orderId = payment.order_id;
    const paymentRecord = await prisma.payment.findFirst({
      where: {
        paymentIntentId: payment.id,
        paymentMethod: PaymentMethod.RAZORPAY,
      },
    });

    if (!paymentRecord || paymentRecord.status === PaymentStatus.COMPLETED) {
      return;
    }

    await prisma.payment.update({
      where: { id: paymentRecord.id },
      data: {
        status: PaymentStatus.COMPLETED,
        transactionId: payment.id,
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
          paymentMethod: PaymentMethod.RAZORPAY,
        } as any,
      },
    });
  }

  private async handleRazorpayPaymentFailed(payment: any) {
    const paymentRecord = await prisma.payment.findFirst({
      where: {
        paymentIntentId: payment.id,
        paymentMethod: PaymentMethod.RAZORPAY,
      },
    });

    if (paymentRecord && paymentRecord.status !== PaymentStatus.FAILED) {
      await prisma.payment.update({
        where: { id: paymentRecord.id },
        data: { status: PaymentStatus.FAILED },
      });
    }
  }
}

export default new WebhookController();

