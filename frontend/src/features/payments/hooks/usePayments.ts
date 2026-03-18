/**
 * usePayments hook
 *
 * Provides paginated payments state and actions (create, refund, sort, filter).
 */
'use client';

import { useState, useCallback } from 'react';
import { paymentsApi } from '../api';
import type {
  Payment,
  CreatePaymentData,
  ConfirmPaymentData,
  RefundPaymentData,
  PaymentListParams,
} from '../types';
import logger from '@/lib/logger';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UsePaymentsState {
  payments: Payment[];
  selectedPayment: Payment | null;
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

export function usePayments(initialParams?: PaymentListParams) {
  const [state, setState] = useState<UsePaymentsState>({
    payments: [],
    selectedPayment: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
    pagination: DEFAULT_PAGINATION,
  });

  const setLoading = (isLoading: boolean) => setState((s) => ({ ...s, isLoading }));
  const setSubmitting = (isSubmitting: boolean) => setState((s) => ({ ...s, isSubmitting }));
  const setError = (error: string | null) => setState((s) => ({ ...s, error }));

  /**
   * Fetch a list of payments with optional filters.
   */
  const fetchPayments = useCallback(async (params?: PaymentListParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentsApi.fetchPayments({ ...initialParams, ...params });
      setState((s) => ({
        ...s,
        payments: result.data || [],
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
      logger.error('usePayments: fetchPayments failed', { error });
      setError('Failed to fetch payments');
      setLoading(false);
      throw error;
    }
  }, [initialParams]);

  /**
   * Fetch a single payment by ID.
   */
  const fetchById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const payment = await paymentsApi.fetchPaymentById(id);
      setState((s) => ({ ...s, selectedPayment: payment, isLoading: false }));
      return payment;
    } catch (error) {
      logger.error('usePayments: fetchById failed', { error, id });
      setError('Failed to fetch payment');
      setLoading(false);
      throw error;
    }
  }, []);

  /**
   * Create / initiate a new payment.
   */
  const createPayment = useCallback(async (data: CreatePaymentData) => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await paymentsApi.createPayment(data);
      setSubmitting(false);
      return result;
    } catch (error) {
      logger.error('usePayments: createPayment failed', { error });
      setError('Failed to create payment');
      setSubmitting(false);
      throw error;
    }
  }, []);

  /**
   * Confirm a payment after the client-side payment flow completes.
   */
  const confirmPayment = useCallback(async (paymentId: string, data: ConfirmPaymentData) => {
    setSubmitting(true);
    setError(null);
    try {
      const updated = await paymentsApi.confirmPayment(paymentId, data);
      setState((s) => ({
        ...s,
        isSubmitting: false,
        payments: s.payments.map((p) => (p.id === paymentId ? updated : p)),
        selectedPayment: s.selectedPayment?.id === paymentId ? updated : s.selectedPayment,
      }));
      return updated;
    } catch (error) {
      logger.error('usePayments: confirmPayment failed', { error, paymentId });
      setError('Failed to confirm payment');
      setSubmitting(false);
      throw error;
    }
  }, []);

  /**
   * Refund a completed payment (full or partial).
   */
  const refundPayment = useCallback(async (paymentId: string, data?: RefundPaymentData) => {
    setSubmitting(true);
    setError(null);
    try {
      const updated = await paymentsApi.refundPayment(paymentId, data);
      setState((s) => ({
        ...s,
        isSubmitting: false,
        payments: s.payments.map((p) => (p.id === paymentId ? updated : p)),
        selectedPayment: s.selectedPayment?.id === paymentId ? updated : s.selectedPayment,
      }));
      return updated;
    } catch (error) {
      logger.error('usePayments: refundPayment failed', { error, paymentId });
      setError('Failed to refund payment');
      setSubmitting(false);
      throw error;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    // State
    payments: state.payments,
    selectedPayment: state.selectedPayment,
    isLoading: state.isLoading,
    isSubmitting: state.isSubmitting,
    error: state.error,
    pagination: state.pagination,

    // Actions
    fetchPayments,
    fetchById,
    createPayment,
    confirmPayment,
    refundPayment,
    clearError,
  };
}
