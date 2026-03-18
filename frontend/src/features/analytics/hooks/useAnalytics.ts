/**
 * useAnalytics hook
 *
 * Provides analytics data and fetch actions.
 */
'use client';

import { useState, useCallback } from 'react';
import {
  analyticsApi,
  type SalesAnalytics,
  type RedemptionAnalytics,
  type CustomerAnalytics,
  type GiftCardAnalytics,
  type AnalyticsSummary,
  type BreakageReport,
  type ExpiredCard,
} from '../api';
import logger from '@/lib/logger';

interface UseAnalyticsState {
  summary: AnalyticsSummary | null;
  salesData: SalesAnalytics | null;
  redemptionData: RedemptionAnalytics | null;
  customerData: CustomerAnalytics | null;
  giftCardStats: GiftCardAnalytics | null;
  breakageReport: BreakageReport | null;
  expiredCards: ExpiredCard[];
  isLoading: boolean;
  error: string | null;
}

interface AnalyticsParams {
  merchantId?: string;
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}

export function useAnalytics() {
  const [state, setState] = useState<UseAnalyticsState>({
    summary: null,
    salesData: null,
    redemptionData: null,
    customerData: null,
    giftCardStats: null,
    breakageReport: null,
    expiredCards: [],
    isLoading: false,
    error: null,
  });

  const setLoading = (isLoading: boolean) => setState((s) => ({ ...s, isLoading }));
  const setError = (error: string | null) => setState((s) => ({ ...s, error }));

  /**
   * Fetch all analytics data (sales, redemptions, customers, gift cards) in one shot.
   */
  const fetchSummary = useCallback(async (params?: AnalyticsParams) => {
    setLoading(true);
    setError(null);
    try {
      const summary = await analyticsApi.fetchAnalyticsSummary(params);
      setState((s) => ({
        ...s,
        summary,
        salesData: summary.sales,
        redemptionData: summary.redemptions,
        customerData: summary.customers,
        giftCardStats: summary.giftCards,
        isLoading: false,
      }));
      return summary;
    } catch (error) {
      logger.error('useAnalytics: fetchSummary failed', { error });
      setError('Failed to fetch analytics');
      setLoading(false);
      throw error;
    }
  }, []);

  /**
   * Fetch sales / revenue analytics only.
   */
  const fetchSalesAnalytics = useCallback(async (params?: AnalyticsParams) => {
    setLoading(true);
    setError(null);
    try {
      const salesData = await analyticsApi.fetchSalesAnalytics(params);
      setState((s) => ({ ...s, salesData, isLoading: false }));
      return salesData;
    } catch (error) {
      logger.error('useAnalytics: fetchSalesAnalytics failed', { error });
      setError('Failed to fetch sales analytics');
      setLoading(false);
      throw error;
    }
  }, []);

  /**
   * Fetch redemption analytics only.
   */
  const fetchRedemptionAnalytics = useCallback(async (params?: AnalyticsParams) => {
    setLoading(true);
    setError(null);
    try {
      const redemptionData = await analyticsApi.fetchRedemptionAnalytics(params);
      setState((s) => ({ ...s, redemptionData, isLoading: false }));
      return redemptionData;
    } catch (error) {
      logger.error('useAnalytics: fetchRedemptionAnalytics failed', { error });
      setError('Failed to fetch redemption analytics');
      setLoading(false);
      throw error;
    }
  }, []);

  /**
   * Fetch the breakage report.
   */
  const fetchBreakageReport = useCallback(async (params?: AnalyticsParams) => {
    setLoading(true);
    setError(null);
    try {
      const breakageReport = await analyticsApi.fetchBreakageReport(params);
      setState((s) => ({ ...s, breakageReport, isLoading: false }));
      return breakageReport;
    } catch (error) {
      logger.error('useAnalytics: fetchBreakageReport failed', { error });
      setError('Failed to fetch breakage report');
      setLoading(false);
      throw error;
    }
  }, []);

  /**
   * Fetch expired gift cards.
   */
  const fetchExpiredCards = useCallback(
    async (params?: { merchantId?: string; page?: number; limit?: number }) => {
      setLoading(true);
      setError(null);
      try {
        const result = await analyticsApi.fetchExpiredCards(params);
        setState((s) => ({ ...s, expiredCards: result.data || [], isLoading: false }));
        return result;
      } catch (error) {
        logger.error('useAnalytics: fetchExpiredCards failed', { error });
        setError('Failed to fetch expired cards');
        setLoading(false);
        throw error;
      }
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    // State
    summary: state.summary,
    salesData: state.salesData,
    redemptionData: state.redemptionData,
    customerData: state.customerData,
    giftCardStats: state.giftCardStats,
    breakageReport: state.breakageReport,
    expiredCards: state.expiredCards,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    fetchSummary,
    fetchSalesAnalytics,
    fetchRedemptionAnalytics,
    fetchBreakageReport,
    fetchExpiredCards,
    clearError,
  };
}
