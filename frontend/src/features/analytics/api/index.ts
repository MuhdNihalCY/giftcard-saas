/**
 * Analytics feature API functions
 */
import api from '@/lib/api';

export interface SalesAnalytics {
  totalRevenue: number;
  revenueByMethod: Record<string, number>;
  revenueByDay?: Array<{ date: string; amount: number }>;
  revenueByMonth?: Array<{ month: string; amount: number }>;
  averageOrderValue?: number;
  totalTransactions?: number;
}

export interface RedemptionAnalytics {
  totalRedeemed: number;
  redemptionByMethod: Record<string, number>;
  redemptionRate?: number;
  averageRedemptionAmount?: number;
  redemptionsByDay?: Array<{ date: string; count: number; amount: number }>;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers?: number;
  returningCustomers?: number;
  customersByRegion?: Record<string, number>;
}

export interface GiftCardAnalytics {
  total: number;
  active: number;
  redeemed: number;
  expired: number;
  cancelled: number;
  redemptionRate: number;
  totalValue?: number;
  totalBalance?: number;
  breakage?: number;
}

export interface AnalyticsSummary {
  sales: SalesAnalytics;
  redemptions: RedemptionAnalytics;
  customers: CustomerAnalytics;
  giftCards: GiftCardAnalytics;
}

export interface BreakageReport {
  merchantId?: string;
  totalIssued: number;
  totalRedeemed: number;
  expiredUnredeemed: number;
  breakageAmount: number;
  breakageRate: number;
  period?: { start: string; end: string };
}

export interface ExpiredCard {
  id: string;
  code: string;
  value: number;
  balance: number;
  expiryDate: string;
  merchantId: string;
}

/**
 * Fetch sales analytics data.
 */
export const fetchSalesAnalytics = async (params?: {
  merchantId?: string;
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}): Promise<SalesAnalytics> => {
  const response = await api.get('/analytics/sales', { params });
  return response.data.data;
};

/**
 * Fetch redemption analytics data.
 */
export const fetchRedemptionAnalytics = async (params?: {
  merchantId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<RedemptionAnalytics> => {
  const response = await api.get('/analytics/redemptions', { params });
  return response.data.data;
};

/**
 * Fetch customer analytics data.
 */
export const fetchCustomerAnalytics = async (params?: {
  merchantId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<CustomerAnalytics> => {
  const response = await api.get('/analytics/customers', { params });
  return response.data.data;
};

/**
 * Fetch gift card statistics.
 */
export const fetchGiftCardAnalytics = async (params?: {
  merchantId?: string;
}): Promise<GiftCardAnalytics> => {
  const response = await api.get('/analytics/gift-cards', { params });
  return response.data.data;
};

/**
 * Fetch all analytics data in one call.
 * Fires four requests in parallel and resolves when all complete.
 */
export const fetchAnalyticsSummary = async (params?: {
  merchantId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<AnalyticsSummary> => {
  const [sales, redemptions, customers, giftCards] = await Promise.all([
    fetchSalesAnalytics(params),
    fetchRedemptionAnalytics(params),
    fetchCustomerAnalytics(params),
    fetchGiftCardAnalytics(params),
  ]);
  return { sales, redemptions, customers, giftCards };
};

/**
 * Fetch the revenue analytics summary (alias for fetchSalesAnalytics).
 */
export const fetchRevenueAnalytics = fetchSalesAnalytics;

/**
 * Fetch the breakage report for expired / unredeemed gift cards.
 */
export const fetchBreakageReport = async (params?: {
  merchantId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<BreakageReport> => {
  const response = await api.get('/analytics/breakage', { params });
  return response.data.data;
};

/**
 * Fetch a list of expired, unredeemed gift cards.
 */
export const fetchExpiredCards = async (params?: {
  merchantId?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: ExpiredCard[]; pagination?: { total: number } }> => {
  const response = await api.get('/analytics/expired-cards', { params });
  return response.data;
};

export interface BreakageMetrics {
  current: {
    breakageAmount: number;
    breakagePercentage: number;
    totalIssued: number;
    totalUnredeemed: number;
  };
  previous: {
    breakageAmount: number;
    breakagePercentage: number;
    totalIssued: number;
  };
  trend: {
    breakageAmountChange: number;
    breakagePercentageChange: number;
    trendDirection: 'increasing' | 'decreasing' | 'stable';
  };
}

export interface BreakageReportDetail {
  period: {
    startDate: string;
    endDate: string;
  };
  calculations: {
    totalIssued: number;
    totalRedeemed: number;
    totalUnredeemed: number;
    totalExpired: number;
    totalExpiredUnredeemed: number;
    breakageAmount: number;
    breakagePercentage: number;
    gracePeriodDays: number;
  };
  expiredCards: Array<{
    id: string;
    code: string;
    value: number;
    balance: number;
    expiryDate: string;
    expiredDate: string;
    gracePeriodEndDate: string;
    isBreakage: boolean;
  }>;
}

/**
 * Fetch breakage metrics (current/previous period comparison and trend).
 */
export const fetchBreakageMetrics = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<BreakageMetrics> => {
  const response = await api.get('/breakage/metrics', { params });
  return response.data.data;
};

/**
 * Fetch detailed breakage report including expired cards.
 */
export const fetchBreakageReportDetail = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<BreakageReportDetail> => {
  const response = await api.get('/breakage/report', { params });
  return response.data.data;
};

/**
 * Export analytics data as a downloadable file (returns raw Blob).
 */
export const exportAnalyticsReport = async (params?: {
  startDate?: string;
  endDate?: string;
  merchantId?: string;
  format?: string;
}): Promise<Blob> => {
  const response = await api.get('/analytics/export', { params, responseType: 'blob' });
  return response.data;
};

export const analyticsApi = {
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
};
