/**
 * Redemptions feature API functions
 */
import api from '@/lib/api';
import type { Redemption, RedeemData, RedemptionListParams } from '../types';

/**
 * Fetch a paginated list of redemptions.
 */
export const fetchRedemptions = async (params?: RedemptionListParams): Promise<{
  data: Redemption[];
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}> => {
  const response = await api.get('/redemptions', { params });
  return response.data;
};

/**
 * Fetch a single redemption by ID.
 */
export const fetchRedemptionById = async (id: string): Promise<Redemption> => {
  const response = await api.get(`/redemptions/${id}`);
  return response.data.data;
};

/**
 * Redeem a gift card.
 * This is the merchant-side redemption endpoint.
 */
export const redeemGiftCard = async (data: RedeemData): Promise<{
  redemptionId: string;
  giftCardId: string;
  amountRedeemed: number;
  newBalance: number;
}> => {
  const response = await api.post('/redemptions', data);
  return response.data.data;
};

/**
 * Fetch autocomplete suggestions for redemption search.
 */
export const fetchRedemptionSuggestions = async (query: string): Promise<unknown[]> => {
  const response = await api.get('/redemptions/suggestions', { params: { q: query } });
  return response.data.data || [];
};

/**
 * Check the balance of a gift card by code (public endpoint).
 */
export const checkGiftCardBalance = async (data: { code: string }): Promise<unknown> => {
  const response = await api.post('/redemptions/check-balance', data);
  return response.data.data;
};

/**
 * Validate a gift card before redemption.
 * Returns the giftCard from the response.
 */
export const validateGiftCardForRedemption = async (data: { code: string }): Promise<unknown> => {
  const response = await api.post('/redemptions/validate', data);
  return response.data.data;
};

/**
 * Redeem a gift card by code (public/link-based redemption).
 */
export const redeemGiftCardByCode = async (data: {
  code: string;
  amount: number;
  location?: string;
  notes?: string;
  redemptionMethod?: string;
}): Promise<unknown> => {
  const response = await api.post('/redemptions/redeem', data);
  return response.data.data;
};

/**
 * Redeem a gift card via QR code data (merchant dashboard).
 */
export const redeemGiftCardQR = async (data: {
  qrData: string;
  amount: number;
  location?: string;
  notes?: string;
}): Promise<unknown> => {
  const response = await api.post('/redemptions/redeem/qr', data);
  return response.data.data;
};

/**
 * Fetch transaction history for a specific gift card.
 */
export const fetchGiftCardTransactions = async (giftCardId: string): Promise<{ transactions: unknown[] }> => {
  const response = await api.get(`/redemptions/gift-card/${giftCardId}/transactions`);
  return response.data.data;
};

export const redemptionsApi = {
  fetchRedemptions,
  fetchRedemptionById,
  redeemGiftCard,
  fetchRedemptionSuggestions,
  checkGiftCardBalance,
  validateGiftCardForRedemption,
  redeemGiftCardByCode,
  redeemGiftCardQR,
  fetchGiftCardTransactions,
};
