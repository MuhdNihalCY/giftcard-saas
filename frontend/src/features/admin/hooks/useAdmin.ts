/**
 * useAdmin hook
 *
 * Provides admin-specific state and actions: audit logs, feature flags, blacklist.
 */
'use client';

import { useState, useCallback } from 'react';
import {
  adminApi,
  type AuditLog,
  type FeatureFlag,
  type BlacklistEntry,
  type UpdateFeatureFlagData,
  type AuditLogListParams,
  type BlacklistListParams,
} from '../api';
import logger from '@/lib/logger';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UseAdminState {
  auditLogs: AuditLog[];
  featureFlags: FeatureFlag[];
  blacklist: BlacklistEntry[];
  platformStats: Record<string, unknown> | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  auditPagination: PaginationState;
  blacklistPagination: PaginationState;
}

const DEFAULT_PAGINATION: PaginationState = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export function useAdmin() {
  const [state, setState] = useState<UseAdminState>({
    auditLogs: [],
    featureFlags: [],
    blacklist: [],
    platformStats: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
    auditPagination: DEFAULT_PAGINATION,
    blacklistPagination: DEFAULT_PAGINATION,
  });

  const setLoading = (isLoading: boolean) => setState((s) => ({ ...s, isLoading }));
  const setSubmitting = (isSubmitting: boolean) => setState((s) => ({ ...s, isSubmitting }));
  const setError = (error: string | null) => setState((s) => ({ ...s, error }));

  /**
   * Fetch audit logs.
   */
  const fetchAuditLogs = useCallback(async (params?: AuditLogListParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminApi.fetchAuditLogs(params);
      setState((s) => ({
        ...s,
        auditLogs: result.data || [],
        isLoading: false,
        auditPagination: result.pagination
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
      logger.error('useAdmin: fetchAuditLogs failed', { error });
      setError('Failed to fetch audit logs');
      setLoading(false);
      throw error;
    }
  }, []);

  /**
   * Fetch all feature flags.
   */
  const fetchFeatureFlags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const featureFlags = await adminApi.fetchFeatureFlags();
      setState((s) => ({ ...s, featureFlags, isLoading: false }));
      return featureFlags;
    } catch (error) {
      logger.error('useAdmin: fetchFeatureFlags failed', { error });
      setError('Failed to fetch feature flags');
      setLoading(false);
      throw error;
    }
  }, []);

  /**
   * Update a feature flag by ID.
   */
  const updateFeatureFlag = useCallback(async (id: string, data: UpdateFeatureFlagData) => {
    setSubmitting(true);
    setError(null);
    try {
      const updated = await adminApi.updateFeatureFlag(id, data);
      setState((s) => ({
        ...s,
        isSubmitting: false,
        featureFlags: s.featureFlags.map((f) => (f.id === id ? updated : f)),
      }));
      return updated;
    } catch (error) {
      logger.error('useAdmin: updateFeatureFlag failed', { error, id });
      setError('Failed to update feature flag');
      setSubmitting(false);
      throw error;
    }
  }, []);

  /**
   * Toggle a feature flag's enabled state.
   */
  const toggleFeatureFlag = useCallback(
    async (id: string, isEnabled: boolean) => {
      return updateFeatureFlag(id, { isEnabled });
    },
    [updateFeatureFlag]
  );

  /**
   * Fetch the blacklist.
   */
  const fetchBlacklist = useCallback(async (params?: BlacklistListParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminApi.fetchBlacklist(params);
      setState((s) => ({
        ...s,
        blacklist: result.data || [],
        isLoading: false,
        blacklistPagination: result.pagination
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
      logger.error('useAdmin: fetchBlacklist failed', { error });
      setError('Failed to fetch blacklist');
      setLoading(false);
      throw error;
    }
  }, []);

  /**
   * Add an entry to the blacklist.
   */
  const addToBlacklist = useCallback(
    async (data: {
      type: BlacklistEntry['type'];
      value: string;
      reason?: string;
      expiresAt?: string;
    }) => {
      setSubmitting(true);
      setError(null);
      try {
        const entry = await adminApi.addToBlacklist(data);
        setState((s) => ({
          ...s,
          isSubmitting: false,
          blacklist: [entry, ...s.blacklist],
        }));
        return entry;
      } catch (error) {
        logger.error('useAdmin: addToBlacklist failed', { error });
        setError('Failed to add to blacklist');
        setSubmitting(false);
        throw error;
      }
    },
    []
  );

  /**
   * Remove an entry from the blacklist.
   */
  const removeFromBlacklist = useCallback(async (id: string) => {
    setSubmitting(true);
    setError(null);
    try {
      await adminApi.removeFromBlacklist(id);
      setState((s) => ({
        ...s,
        isSubmitting: false,
        blacklist: s.blacklist.filter((e) => e.id !== id),
      }));
    } catch (error) {
      logger.error('useAdmin: removeFromBlacklist failed', { error, id });
      setError('Failed to remove from blacklist');
      setSubmitting(false);
      throw error;
    }
  }, []);

  /**
   * Fetch platform-wide statistics.
   */
  const fetchPlatformStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await adminApi.fetchPlatformStats();
      setState((s) => ({ ...s, platformStats: stats, isLoading: false }));
      return stats;
    } catch (error) {
      logger.error('useAdmin: fetchPlatformStats failed', { error });
      setError('Failed to fetch platform stats');
      setLoading(false);
      throw error;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    // State
    auditLogs: state.auditLogs,
    featureFlags: state.featureFlags,
    blacklist: state.blacklist,
    platformStats: state.platformStats,
    isLoading: state.isLoading,
    isSubmitting: state.isSubmitting,
    error: state.error,
    auditPagination: state.auditPagination,
    blacklistPagination: state.blacklistPagination,

    // Actions
    fetchAuditLogs,
    fetchFeatureFlags,
    updateFeatureFlag,
    toggleFeatureFlag,
    fetchBlacklist,
    addToBlacklist,
    removeFromBlacklist,
    fetchPlatformStats,
    clearError,
  };
}
