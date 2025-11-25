/**
 * Domain model type definitions
 * These represent business entities separate from database models
 */

import { Decimal } from '@prisma/client/runtime/library';

// Money/Currency types
export interface Money {
  amount: Decimal | number;
  currency: string;
}

export interface CurrencyConversion {
  from: string;
  to: string;
  rate: number;
  convertedAmount: number;
}

// Gift Card domain types
export interface GiftCardDomain {
  id: string;
  code: string;
  value: Money;
  balance: Money;
  status: 'ACTIVE' | 'REDEEMED' | 'EXPIRED' | 'CANCELLED';
  expiryDate?: Date;
  merchantId: string;
  recipientEmail?: string;
  allowPartialRedemption: boolean;
}

// Payment domain types
export interface PaymentDomain {
  id: string;
  giftCardId: string;
  amount: Money;
  method: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  metadata?: Record<string, unknown>;
}

// Redemption domain types
export interface RedemptionDomain {
  id: string;
  giftCardId: string;
  amount: Money;
  balanceBefore: Money;
  balanceAfter: Money;
  method: string;
  merchantId: string;
  location?: string;
  notes?: string;
}


