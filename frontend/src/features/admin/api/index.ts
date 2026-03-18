/**
 * Admin feature API functions
 */
import api from '@/lib/api';

export interface AuditLog {
  id: string;
  userId: string;
  user?: { email: string; firstName?: string; lastName?: string };
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface FeatureFlag {
  id: string;
  featureKey: string;
  featureName: string;
  description: string | null;
  category: 'PAGE' | 'FEATURE';
  targetRole: 'MERCHANT' | 'CUSTOMER' | 'ALL';
  isEnabled: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlacklistEntry {
  id: string;
  type: 'EMAIL' | 'IP' | 'CARD_CODE';
  value: string;
  reason?: string;
  createdById?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface UpdateFeatureFlagData {
  isEnabled?: boolean;
  description?: string;
  metadata?: Record<string, unknown>;
  targetRole?: 'MERCHANT' | 'CUSTOMER' | 'ALL';
}

export interface AuditLogListParams {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
}

export interface BlacklistListParams {
  page?: number;
  limit?: number;
  type?: 'EMAIL' | 'IP' | 'CARD_CODE';
  search?: string;
}

/**
 * Fetch audit logs (admin only).
 */
export const fetchAuditLogs = async (params?: AuditLogListParams): Promise<{
  data: AuditLog[];
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}> => {
  const response = await api.get('/admin/audit-logs', { params });
  return response.data;
};

/**
 * Fetch all feature flags.
 */
export const fetchFeatureFlags = async (): Promise<FeatureFlag[]> => {
  const response = await api.get('/feature-flags');
  return response.data.data || [];
};

/**
 * Update a feature flag by ID.
 */
export const updateFeatureFlag = async (
  id: string,
  data: UpdateFeatureFlagData
): Promise<FeatureFlag> => {
  const response = await api.put(`/feature-flags/${id}`, data);
  return response.data.data;
};

/**
 * Toggle a feature flag's enabled status by ID.
 */
export const toggleFeatureFlag = async (id: string, isEnabled: boolean): Promise<FeatureFlag> => {
  return updateFeatureFlag(id, { isEnabled });
};

/**
 * Fetch the blacklist entries.
 */
export const fetchBlacklist = async (params?: BlacklistListParams): Promise<{
  data: BlacklistEntry[];
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}> => {
  const response = await api.get('/admin/blacklist', { params });
  return response.data;
};

/**
 * Add an entry to the blacklist.
 */
export const addToBlacklist = async (data: {
  type: BlacklistEntry['type'];
  value: string;
  reason?: string;
  expiresAt?: string;
}): Promise<BlacklistEntry> => {
  const response = await api.post('/admin/blacklist', data);
  return response.data.data;
};

/**
 * Remove an entry from the blacklist.
 */
export const removeFromBlacklist = async (id: string): Promise<void> => {
  await api.delete(`/admin/blacklist/${id}`);
};

/**
 * Fetch platform-wide statistics (admin dashboard).
 */
export const fetchPlatformStats = async (): Promise<Record<string, unknown>> => {
  const response = await api.get('/admin/stats');
  return response.data.data;
};

// ─── Admin Feature Flags (admin-scoped endpoints) ───────────────────────────

export interface AdminFeatureFlagFormData {
  featureKey: string;
  featureName: string;
  description?: string;
  category: 'PAGE' | 'FEATURE';
  targetRole: 'MERCHANT' | 'CUSTOMER' | 'ALL';
  isEnabled: boolean;
}

export interface FeatureFlagStats {
  total: number;
  enabled: number;
  disabled: number;
  byCategory: Record<string, number>;
  byRole: Record<string, number>;
}

/** Fetch all feature flags (admin view, includes all flags). */
export const fetchAllFeatureFlags = async (): Promise<FeatureFlag[]> => {
  const response = await api.get('/feature-flags/admin/all');
  return response.data.data || [];
};

/** Fetch feature flag statistics. */
export const fetchFeatureFlagStats = async (): Promise<FeatureFlagStats> => {
  const response = await api.get('/feature-flags/admin/statistics');
  return response.data.data;
};

/** Create a new feature flag (admin). */
export const createFeatureFlag = async (
  data: AdminFeatureFlagFormData
): Promise<FeatureFlag> => {
  const response = await api.post('/feature-flags/admin', data);
  return response.data.data;
};

/** Update a feature flag by ID (admin). */
export const updateAdminFeatureFlag = async (
  id: string,
  data: Partial<AdminFeatureFlagFormData>
): Promise<FeatureFlag> => {
  const response = await api.put(`/feature-flags/admin/${id}`, data);
  return response.data.data;
};

/** Delete a feature flag by ID (admin). */
export const deleteFeatureFlag = async (id: string): Promise<void> => {
  await api.delete(`/feature-flags/admin/${id}`);
};

/** Toggle a feature flag on/off (admin). */
export const toggleAdminFeatureFlag = async (id: string): Promise<void> => {
  await api.post(`/feature-flags/admin/${id}/toggle`);
};

// ─── Audit Log Statistics & Export ───────────────────────────────────────────

export interface AuditLogStats {
  total: number;
  byAction: Array<{ action: string; count: number }>;
  byResourceType: Array<{ resourceType: string; count: number }>;
  recentActivity: Array<{
    id: string;
    action: string;
    resourceType: string;
    userEmail?: string;
    createdAt: string;
  }>;
}

export interface AuditLogStatsParams {
  startDate?: string;
  endDate?: string;
}

/** Fetch audit log statistics. */
export const fetchAuditLogStats = async (
  params?: AuditLogStatsParams
): Promise<AuditLogStats> => {
  const response = await api.get('/admin/audit-logs/statistics', { params });
  return response.data.data;
};

// ─── Blacklist Update ─────────────────────────────────────────────────────────

export interface UpdateBlacklistData {
  reason?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  autoBlock?: boolean;
  expiresAt?: string;
}

/** Update a blacklist entry by ID. */
export const updateBlacklistEntry = async (
  id: string,
  data: UpdateBlacklistData
): Promise<BlacklistEntry> => {
  const response = await api.put(`/admin/blacklist/${id}`, data);
  return response.data.data;
};

// ─── Communication Logs ───────────────────────────────────────────────────────

export interface CommunicationLog {
  id: string;
  channel: string;
  recipient: string;
  subject?: string;
  message?: string;
  status: string;
  errorMessage?: string;
  userId?: string;
  createdAt: string;
}

export interface CommunicationStats {
  total: number;
  sent: number;
  failed: number;
  blocked: number;
  successRate: string;
}

export interface ChannelStats {
  channel: string;
  total: number;
  sent: number;
  failed: number;
  successRate: string;
}

export interface CommunicationLogParams {
  channel?: string;
  status?: string;
  recipient?: string;
  page?: number;
  limit?: number;
}

/** Fetch communication logs. */
export const fetchCommunicationLogs = async (
  params?: CommunicationLogParams
): Promise<{ logs: CommunicationLog[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
  const searchParams = new URLSearchParams();
  if (params?.channel) searchParams.append('channel', params.channel);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.recipient) searchParams.append('recipient', params.recipient);
  if (params?.page != null) searchParams.append('page', params.page.toString());
  if (params?.limit != null) searchParams.append('limit', params.limit.toString());
  const response = await api.get(`/admin/communication-logs/logs?${searchParams.toString()}`);
  return response.data.data;
};

/** Fetch communication statistics. */
export const fetchCommunicationStats = async (): Promise<CommunicationStats> => {
  const response = await api.get('/admin/communication-logs/statistics');
  return response.data.data;
};

/** Fetch per-channel communication statistics. */
export const fetchChannelStats = async (): Promise<ChannelStats[]> => {
  const response = await api.get('/admin/communication-logs/statistics/channels');
  return response.data.data;
};

// ─── Communication Settings ───────────────────────────────────────────────────

export interface CommunicationSettings {
  id: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  otpEnabled: boolean;
  pushEnabled: boolean;
  emailRateLimit: number;
  smsRateLimit: number;
  otpRateLimit: number;
  otpExpiryMinutes: number;
  otpLength: number;
  updatedAt: string;
  createdAt: string;
}

export interface UpdateCommunicationSettingsData {
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  otpEnabled?: boolean;
  pushEnabled?: boolean;
  emailRateLimit?: number;
  smsRateLimit?: number;
  otpRateLimit?: number;
  otpExpiryMinutes?: number;
  otpLength?: number;
}

/** Fetch communication settings. */
export const fetchCommunicationSettings = async (): Promise<CommunicationSettings> => {
  const response = await api.get('/admin/communication-settings');
  return response.data.data;
};

/** Update communication settings. */
export const updateCommunicationSettings = async (
  data: UpdateCommunicationSettingsData
): Promise<CommunicationSettings> => {
  const response = await api.put('/admin/communication-settings', data);
  return response.data.data;
};

// ─── System Health / Status ───────────────────────────────────────────────────

export interface SystemStatus {
  api: { status: string; version: string; uptime: number };
  database: { status: string };
  services: { email: string; sms: string; stripe: string; paypal: string; razorpay: string };
  timestamp: string;
}

export interface SystemMetrics {
  users: { total: number; merchants: number; customers: number };
  giftCards: { total: number; active: number; expired: number; redeemed: number };
  transactions: { payments: number; redemptions: number };
  revenue: { total: number; currency: string };
  timestamp: string;
}

/** Fetch system health status. */
export const fetchSystemStatus = async (): Promise<SystemStatus> => {
  const response = await api.get('/health/status');
  return response.data.data;
};

/** Fetch system metrics. */
export const fetchSystemMetrics = async (): Promise<SystemMetrics> => {
  const response = await api.get('/health/metrics');
  return response.data.data;
};

// ─── Admin Payouts ────────────────────────────────────────────────────────────

export interface Payout {
  id: string;
  merchantId: string;
  merchant?: { id: string; email: string; businessName?: string };
  amount: number;
  currency: string;
  status: string;
  payoutMethod: string;
  netAmount: number;
  commissionAmount?: number;
  createdAt: string;
  processedAt?: string;
  failureReason?: string;
  retryCount: number;
}

export interface PayoutStats {
  totalPayouts: number;
  totalAmount: number;
  byStatus: Array<{ status: string; count: number; amount: number }>;
}

export interface PayoutListParams {
  page?: number;
  limit?: number;
  status?: string;
  merchantId?: string;
}

/** Fetch admin payout list. */
export const fetchPayouts = async (
  params?: PayoutListParams
): Promise<{ data: Payout[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> => {
  const response = await api.get('/admin/payouts', { params });
  return response.data;
};

/** Fetch payout statistics. */
export const fetchPayoutStats = async (): Promise<PayoutStats> => {
  const response = await api.get('/admin/payouts/stats');
  return response.data.data;
};

/** Manually process a pending payout. */
export const processPayout = async (id: string): Promise<void> => {
  await api.post(`/admin/payouts/${id}/process`);
};

/** Retry a failed payout. */
export const retryPayout = async (id: string): Promise<void> => {
  await api.post(`/admin/payouts/${id}/retry`);
};

// ─── Admin Users ──────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  businessName?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface AdminUserListParams {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Fetch all users (admin only).
 */
export const fetchAdminUsers = async (
  params?: AdminUserListParams
): Promise<{ data: AdminUser[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

/**
 * Toggle a user's active status (admin only).
 */
export const toggleUserActive = async (
  userId: string,
  isActive: boolean
): Promise<AdminUser> => {
  const response = await api.put(`/admin/users/${userId}/toggle-active`, { isActive });
  return response.data.data;
};

// ─── Chargebacks ──────────────────────────────────────────────────────────────

export interface Chargeback {
  id: string;
  paymentId: string;
  giftCardId: string;
  amount: number;
  currency: string;
  fee: number;
  status: 'PENDING' | 'WON' | 'LOST' | 'WITHDRAWN';
  reason?: string;
  chargebackId: string;
  disputeId?: string;
  createdAt: string;
  resolvedAt?: string;
  payment: {
    id: string;
    giftCard: { id: string; code: string };
  };
}

export interface ChargebackStatistics {
  total: number;
  pending: number;
  won: number;
  lost: number;
  totalAmount: number;
  totalFees: number;
  winRate: number;
}

export interface ChargebackListParams {
  page?: number;
  limit?: number;
  status?: string;
}

/**
 * Fetch a paginated list of chargebacks.
 */
export const fetchChargebacks = async (
  params?: ChargebackListParams
): Promise<Chargeback[]> => {
  const response = await api.get('/chargebacks', { params });
  return response.data.data;
};

/**
 * Fetch chargeback statistics.
 */
export const fetchChargebackStatistics = async (): Promise<ChargebackStatistics> => {
  const response = await api.get('/chargebacks/statistics');
  return response.data.data;
};

// ─── Delivery / Communication Logs ───────────────────────────────────────────

export interface DeliveryLogParams {
  page?: number;
  limit?: number;
  search?: string;
  channel?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  merchantId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Fetch delivery / communication logs.
 */
export const fetchDeliveryLogs = async (
  params?: DeliveryLogParams
): Promise<{ data: CommunicationLog[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> => {
  const response = await api.get('/admin/communication-logs/logs', { params });
  return response.data;
};

/**
 * Download a gift card PDF by gift card ID.
 * Returns the raw blob response.
 */
export const downloadGiftCardPDF = async (giftCardId: string): Promise<Blob> => {
  const response = await api.get(`/delivery/pdf/${giftCardId}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

export const adminApi = {
  fetchAuditLogs,
  fetchAuditLogStats,
  fetchFeatureFlags,
  fetchAllFeatureFlags,
  fetchFeatureFlagStats,
  createFeatureFlag,
  updateAdminFeatureFlag,
  deleteFeatureFlag,
  toggleAdminFeatureFlag,
  updateFeatureFlag,
  toggleFeatureFlag,
  fetchBlacklist,
  addToBlacklist,
  updateBlacklistEntry,
  removeFromBlacklist,
  fetchPlatformStats,
  fetchCommunicationLogs,
  fetchCommunicationStats,
  fetchChannelStats,
  fetchCommunicationSettings,
  updateCommunicationSettings,
  fetchSystemStatus,
  fetchSystemMetrics,
  fetchPayouts,
  fetchPayoutStats,
  processPayout,
  retryPayout,
  fetchAdminUsers,
  toggleUserActive,
  fetchChargebacks,
  fetchChargebackStatistics,
  fetchDeliveryLogs,
  downloadGiftCardPDF,
};
