/**
 * useGiftCards hook
 *
 * Provides paginated gift card state and CRUD actions.
 * Components should import this hook rather than calling the API directly.
 */
'use client';

import { useState, useCallback } from 'react';
import { giftCardApi } from '../api';
import type {
  GiftCard,
  GiftCardTemplate,
  GiftCardProduct,
  CreateGiftCardData,
  UpdateGiftCardData,
  RedeemGiftCardData,
  GiftCardListParams,
} from '../types';
import logger from '@/lib/logger';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UseGiftCardsState {
  giftCards: GiftCard[];
  selectedGiftCard: GiftCard | null;
  templates: GiftCardTemplate[];
  products: GiftCardProduct[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  pagination: PaginationState;
}

const DEFAULT_PAGINATION: PaginationState = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export function useGiftCards(initialParams?: GiftCardListParams) {
  const [state, setState] = useState<UseGiftCardsState>({
    giftCards: [],
    selectedGiftCard: null,
    templates: [],
    products: [],
    isLoading: false,
    isSubmitting: false,
    error: null,
    pagination: DEFAULT_PAGINATION,
  });

  const setLoading = (isLoading: boolean) => setState((s) => ({ ...s, isLoading }));
  const setSubmitting = (isSubmitting: boolean) => setState((s) => ({ ...s, isSubmitting }));
  const setError = (error: string | null) => setState((s) => ({ ...s, error }));

  /**
   * Fetch a list of gift cards with optional filters.
   */
  const fetchGiftCards = useCallback(async (params?: GiftCardListParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await giftCardApi.fetchGiftCards({ ...initialParams, ...params });
      setState((s) => ({
        ...s,
        giftCards: result.data || [],
        isLoading: false,
        pagination: result.pagination
          ? {
              page: result.pagination.page,
              limit: result.pagination.limit,
              total: result.pagination.total,
              totalPages: result.pagination.totalPages,
            }
          : { ...DEFAULT_PAGINATION, total: result.data?.length ?? 0 },
      }));
      return result.data;
    } catch (error) {
      logger.error('useGiftCards: fetchGiftCards failed', { error });
      const msg = 'Failed to fetch gift cards';
      setError(msg);
      setLoading(false);
      throw error;
    }
  }, [initialParams]);

  /**
   * Fetch a single gift card and set it as the selected card.
   */
  const fetchById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const card = await giftCardApi.fetchGiftCardById(id);
      setState((s) => ({ ...s, selectedGiftCard: card, isLoading: false }));
      return card;
    } catch (error) {
      logger.error('useGiftCards: fetchById failed', { error, id });
      const msg = 'Failed to fetch gift card';
      setError(msg);
      setLoading(false);
      throw error;
    }
  }, []);

  /**
   * Create a new gift card.
   */
  const createGiftCard = useCallback(async (data: CreateGiftCardData) => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await giftCardApi.createGiftCard(data);
      setSubmitting(false);
      return result;
    } catch (error) {
      logger.error('useGiftCards: createGiftCard failed', { error });
      const msg = 'Failed to create gift card';
      setError(msg);
      setSubmitting(false);
      throw error;
    }
  }, []);

  /**
   * Update an existing gift card.
   */
  const updateGiftCard = useCallback(async (id: string, data: UpdateGiftCardData) => {
    setSubmitting(true);
    setError(null);
    try {
      const updated = await giftCardApi.updateGiftCard(id, data);
      setState((s) => ({
        ...s,
        isSubmitting: false,
        giftCards: s.giftCards.map((c) => (c.id === id ? updated : c)),
        selectedGiftCard: s.selectedGiftCard?.id === id ? updated : s.selectedGiftCard,
      }));
      return updated;
    } catch (error) {
      logger.error('useGiftCards: updateGiftCard failed', { error, id });
      const msg = 'Failed to update gift card';
      setError(msg);
      setSubmitting(false);
      throw error;
    }
  }, []);

  /**
   * Delete a gift card by ID.
   */
  const deleteGiftCard = useCallback(async (id: string) => {
    setSubmitting(true);
    setError(null);
    try {
      await giftCardApi.deleteGiftCard(id);
      setState((s) => ({
        ...s,
        isSubmitting: false,
        giftCards: s.giftCards.filter((c) => c.id !== id),
        selectedGiftCard: s.selectedGiftCard?.id === id ? null : s.selectedGiftCard,
      }));
    } catch (error) {
      logger.error('useGiftCards: deleteGiftCard failed', { error, id });
      const msg = 'Failed to delete gift card';
      setError(msg);
      setSubmitting(false);
      throw error;
    }
  }, []);

  /**
   * Redeem a gift card by code.
   */
  const redeemGiftCard = useCallback(async (data: RedeemGiftCardData) => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await giftCardApi.redeemGiftCard(data);
      setSubmitting(false);
      return result;
    } catch (error) {
      logger.error('useGiftCards: redeemGiftCard failed', { error });
      const msg = 'Failed to redeem gift card';
      setError(msg);
      setSubmitting(false);
      throw error;
    }
  }, []);

  /**
   * Fetch gift card templates.
   */
  const fetchTemplates = useCallback(async (params?: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      const templates = await giftCardApi.fetchGiftCardTemplates(params);
      setState((s) => ({ ...s, templates, isLoading: false }));
      return templates;
    } catch (error) {
      logger.error('useGiftCards: fetchTemplates failed', { error });
      setError('Failed to fetch templates');
      setLoading(false);
      throw error;
    }
  }, []);

  /**
   * Fetch gift card products.
   */
  const fetchProducts = useCallback(async (params?: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      const products = await giftCardApi.fetchGiftCardProducts(params);
      setState((s) => ({ ...s, products, isLoading: false }));
      return products;
    } catch (error) {
      logger.error('useGiftCards: fetchProducts failed', { error });
      setError('Failed to fetch products');
      setLoading(false);
      throw error;
    }
  }, []);

  /**
   * Clear any current error state.
   */
  const clearError = useCallback(() => setError(null), []);

  return {
    // State
    giftCards: state.giftCards,
    selectedGiftCard: state.selectedGiftCard,
    templates: state.templates,
    products: state.products,
    isLoading: state.isLoading,
    isSubmitting: state.isSubmitting,
    error: state.error,
    pagination: state.pagination,

    // Actions
    fetchGiftCards,
    fetchById,
    createGiftCard,
    updateGiftCard,
    deleteGiftCard,
    redeemGiftCard,
    fetchTemplates,
    fetchProducts,
    clearError,
  };
}
