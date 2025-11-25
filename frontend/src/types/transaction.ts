/**
 * Transaction type definitions
 */

export interface Transaction {
  id: string;
  giftCardId: string;
  type: 'PURCHASE' | 'REDEMPTION' | 'REFUND' | 'EXPIRY';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  userId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}


