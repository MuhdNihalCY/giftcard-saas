/**
 * Payouts feature API functions
 */
import api from '@/lib/api';

export interface Payout {
  id: string;
  merchantId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  payoutMethod: string;
  netAmount: number;
  commissionAmount?: number;
  failureReason?: string;
  createdAt: string;
  processedAt?: string;
}

export interface PayoutSettings {
  id?: string;
  merchantId?: string;
  payoutMethod: string;
  payoutSchedule: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ON_REQUEST';
  minimumPayoutAmount: number;
  bankAccountNumber?: string;
  bankRoutingNumber?: string;
  bankAccountName?: string;
  isActive: boolean;
}

export interface RequestPayoutData {
  amount: number;
  notes?: string;
}

export interface UpdatePayoutSettingsData {
  payoutMethod?: string;
  payoutSchedule?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ON_REQUEST';
  minimumPayoutAmount?: number;
  bankAccountNumber?: string;
  bankRoutingNumber?: string;
  bankAccountName?: string;
}

export interface PayoutListParams {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Fetch a paginated list of payouts for the authenticated merchant.
 */
export const fetchPayouts = async (params?: PayoutListParams): Promise<{
  data: Payout[];
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}> => {
  const response = await api.get('/payouts', { params });
  return response.data;
};

/**
 * Fetch a single payout by ID.
 */
export const fetchPayoutById = async (id: string): Promise<Payout> => {
  const response = await api.get(`/payouts/${id}`);
  return response.data.data;
};

/**
 * Request a new payout of the given amount.
 */
export const requestPayout = async (data: RequestPayoutData): Promise<Payout> => {
  const response = await api.post('/payouts/request', data);
  return response.data.data;
};

/**
 * Fetch the available balance for the authenticated merchant.
 */
export const fetchAvailableBalance = async (): Promise<{
  availableBalance: number;
  currency: string;
}> => {
  const response = await api.get('/payouts/available-balance');
  return response.data.data;
};

/**
 * Fetch payout settings for the authenticated merchant.
 */
export const fetchPayoutSettings = async (): Promise<PayoutSettings | null> => {
  const response = await api.get('/payouts/settings');
  return response.data.data;
};

/**
 * Create or update payout settings for the authenticated merchant.
 */
export const updatePayoutSettings = async (data: UpdatePayoutSettingsData): Promise<PayoutSettings> => {
  const response = await api.put('/payouts/settings', data);
  return response.data.data;
};

export const payoutsApi = {
  fetchPayouts,
  fetchPayoutById,
  requestPayout,
  fetchAvailableBalance,
  fetchPayoutSettings,
  updatePayoutSettings,
};
