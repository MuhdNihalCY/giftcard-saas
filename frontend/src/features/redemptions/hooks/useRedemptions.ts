/**
 * useRedemptions hook
 *
 * Provides paginated redemptions state and redemption actions.
 */
'use client';

import { useState, useCallback } from 'react';
import { redemptionsApi } from '../api';
import type { Redemption, RedeemData, RedemptionListParams } from '../types';
import logger from '@/lib/logger';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UseRedemptionsState {
  redemptions: Redemption[];
  selectedRedemption: Redemption | null;
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

export function useRedemptions(initialParams?: RedemptionListParams) {
  const [state, setState] = useState<UseRedemptionsState>({
    redemptions: [],
    selectedRedemption: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
    pagination: DEFAULT_PAGINATION,
  });

  const setLoading = (isLoading: boolean) => setState((s) => ({ ...s, isLoading }));
  const setSubmitting = (isSubmitting: boolean) => setState((s) => ({ ...s, isSubmitting }));
  const setError = (error: string | null) => setState((s) => ({ ...s, error }));

  /**
   * Fetch a list of redemptions with optional filters.
   */
  const fetchRedemptions = useCallback(async (params?: RedemptionListParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await redemptionsApi.fetchRedemptions({ ...initialParams, ...params });
      setState((s) => ({
        ...s,
        redemptions: result.data || [],
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
      logger.error('useRedemptions: fetchRedemptions failed', { error });
      setError('Failed to fetch redemptions');
      setLoading(false);
      throw error;
    }
  }, [initialParams]);

  /**
   * Fetch a single redemption by ID.
   */
  const fetchById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const redemption = await redemptionsApi.fetchRedemptionById(id);
      setState((s) => ({ ...s, selectedRedemption: redemption, isLoading: false }));
      return redemption;
    } catch (error) {
      logger.error('useRedemptions: fetchById failed', { error, id });
      setError('Failed to fetch redemption');
      setLoading(false);
      throw error;
    }
  }, []);

  /**
   * Redeem a gift card (merchant-side action).
   */
  const redeemGiftCard = useCallback(async (data: RedeemData) => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await redemptionsApi.redeemGiftCard(data);
      setSubmitting(false);
      return result;
    } catch (error) {
      logger.error('useRedemptions: redeemGiftCard failed', { error });
      setError('Failed to redeem gift card');
      setSubmitting(false);
      throw error;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    // State
    redemptions: state.redemptions,
    selectedRedemption: state.selectedRedemption,
    isLoading: state.isLoading,
    isSubmitting: state.isSubmitting,
    error: state.error,
    pagination: state.pagination,

    // Actions
    fetchRedemptions,
    fetchById,
    redeemGiftCard,
    clearError,
  };
}
