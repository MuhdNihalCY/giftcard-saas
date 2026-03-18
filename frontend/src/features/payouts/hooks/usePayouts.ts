/**
 * usePayouts hook
 *
 * Provides payout state and actions for merchants.
 */
'use client';

import { useState, useCallback } from 'react';
import {
  payoutsApi,
  type Payout,
  type PayoutSettings,
  type RequestPayoutData,
  type UpdatePayoutSettingsData,
  type PayoutListParams,
} from '../api';
import logger from '@/lib/logger';

interface UsePayoutsState {
  payouts: Payout[];
  availableBalance: number;
  currency: string;
  settings: PayoutSettings | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const DEFAULT_PAGINATION = { page: 1, limit: 20, total: 0, totalPages: 0 };

export function usePayouts() {
  const [state, setState] = useState<UsePayoutsState>({
    payouts: [],
    availableBalance: 0,
    currency: 'USD',
    settings: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
    pagination: DEFAULT_PAGINATION,
  });

  const setLoading = (isLoading: boolean) => setState((s) => ({ ...s, isLoading }));
  const setSubmitting = (isSubmitting: boolean) => setState((s) => ({ ...s, isSubmitting }));
  const setError = (error: string | null) => setState((s) => ({ ...s, error }));

  /**
   * Fetch payouts, available balance, and settings in parallel.
   */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [balanceResult, payoutsResult, settingsResult] = await Promise.all([
        payoutsApi.fetchAvailableBalance(),
        payoutsApi.fetchPayouts(),
        payoutsApi.fetchPayoutSettings(),
      ]);

      setState((s) => ({
        ...s,
        availableBalance: balanceResult.availableBalance,
        currency: balanceResult.currency || 'USD',
        payouts: payoutsResult.data || [],
        settings: settingsResult,
        isLoading: false,
        pagination: payoutsResult.pagination
          ? {
              page: payoutsResult.pagination.page,
              limit: payoutsResult.pagination.limit,
              total: payoutsResult.pagination.total,
              totalPages: payoutsResult.pagination.totalPages,
            }
          : { ...DEFAULT_PAGINATION, total: payoutsResult.data?.length ?? 0 },
      }));
    } catch (error) {
      logger.error('usePayouts: fetchAll failed', { error });
      setError('Failed to load payout data');
      setLoading(false);
      throw error;
    }
  }, []);

  /**
   * Fetch a paginated list of payouts only.
   */
  const fetchPayouts = useCallback(async (params?: PayoutListParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await payoutsApi.fetchPayouts(params);
      setState((s) => ({
        ...s,
        payouts: result.data || [],
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
      logger.error('usePayouts: fetchPayouts failed', { error });
      setError('Failed to fetch payouts');
      setLoading(false);
      throw error;
    }
  }, []);

  /**
   * Fetch the available balance for the merchant.
   */
  const fetchAvailableBalance = useCallback(async () => {
    try {
      const result = await payoutsApi.fetchAvailableBalance();
      setState((s) => ({
        ...s,
        availableBalance: result.availableBalance,
        currency: result.currency || 'USD',
      }));
      return result;
    } catch (error) {
      logger.error('usePayouts: fetchAvailableBalance failed', { error });
      throw error;
    }
  }, []);

  /**
   * Fetch payout settings for the merchant.
   */
  const fetchPayoutSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const settings = await payoutsApi.fetchPayoutSettings();
      setState((s) => ({ ...s, settings, isLoading: false }));
      return settings;
    } catch (error) {
      logger.error('usePayouts: fetchPayoutSettings failed', { error });
      setError('Failed to fetch payout settings');
      setLoading(false);
      throw error;
    }
  }, []);

  /**
   * Update payout settings.
   */
  const updatePayoutSettings = useCallback(async (data: UpdatePayoutSettingsData) => {
    setSubmitting(true);
    setError(null);
    try {
      const updated = await payoutsApi.updatePayoutSettings(data);
      setState((s) => ({ ...s, settings: updated, isSubmitting: false }));
      return updated;
    } catch (error) {
      logger.error('usePayouts: updatePayoutSettings failed', { error });
      setError('Failed to update payout settings');
      setSubmitting(false);
      throw error;
    }
  }, []);

  /**
   * Request a new payout.
   */
  const requestPayout = useCallback(async (data: RequestPayoutData) => {
    setSubmitting(true);
    setError(null);
    try {
      const payout = await payoutsApi.requestPayout(data);
      setState((s) => ({
        ...s,
        isSubmitting: false,
        payouts: [payout, ...s.payouts],
        // Optimistically reduce available balance
        availableBalance: Math.max(0, s.availableBalance - data.amount),
      }));
      return payout;
    } catch (error) {
      logger.error('usePayouts: requestPayout failed', { error });
      setError('Failed to request payout');
      setSubmitting(false);
      throw error;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    // State
    payouts: state.payouts,
    availableBalance: state.availableBalance,
    currency: state.currency,
    settings: state.settings,
    isLoading: state.isLoading,
    isSubmitting: state.isSubmitting,
    error: state.error,
    pagination: state.pagination,

    // Actions
    fetchAll,
    fetchPayouts,
    fetchAvailableBalance,
    fetchPayoutSettings,
    updatePayoutSettings,
    requestPayout,
    clearError,
  };
}
