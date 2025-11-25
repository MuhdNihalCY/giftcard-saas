/**
 * Payment-related type definitions
 */

import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Payment metadata types
export interface PaymentMetadata {
  type?: 'single' | 'bulk_purchase';
  giftCardIds?: string[];
  productId?: string;
  recipients?: Array<{
    email: string;
    name?: string;
    amount: number;
  }>;
  [key: string]: unknown;
}

// Transaction metadata types
export interface TransactionMetadata {
  paymentId?: string;
  paymentMethod?: PaymentMethod;
  redemptionId?: string;
  refundId?: string;
  [key: string]: unknown;
}

// Payment intent response
export interface PaymentIntentResponse {
  paymentIntentId?: string;
  clientSecret?: string | null;
  orderId?: string;
  status: PaymentStatus;
  redirectUrl?: string;
}

// Refund result
export interface RefundResult {
  success: boolean;
  refundId?: string;
  transactionId?: string;
  amount: Decimal | number;
  status?: string;
  reason?: string;
}

// Bulk purchase recipient
export interface BulkPurchaseRecipient {
  email: string;
  name?: string;
  amount: number;
  customMessage?: string;
}

// Product data for payment
export interface ProductPaymentData {
  id: string;
  name: string;
  merchantId: string;
  minAmount?: Decimal | number | null;
  maxAmount?: Decimal | number | null;
  minSalePrice?: Decimal | number | null;
  maxSalePrice?: Decimal | number | null;
  allowCustomAmount: boolean;
  fixedAmounts?: number[] | null;
  fixedSalePrices?: number[] | null;
  currency: string;
  expiryDays?: number | null;
  templateId?: string | null;
}

