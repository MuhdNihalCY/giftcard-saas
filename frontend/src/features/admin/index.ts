/**
 * Admin feature — public API
 */

// API
export { adminApi } from './api';
export {
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
} from './api';

// Types (co-located in api module)
export type {
  AuditLog,
  AuditLogStats,
  AuditLogStatsParams,
  FeatureFlag,
  FeatureFlagStats,
  AdminFeatureFlagFormData,
  BlacklistEntry,
  UpdateBlacklistData,
  UpdateFeatureFlagData,
  AuditLogListParams,
  BlacklistListParams,
  CommunicationLog,
  CommunicationStats,
  ChannelStats,
  CommunicationLogParams,
  CommunicationSettings,
  UpdateCommunicationSettingsData,
  SystemStatus,
  SystemMetrics,
  Payout,
  PayoutStats,
  PayoutListParams,
  AdminUser,
  AdminUserListParams,
  Chargeback,
  ChargebackStatistics,
  ChargebackListParams,
  DeliveryLogParams,
} from './api';

// Hooks
export { useAdmin } from './hooks/useAdmin';
