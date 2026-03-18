import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { Decimal } from '@prisma/client/runtime/library';
import stripeService from '../services/payment/stripe.service';
import paypalService from '../services/payment/paypal.service';
import { PaymentMethod, PaymentStatus, PayoutStatus } from '@prisma/client';
import { env } from '../config/env';
import { PaymentRepository } from '../modules/payments/payment.repository';
import { PayoutRepository } from '../modules/payouts/payout.repository';
import { GiftCardRepository } from '../modules/gift-cards/gift-card.repository';
import logger from '../utils/logger';

const paymentRepository = new PaymentRepository();
const payoutRepository = new PayoutRepository();
const giftCardRepository = new GiftCardRepository();

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

        case 'payout.paid':
        case 'payout.failed':
        case 'payout.canceled':
          await this.handleStripePayoutStatus(event.data.object as unknown as Record<string, unknown>, event.type);
          break;

        case 'account.updated':
          await this.handleStripeAccountUpdate(event.data.object as unknown as Record<string, unknown>);
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

    // Find payment by payment intent ID (with gift card balance)
    const payment = await paymentRepository.findPaymentByIntentIdWithGiftCard(paymentIntentId, PaymentMethod.STRIPE);

    if (!payment || payment.status === PaymentStatus.COMPLETED) {
      return;
    }

    // Update payment status
    await paymentRepository.updatePayment(payment.id, {
      status: PaymentStatus.COMPLETED,
      transactionId: (paymentIntent.latest_charge as string | undefined) || null,
    });

    const balanceBefore = payment.giftCard?.balance ?? new Decimal(0);
    const balanceAfter = (payment.giftCard?.balance ?? new Decimal(0)).add(payment.amount);

    // Create transaction record
    await paymentRepository.createTransaction({
      giftCardId: payment.giftCardId,
      type: 'PURCHASE',
      amount: payment.amount,
      balanceBefore,
      balanceAfter,
      userId: payment.customerId || null,
      metadata: {
        paymentId: payment.id,
        paymentMethod: PaymentMethod.STRIPE,
      } satisfies { paymentId: string; paymentMethod: PaymentMethod },
    });
  }

  private async handleStripePaymentFailed(paymentIntent: Record<string, unknown>): Promise<void> {
    const paymentIntentId = paymentIntent.id as string | undefined;
    if (!paymentIntentId) return;
    
    const payment = await paymentRepository.findPaymentByIntentIdAndMethod(paymentIntentId, PaymentMethod.STRIPE);

    if (payment && payment.status !== PaymentStatus.FAILED) {
      await paymentRepository.updatePayment(payment.id, { status: PaymentStatus.FAILED });
    }
  }

  private async handleStripeRefund(charge: Record<string, unknown>): Promise<void> {
    const chargeId = charge.id as string | undefined;
    if (!chargeId) return;

    const payment = await paymentRepository.findPaymentByTransactionId(chargeId);
    if (!payment || payment.status === PaymentStatus.REFUNDED) {
      logger.info('Stripe refund: payment not found or already refunded', { chargeId });
      return;
    }

    const amountRefunded = (charge.amount_refunded as number) / 100; // cents → dollars
    const giftCard = payment.giftCard;

    await paymentRepository.updatePayment(payment.id, { status: PaymentStatus.REFUNDED });

    if (giftCard) {
      const balanceBefore = giftCard.balance;
      const newBalance = new Decimal(Math.max(0, Number(balanceBefore) - amountRefunded));

      await giftCardRepository.update(giftCard.id, {
        balance: newBalance,
        ...(Number(newBalance) <= 0 ? { status: 'CANCELLED' as any } : {}),
      });

      await payoutRepository.decrementMerchantBalance(giftCard.merchantId, new Decimal(amountRefunded));

      await paymentRepository.createTransaction({
        giftCardId: giftCard.id,
        type: 'REFUND',
        amount: new Decimal(amountRefunded),
        balanceBefore,
        balanceAfter: newBalance,
        userId: payment.customerId || null,
        metadata: { paymentId: payment.id, chargeId, source: 'stripe_webhook' },
      });
    }

    logger.info('Stripe refund processed via webhook', { chargeId, paymentId: payment.id, amountRefunded });
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
    
    const paymentRecord = await paymentRepository.findPaymentByIntentIdWithGiftCard(paymentId, PaymentMethod.RAZORPAY);

    if (!paymentRecord || paymentRecord.status === PaymentStatus.COMPLETED) {
      return;
    }

    await paymentRepository.updatePayment(paymentRecord.id, {
      status: PaymentStatus.COMPLETED,
      transactionId: paymentId,
    });

    const balanceBefore = paymentRecord.giftCard?.balance ?? new Decimal(0);
    const balanceAfter = (paymentRecord.giftCard?.balance ?? new Decimal(0)).add(paymentRecord.amount);

    await paymentRepository.createTransaction({
      giftCardId: paymentRecord.giftCardId,
      type: 'PURCHASE',
      amount: paymentRecord.amount,
      balanceBefore,
      balanceAfter,
      userId: paymentRecord.customerId || null,
      metadata: {
        paymentId: paymentRecord.id,
        paymentMethod: PaymentMethod.RAZORPAY,
      } satisfies { paymentId: string; paymentMethod: PaymentMethod },
    });
  }

  private async handleRazorpayPaymentFailed(payment: Record<string, unknown>): Promise<void> {
    const paymentId = payment.id as string | undefined;
    if (!paymentId) return;
    
    const paymentRecord = await paymentRepository.findPaymentByIntentIdAndMethod(paymentId, PaymentMethod.RAZORPAY);

    if (paymentRecord && paymentRecord.status !== PaymentStatus.FAILED) {
      await paymentRepository.updatePayment(paymentRecord.id, { status: PaymentStatus.FAILED });
    }
  }

  /**
   * Handle Stripe Connect payout status updates
   */
  private async handleStripePayoutStatus(
    payout: Record<string, unknown>,
    eventType: string
  ): Promise<void> {
    const payoutId = payout.id as string | undefined;
    if (!payoutId) return;

    // Find payout by transaction ID (Stripe payout ID)
    const payoutRecord = await payoutRepository.findPayoutByTransactionId(payoutId, 'STRIPE_CONNECT');

    if (!payoutRecord) {
      logger.warn('Payout not found for Stripe webhook', { payoutId, eventType });
      return;
    }

    let status: PayoutStatus;
    let failureReason: string | null = null;

    switch (eventType) {
      case 'payout.paid':
        status = PayoutStatus.COMPLETED;
        break;
      case 'payout.failed':
        status = PayoutStatus.FAILED;
        failureReason = (payout.failure_message as string) || 'Payout failed';
        break;
      case 'payout.canceled':
        status = PayoutStatus.CANCELLED;
        failureReason = 'Payout was canceled';
        break;
      default:
        return;
    }

    await payoutRepository.updatePayout(payoutRecord.id, {
      status,
      failureReason,
      processedAt: status === PayoutStatus.COMPLETED ? new Date() : payoutRecord.processedAt,
      webhookData: {
        eventType,
        payoutId,
        status: payout.status,
        failureCode: payout.failure_code || null,
        failureMessage: payout.failure_message || null,
        updatedAt: new Date().toISOString(),
      },
    });

    logger.info('Payout status updated from Stripe webhook', {
      payoutId: payoutRecord.id,
      status,
      eventType,
    });
  }

  /**
   * Handle Stripe Connect account updates
   */
  private async handleStripeAccountUpdate(
    account: Record<string, unknown>
  ): Promise<void> {
    const accountId = account.id as string | undefined;
    if (!accountId) return;

    // Find gateway by connect account ID
    const gateway = await paymentRepository.findMerchantGatewayByConnectAccountId(accountId, 'STRIPE');

    if (!gateway) {
      return;
    }

    const chargesEnabled = account.charges_enabled as boolean | undefined;
    const payoutsEnabled = account.payouts_enabled as boolean | undefined;
    const detailsSubmitted = account.details_submitted as boolean | undefined;

    // Update verification status based on account status
    let verificationStatus = gateway.verificationStatus;
    if (chargesEnabled && payoutsEnabled && detailsSubmitted) {
      verificationStatus = 'VERIFIED';
    } else if (!detailsSubmitted) {
      verificationStatus = 'PENDING';
    }

    await paymentRepository.updateMerchantGateway(gateway.id, {
      verificationStatus,
      isActive: verificationStatus === 'VERIFIED' && gateway.isActive,
      metadata: {
        ...((gateway.metadata as Record<string, unknown>) || {}),
        chargesEnabled,
        payoutsEnabled,
        detailsSubmitted,
        updatedAt: new Date().toISOString(),
      },
    });

    logger.info('Stripe Connect account updated', {
      gatewayId: gateway.id,
      accountId,
      verificationStatus,
    });
  }

  /**
   * Handle PayPal payout webhooks
   */
  async paypalPayoutWebhook(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const event = req.body;

      const webhookId = env.PAYPAL_WEBHOOK_ID;
      if (webhookId) {
        const isValid = await paypalService.verifyWebhookSignature(
          webhookId,
          req.headers as Record<string, string>,
          event
        );
        if (!isValid) {
          logger.warn('PayPal webhook signature verification failed');
          return res.status(400).json({ error: 'Invalid webhook signature' });
        }
      }

      switch (event.event_type) {
        case 'PAYMENT.PAYOUTSBATCH':
          await this.handlePayPalPayoutBatch(event.resource);
          break;

        case 'PAYMENT.PAYOUTS-ITEM':
          await this.handlePayPalPayoutItem(event.resource);
          break;

        default:
          logger.info('Unhandled PayPal webhook event type', { eventType: event.event_type });
      }

      return res.json({ received: true });
    } catch (error) {
      return next(error);
    }
  }

  private async handlePayPalPayoutBatch(batch: Record<string, unknown>): Promise<void> {
    const batchId = batch.payout_batch_id as string | undefined;
    if (!batchId) return;

    // Find payouts by batch ID
    const payouts = await payoutRepository.findPayoutsByTransactionId(batchId, 'PAYPAL');

    const batchStatus = batch.batch_status as string | undefined;

    for (const payout of payouts) {
      let status: PayoutStatus = payout.status;
      let failureReason: string | null = payout.failureReason;

      if (batchStatus === 'SUCCESS') {
        status = PayoutStatus.COMPLETED;
      } else if (batchStatus === 'DENIED' || batchStatus === 'FAILED') {
        status = PayoutStatus.FAILED;
        failureReason = (batch.batch_status as string) || 'Payout batch failed';
      }

      await payoutRepository.updatePayout(payout.id, {
        status,
        failureReason,
        processedAt: status === PayoutStatus.COMPLETED ? new Date() : payout.processedAt,
        webhookData: {
          batchId,
          batchStatus,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    logger.info('PayPal payout batch processed', {
      batchId,
      batchStatus,
      payoutCount: payouts.length,
    });
  }

  private async handlePayPalPayoutItem(item: Record<string, unknown>): Promise<void> {
    const transactionId = item.payout_item_id as string | undefined;
    if (!transactionId) return;

    const payout = await payoutRepository.findPayoutByTransactionId(transactionId, 'PAYPAL');

    if (!payout) {
      return;
    }

    const transactionStatus = item.transaction_status as string | undefined;
    let status: PayoutStatus = payout.status;
    let failureReason: string | null = payout.failureReason;

    switch (transactionStatus) {
      case 'SUCCESS':
        status = PayoutStatus.COMPLETED;
        break;
      case 'FAILED':
      case 'DENIED':
        status = PayoutStatus.FAILED;
        failureReason = (item.transaction_status as string) || 'Payout failed';
        break;
      case 'PENDING':
        status = PayoutStatus.PROCESSING;
        break;
      default:
        return;
    }

    await payoutRepository.updatePayout(payout.id, {
      status,
      failureReason,
      processedAt: status === PayoutStatus.COMPLETED ? new Date() : payout.processedAt,
      webhookData: {
        transactionId,
        transactionStatus,
        updatedAt: new Date().toISOString(),
      },
    });

    logger.info('PayPal payout item processed', {
      payoutId: payout.id,
      transactionId,
      status,
    });
  }
}

export default new WebhookController();

