import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../../config/database';
import { NotFoundError, ValidationError } from '../../utils/errors';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import stripeService from './stripe.service';
import paypalService from './paypal.service';
import razorpayService from './razorpay.service';
import giftCardService from '../giftcard.service';

export interface CreatePaymentData {
  giftCardId: string;
  customerId?: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface ConfirmPaymentData {
  paymentId: string;
  paymentMethod: PaymentMethod;
  paymentIntentId?: string;
  orderId?: string;
  paymentMethodId?: string;
  signature?: string;
}

export interface RefundPaymentData {
  paymentId: string;
  amount?: number;
  reason?: string;
}

export class PaymentService {
  /**
   * Create payment
   */
  async createPayment(data: CreatePaymentData) {
    const { giftCardId, customerId, amount, currency, paymentMethod, returnUrl, cancelUrl } = data;

    // Verify gift card exists
    const giftCard = await giftCardService.getById(giftCardId);

    if (giftCard.status !== 'ACTIVE') {
      throw new ValidationError('Gift card is not active');
    }

    // Validate amount matches gift card value
    if (amount !== Number(giftCard.value)) {
      throw new ValidationError('Payment amount does not match gift card value');
    }

    let paymentIntentId: string | undefined;
    let orderId: string | undefined;
    let clientSecret: string | undefined;
    let status = PaymentStatus.PENDING;

    // Create payment based on method
    switch (paymentMethod) {
      case PaymentMethod.STRIPE:
        const stripeResult = await stripeService.createPaymentIntent({
          amount,
          currency,
          giftCardId,
          customerId,
        });
        paymentIntentId = stripeResult.paymentIntentId;
        clientSecret = stripeResult.clientSecret;
        status = stripeResult.status === 'succeeded' ? PaymentStatus.COMPLETED : PaymentStatus.PENDING;
        break;

      case PaymentMethod.PAYPAL:
        if (!returnUrl || !cancelUrl) {
          throw new ValidationError('Return URL and Cancel URL are required for PayPal');
        }
        const paypalResult = await paypalService.createOrder({
          amount,
          currency,
          giftCardId,
          returnUrl,
          cancelUrl,
        });
        orderId = paypalResult.orderId;
        break;

      case PaymentMethod.RAZORPAY:
        const razorpayResult = await razorpayService.createOrder({
          amount,
          currency,
          giftCardId,
        });
        orderId = razorpayResult.orderId;
        break;

      case PaymentMethod.UPI:
        // UPI integration would go here
        // For now, we'll treat it similar to Razorpay
        throw new ValidationError('UPI payment method not yet implemented');

      default:
        throw new ValidationError('Invalid payment method');
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        giftCardId,
        customerId,
        amount: new Decimal(amount),
        currency,
        paymentMethod,
        paymentIntentId: paymentIntentId || orderId || '',
        status,
        metadata: {
          returnUrl,
          cancelUrl,
        } as any,
      },
      include: {
        giftCard: true,
        customer: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return {
      payment,
      clientSecret,
      orderId,
      paymentIntentId,
    };
  }

  /**
   * Confirm payment
   */
  async confirmPayment(data: ConfirmPaymentData) {
    const { paymentId, paymentMethod, paymentIntentId, orderId, paymentMethodId, signature } = data;

    // Get payment record
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { giftCard: true },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new ValidationError('Payment already completed');
    }

    let transactionId: string | undefined;
    let confirmed = false;

    // Confirm payment based on method
    switch (paymentMethod) {
      case PaymentMethod.STRIPE:
        if (!paymentIntentId) {
          throw new ValidationError('Payment intent ID is required for Stripe');
        }
        const stripeResult = await stripeService.confirmPaymentIntent({
          paymentIntentId,
          paymentMethodId,
        });
        transactionId = stripeResult.transactionId;
        confirmed = stripeResult.status === 'succeeded';
        break;

      case PaymentMethod.PAYPAL:
        if (!orderId) {
          throw new ValidationError('Order ID is required for PayPal');
        }
        const paypalResult = await paypalService.captureOrder(orderId);
        transactionId = paypalResult.transactionId;
        confirmed = paypalResult.status === 'COMPLETED';
        break;

      case PaymentMethod.RAZORPAY:
        if (!orderId || !signature) {
          throw new ValidationError('Order ID and signature are required for Razorpay');
        }
        // Get payment ID from metadata or request
        const paymentIdFromRazorpay = payment.paymentIntentId; // This would be the Razorpay payment ID
        const isValid = razorpayService.verifyPaymentSignature({
          orderId,
          paymentId: paymentIdFromRazorpay,
          signature,
        });
        if (!isValid) {
          throw new ValidationError('Invalid payment signature');
        }
        const razorpayPayment = await razorpayService.getPayment(paymentIdFromRazorpay);
        transactionId = razorpayPayment.transactionId;
        confirmed = razorpayPayment.status === 'captured';
        break;

      default:
        throw new ValidationError('Invalid payment method');
    }

    if (!confirmed) {
      // Update payment status to failed
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.FAILED },
      });
      throw new ValidationError('Payment confirmation failed');
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.COMPLETED,
        transactionId,
      },
      include: {
        giftCard: true,
        customer: true,
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
          paymentMethod: payment.paymentMethod,
        } as any,
      },
    });

    return updatedPayment;
  }

  /**
   * Get payment by ID
   */
  async getById(id: string) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        giftCard: {
          include: {
            merchant: {
              select: {
                id: true,
                email: true,
                businessName: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    return payment;
  }

  /**
   * List payments
   */
  async list(filters: {
    giftCardId?: string;
    customerId?: string;
    status?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    page?: number;
    limit?: number;
  }) {
    const { giftCardId, customerId, status, paymentMethod, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (giftCardId) where.giftCardId = giftCardId;
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          giftCard: {
            select: {
              id: true,
              code: true,
              value: true,
            },
          },
          customer: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Process refund
   */
  async refundPayment(data: RefundPaymentData) {
    const { paymentId, amount, reason } = data;

    const payment = await this.getById(paymentId);

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new ValidationError('Only completed payments can be refunded');
    }

    if (!payment.transactionId) {
      throw new ValidationError('Payment transaction ID not found');
    }

    let refundResult: any;

    // Process refund based on payment method
    switch (payment.paymentMethod) {
      case PaymentMethod.STRIPE:
        refundResult = await stripeService.refundPayment(payment.paymentIntentId, amount);
        break;

      case PaymentMethod.PAYPAL:
        refundResult = await paypalService.refundPayment(payment.transactionId, amount);
        break;

      case PaymentMethod.RAZORPAY:
        refundResult = await razorpayService.refundPayment(payment.transactionId, amount);
        break;

      default:
        throw new ValidationError('Refund not supported for this payment method');
    }

    // Update payment status
    const refundAmount = amount || Number(payment.amount);
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.REFUNDED },
    });

    // Update gift card balance if needed
    const giftCard = await giftCardService.getById(payment.giftCardId);
    const newBalance = Number(giftCard.balance) - refundAmount;

    await prisma.giftCard.update({
      where: { id: payment.giftCardId },
      data: {
        balance: new Decimal(Math.max(0, newBalance)),
        status: newBalance <= 0 ? 'CANCELLED' : giftCard.status,
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        giftCardId: payment.giftCardId,
        type: 'REFUND',
        amount: new Decimal(refundAmount),
        balanceBefore: giftCard.balance,
        balanceAfter: new Decimal(Math.max(0, newBalance)),
        userId: payment.customerId || null,
        metadata: {
          paymentId: payment.id,
          refundId: refundResult.refundId,
          reason,
        } as any,
      },
    });

    return {
      refundId: refundResult.refundId,
      amount: refundAmount,
      status: refundResult.status,
    };
  }
}

export default new PaymentService();

