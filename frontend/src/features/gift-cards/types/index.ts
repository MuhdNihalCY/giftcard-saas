/**
 * Gift Cards feature type definitions
 */

export type GiftCardStatus = 'ACTIVE' | 'REDEEMED' | 'EXPIRED' | 'CANCELLED';

export interface GiftCard {
  id: string;
  code: string;
  value: number;
  balance: number;
  currency: string;
  status: GiftCardStatus;
  expiryDate?: string;
  merchantId: string;
  recipientEmail?: string;
  recipientName?: string;
  recipientPhone?: string;
  allowPartialRedemption: boolean;
  templateId?: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
  merchant?: {
    businessName: string;
    businessLogo?: string;
  };
}

export interface GiftCardTemplate {
  id: string;
  merchantId: string;
  name: string;
  description?: string;
  design: Record<string, unknown>;
  isActive: boolean;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GiftCardProduct {
  id: string;
  merchantId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  denomination?: number;
  isCustomAmount: boolean;
  allowCustomAmount?: boolean;
  minAmount?: number;
  maxAmount?: number;
  minSalePrice?: number;
  maxSalePrice?: number;
  fixedAmounts?: number[];
  fixedSalePrices?: number[];
  imageUrl?: string;
  image?: string;
  isActive: boolean;
  isPublic?: boolean;
  expiryDays?: number;
  category?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGiftCardData {
  value: number;
  currency?: string;
  recipientEmail?: string;
  recipientName?: string;
  recipientPhone?: string;
  expiryDate?: string;
  message?: string;
  templateId?: string;
  allowPartialRedemption?: boolean;
  quantity?: number;
}

export interface UpdateGiftCardData {
  status?: GiftCardStatus;
  expiryDate?: string;
  recipientEmail?: string;
  recipientName?: string;
  message?: string;
}

export interface RedeemGiftCardData {
  code: string;
  amount: number;
  redemptionMethod?: string;
  location?: string;
  notes?: string;
}

export interface GiftCardListParams {
  page?: number;
  limit?: number;
  status?: GiftCardStatus | '';
  search?: string;
  merchantId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
