/**
 * Gift Cards feature API functions
 */
import api from '@/lib/api';
import type {
  GiftCard,
  GiftCardTemplate,
  GiftCardProduct,
  CreateGiftCardData,
  UpdateGiftCardData,
  RedeemGiftCardData,
  GiftCardListParams,
} from '../types';

/**
 * Fetch a paginated list of gift cards.
 */
export const fetchGiftCards = async (params?: GiftCardListParams): Promise<{
  data: GiftCard[];
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}> => {
  const response = await api.get('/gift-cards', { params });
  return response.data;
};

/**
 * Fetch a single gift card by ID.
 */
export const fetchGiftCardById = async (id: string): Promise<GiftCard> => {
  const response = await api.get(`/gift-cards/${id}`);
  return response.data.data;
};

/**
 * Create one or more new gift cards.
 */
export const createGiftCard = async (data: CreateGiftCardData): Promise<GiftCard | GiftCard[]> => {
  const response = await api.post('/gift-cards', data);
  return response.data.data;
};

/**
 * Update an existing gift card.
 */
export const updateGiftCard = async (id: string, data: UpdateGiftCardData): Promise<GiftCard> => {
  const response = await api.put(`/gift-cards/${id}`, data);
  return response.data.data;
};

/**
 * Delete (cancel) a gift card.
 */
export const deleteGiftCard = async (id: string): Promise<void> => {
  await api.delete(`/gift-cards/${id}`);
};

/**
 * Redeem a gift card by code.
 */
export const redeemGiftCard = async (data: RedeemGiftCardData): Promise<{
  redemptionId: string;
  giftCardId: string;
  amountRedeemed: number;
  newBalance: number;
}> => {
  const response = await api.post('/gift-cards/redeem', data);
  return response.data.data;
};

/**
 * Fetch a gift card by its code (public lookup).
 */
export const fetchGiftCardByCode = async (code: string): Promise<GiftCard> => {
  const response = await api.get(`/gift-cards/code/${code}`);
  return response.data.data;
};

/**
 * Fetch all gift card templates for the authenticated merchant.
 */
export const fetchGiftCardTemplates = async (params?: Record<string, unknown>): Promise<GiftCardTemplate[]> => {
  const response = await api.get('/gift-card-templates', { params });
  return response.data.data || [];
};

/**
 * Fetch all gift card products for the authenticated merchant.
 */
export const fetchGiftCardProducts = async (params?: Record<string, unknown>): Promise<GiftCardProduct[]> => {
  const response = await api.get('/gift-card-products', { params });
  return response.data.data || [];
};

/**
 * Fetch autocomplete suggestions for gift card search.
 */
export const fetchGiftCardSuggestions = async (query: string): Promise<unknown[]> => {
  const response = await api.get('/gift-cards/suggestions', { params: { q: query } });
  return response.data.data || [];
};

/**
 * Create a new gift card template.
 */
export const createGiftCardTemplate = async (data: Record<string, unknown>): Promise<GiftCardTemplate> => {
  const response = await api.post('/gift-card-templates', data);
  return response.data.data;
};

/**
 * Delete a gift card template by ID.
 */
export const deleteGiftCardTemplate = async (id: string): Promise<void> => {
  await api.delete(`/gift-card-templates/${id}`);
};

/**
 * Fetch a single gift card product by ID.
 */
export const fetchGiftCardProductById = async (id: string, params?: Record<string, unknown>): Promise<GiftCardProduct> => {
  const response = await api.get(`/gift-card-products/${id}`, { params });
  return response.data.data;
};

/**
 * Create a new gift card product.
 */
export const createGiftCardProduct = async (data: Record<string, unknown>): Promise<GiftCardProduct> => {
  const response = await api.post('/gift-card-products', data);
  return response.data.data;
};

/**
 * Update an existing gift card product.
 */
export const updateGiftCardProduct = async (id: string, data: Record<string, unknown>): Promise<GiftCardProduct> => {
  const response = await api.put(`/gift-card-products/${id}`, data);
  return response.data.data;
};

/**
 * Delete a gift card product by ID.
 */
export const deleteGiftCardProduct = async (id: string): Promise<void> => {
  await api.delete(`/gift-card-products/${id}`);
};

/**
 * Fetch a gift card by its share token (public).
 * Returns the giftCard object from the response.
 */
export const fetchGiftCardByShareToken = async (token: string): Promise<unknown> => {
  const response = await api.get(`/gift-card-share/token/${token}`);
  return response.data.data.giftCard;
};

/**
 * Fetch public gift card products (no auth required).
 */
export const fetchPublicGiftCardProducts = async (params?: Record<string, unknown>): Promise<unknown[]> => {
  const response = await api.get('/gift-card-products/public', { params });
  return response.data.data || [];
};

export const giftCardApi = {
  fetchGiftCards,
  fetchGiftCardById,
  createGiftCard,
  updateGiftCard,
  deleteGiftCard,
  redeemGiftCard,
  fetchGiftCardByCode,
  fetchGiftCardTemplates,
  fetchGiftCardProducts,
  fetchGiftCardSuggestions,
  createGiftCardTemplate,
  deleteGiftCardTemplate,
  fetchGiftCardProductById,
  createGiftCardProduct,
  updateGiftCardProduct,
  deleteGiftCardProduct,
  fetchGiftCardByShareToken,
  fetchPublicGiftCardProducts,
};
