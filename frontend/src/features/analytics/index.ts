/**
 * Analytics feature — public API
 */

// API
export { analyticsApi } from './api';
export {
  fetchSalesAnalytics,
  fetchRedemptionAnalytics,
  fetchCustomerAnalytics,
  fetchGiftCardAnalytics,
  fetchAnalyticsSummary,
  fetchRevenueAnalytics,
  fetchBreakageReport,
  fetchExpiredCards,
  fetchBreakageMetrics,
  fetchBreakageReportDetail,
  exportAnalyticsReport,
} from './api';

// Types (re-exported from the api module where they're co-located)
export type {
  SalesAnalytics,
  RedemptionAnalytics,
  CustomerAnalytics,
  GiftCardAnalytics,
  AnalyticsSummary,
  BreakageReport,
  BreakageMetrics,
  BreakageReportDetail,
  ExpiredCard,
} from './api';

// Hooks
export { useAnalytics } from './hooks/useAnalytics';
