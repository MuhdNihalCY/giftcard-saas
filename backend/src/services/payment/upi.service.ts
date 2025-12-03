import { env } from '../../config/env';
import { ValidationError } from '../../utils/errors';
import razorpayService from './razorpay.service';

export interface CreateUPIOrderData {
  amount: number;
  currency: string;
  giftCardId: string;
  upiId?: string; // VPA (Virtual Payment Address) like user@paytm
  receipt?: string;
  notes?: Record<string, string>;
}

export interface VerifyUPIPaymentData {
  orderId: string;
  paymentId: string;
  signature: string;
}

export class UPIService {
  /**
   * Create UPI payment order
   * Uses Razorpay infrastructure for UPI payments in India
   */
  async createOrder(data: CreateUPIOrderData) {
    const { amount, currency, giftCardId, upiId, receipt, notes = {} } = data;

    // UPI is primarily for INR currency
    if (currency.toUpperCase() !== 'INR') {
      throw new ValidationError('UPI payments are only supported for INR currency');
    }

    try {
      // Use Razorpay to create order with UPI method
      const orderData = {
        amount,
        currency: 'INR',
        giftCardId,
        receipt: receipt || `giftcard_upi_${giftCardId}_${Date.now()}`,
        notes: {
          ...notes,
          paymentMethod: 'UPI',
          upiId: upiId || '',
        },
      };

      const razorpayOrder = await razorpayService.createOrder(orderData);

      // Return UPI-specific response
      return {
        orderId: razorpayOrder.orderId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        status: razorpayOrder.status,
        upiId: upiId || null,
        // UPI payment URL or instructions
        paymentUrl: this.generateUPIPaymentUrl(razorpayOrder.orderId, upiId),
      };
    } catch (error: any) {
      throw new ValidationError(`UPI order creation error: ${error.message}`);
    }
  }

  /**
   * Generate UPI payment URL
   */
  private generateUPIPaymentUrl(orderId: string, upiId?: string): string {
    // For UPI, we can generate a payment URL that can be used with UPI apps
    // Format: upi://pay?pa=<merchant_upi_id>&am=<amount>&cu=INR&tn=<transaction_note>
    // Or use Razorpay's payment link
    const baseUrl = env.FRONTEND_URL || 'http://localhost:3001';
    return `${baseUrl}/payments/upi/${orderId}`;
  }

  /**
   * Verify UPI payment signature
   * Uses Razorpay's signature verification
   */
  verifyPaymentSignature(data: VerifyUPIPaymentData): boolean {
    return razorpayService.verifyPaymentSignature(data);
  }

  /**
   * Get UPI payment details
   */
  async getPayment(paymentId: string) {
    try {
      const payment = await razorpayService.getPayment(paymentId);

      return {
        id: payment.id,
        orderId: payment.orderId,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        method: 'UPI',
        transactionId: payment.transactionId,
      };
    } catch (error: any) {
      throw new ValidationError(`UPI payment retrieval error: ${error.message}`);
    }
  }

  /**
   * Get order details
   */
  async getOrder(orderId: string) {
    try {
      const order = await razorpayService.getOrder(orderId);

      return {
        id: order.id,
        status: order.status,
        amount: order.amount,
        currency: order.currency,
        method: 'UPI',
      };
    } catch (error: any) {
      throw new ValidationError(`UPI order retrieval error: ${error.message}`);
    }
  }

  /**
   * Process UPI refund
   */
  async refundPayment(paymentId: string, amount?: number) {
    try {
      return await razorpayService.refundPayment(paymentId, amount);
    } catch (error: any) {
      throw new ValidationError(`UPI refund error: ${error.message}`);
    }
  }

  /**
   * Validate UPI ID format
   */
  validateUPIId(upiId: string): boolean {
    // UPI ID format: username@bankname or username@paytm, etc.
    const upiPattern = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    return upiPattern.test(upiId);
  }
}

export default new UPIService();





