import Razorpay from 'razorpay';
import { env } from '../../config/env';
import { ValidationError } from '../../utils/errors';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export interface CreateRazorpayOrderData {
  amount: number;
  currency: string;
  giftCardId: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface VerifyPaymentData {
  orderId: string;
  paymentId: string;
  signature: string;
}

export class RazorpayService {
  /**
   * Create Razorpay order
   */
  async createOrder(data: CreateRazorpayOrderData) {
    const { amount, currency, giftCardId, receipt, notes = {} } = data;

    try {
      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency: currency.toUpperCase(),
        receipt: receipt || `giftcard_${giftCardId}_${Date.now()}`,
        notes: {
          giftCardId,
          ...notes,
        },
      });

      return {
        orderId: order.id,
        amount: Number(order.amount) / 100,
        currency: order.currency,
        status: order.status,
      };
    } catch (error: any) {
      throw new ValidationError(`Razorpay order creation error: ${error.message}`);
    }
  }

  /**
   * Verify payment signature
   */
  verifyPaymentSignature(data: VerifyPaymentData): boolean {
    const { orderId, paymentId, signature } = data;

    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    return generatedSignature === signature;
  }

  /**
   * Get payment details
   */
  async getPayment(paymentId: string) {
    try {
      const payment = await razorpay.payments.fetch(paymentId);

      return {
        id: payment.id,
        orderId: payment.order_id,
        status: payment.status,
        amount: Number(payment.amount) / 100,
        currency: payment.currency,
        method: payment.method,
        transactionId: payment.id,
      };
    } catch (error: any) {
      throw new ValidationError(`Razorpay payment retrieval error: ${error.message}`);
    }
  }

  /**
   * Get order details
   */
  async getOrder(orderId: string) {
    try {
      const order = await razorpay.orders.fetch(orderId);

      return {
        id: order.id,
        status: order.status,
        amount: Number(order.amount) / 100,
        currency: order.currency,
      };
    } catch (error: any) {
      throw new ValidationError(`Razorpay order retrieval error: ${error.message}`);
    }
  }

  /**
   * Process refund
   */
  async refundPayment(paymentId: string, amount?: number) {
    try {
      const refundData: any = {};
      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to paise
      }

      const refund = await razorpay.payments.refund(paymentId, refundData);

      return {
        refundId: refund.id,
        amount: Number(refund.amount) / 100,
        status: refund.status,
      };
    } catch (error: any) {
      throw new ValidationError(`Razorpay refund error: ${error.message}`);
    }
  }
}

export default new RazorpayService();

