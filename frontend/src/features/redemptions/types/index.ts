/**
 * Redemptions feature type definitions
 */

export type RedemptionMethod = 'QR_CODE' | 'CODE_ENTRY' | 'LINK' | 'API';

export interface Redemption {
  id: string;
  giftCardId: string;
  giftCard?: {
    code: string;
    value: number;
    balance: number;
  };
  merchantId: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  redemptionMethod: RedemptionMethod | string;
  location?: string;
  notes?: string;
  createdAt: string;
}

export interface RedeemData {
  code: string;
  amount: number;
  redemptionMethod?: RedemptionMethod;
  location?: string;
  notes?: string;
}

export interface RedemptionListParams {
  page?: number;
  limit?: number;
  search?: string;
  method?: string;
  merchantId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
