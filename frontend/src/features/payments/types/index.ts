/**
 * Payments feature type definitions
 */

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export type PaymentMethod = 'STRIPE' | 'PAYPAL' | 'RAZORPAY' | 'UPI';

export interface Payment {
  id: string;
  giftCardId: string;
  giftCard?: {
    code: string;
    value: number;
  };
  customerId?: string;
  customer?: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentIntentId: string;
  status: PaymentStatus;
  transactionId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentData {
  giftCardId: string;
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  paymentIntentId?: string;
  metadata?: Record<string, unknown>;
}

export interface ConfirmPaymentData {
  paymentIntentId: string;
}

export interface RefundPaymentData {
  amount?: number | null;
  reason?: string;
}

export interface PaymentListParams {
  page?: number;
  limit?: number;
  status?: PaymentStatus | '';
  paymentMethod?: string;
  search?: string;
  merchantId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
