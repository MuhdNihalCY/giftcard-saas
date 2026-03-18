/**
 * Payments feature API functions
 */
import api from '@/lib/api';
import type {
  Payment,
  CreatePaymentData,
  ConfirmPaymentData,
  RefundPaymentData,
  PaymentListParams,
} from '../types';

/**
 * Fetch a paginated list of payments.
 */
export const fetchPayments = async (params?: PaymentListParams): Promise<{
  data: Payment[];
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}> => {
  const response = await api.get('/payments', { params });
  return response.data;
};

/**
 * Fetch a single payment by ID.
 */
export const fetchPaymentById = async (id: string): Promise<Payment> => {
  const response = await api.get(`/payments/${id}`);
  return response.data.data;
};

/**
 * Create / initiate a payment for a gift card purchase.
 */
export const createPayment = async (data: CreatePaymentData): Promise<Payment & { clientSecret?: string }> => {
  const response = await api.post('/payments', data);
  return response.data.data;
};

/**
 * Confirm a payment after the client-side payment flow completes.
 */
export const confirmPayment = async (
  paymentId: string,
  data: ConfirmPaymentData
): Promise<Payment> => {
  const response = await api.post(`/payments/${paymentId}/confirm`, data);
  return response.data.data;
};

/**
 * Issue a full or partial refund for a completed payment.
 */
export const refundPayment = async (paymentId: string, data?: RefundPaymentData): Promise<Payment> => {
  const response = await api.post(`/payments/${paymentId}/refund`, data ?? {});
  return response.data.data;
};

/**
 * Fetch autocomplete suggestions for payment search.
 */
export const fetchPaymentSuggestions = async (query: string): Promise<unknown[]> => {
  const response = await api.get('/payments/suggestions', { params: { q: query } });
  return response.data.data || [];
};

// ─── Payment Gateways (merchant) ──────────────────────────────────────────────

export interface Gateway {
  id: string;
  gatewayType: 'STRIPE' | 'PAYPAL' | 'RAZORPAY' | 'UPI';
  isActive: boolean;
  connectAccountId?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'FAILED';
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectPayPalData {
  gatewayType: 'PAYPAL';
  credentials: {
    clientId: string;
    clientSecret: string;
    mode: 'live' | 'sandbox';
  };
}

/**
 * Fetch all payment gateways for the authenticated merchant.
 */
export const fetchGateways = async (): Promise<Gateway[]> => {
  const response = await api.get('/merchant/payment-gateways');
  return response.data.data || [];
};

/**
 * Create a Stripe Connect account for the authenticated merchant.
 */
export const createStripeConnect = async (data: {
  email?: string;
  country?: string;
  type?: string;
}): Promise<unknown> => {
  const response = await api.post('/merchant/payment-gateways/stripe/connect', data);
  return response.data.data;
};

/**
 * Get the Stripe Connect onboarding link for the authenticated merchant.
 */
export const getStripeConnectLink = async (): Promise<{ url: string }> => {
  const response = await api.get('/merchant/payment-gateways/stripe/connect-link');
  return response.data.data;
};

/**
 * Connect a PayPal account for the authenticated merchant.
 */
export const connectPayPal = async (data: ConnectPayPalData): Promise<Gateway> => {
  const response = await api.post('/merchant/payment-gateways/paypal/connect', data);
  return response.data.data;
};

/**
 * Verify a payment gateway by ID.
 */
export const verifyGateway = async (id: string): Promise<void> => {
  await api.post(`/merchant/payment-gateways/${id}/verify`);
};

/**
 * Deactivate a payment gateway by ID.
 */
export const deactivateGateway = async (id: string): Promise<void> => {
  await api.post(`/merchant/payment-gateways/${id}/deactivate`);
};

/**
 * Delete a payment gateway by ID.
 */
export const deleteGateway = async (id: string): Promise<void> => {
  await api.delete(`/merchant/payment-gateways/${id}`);
};

/**
 * Create a payment intent for purchasing a specific gift card by ID.
 */
export const createPaymentIntent = async (data: Record<string, unknown>): Promise<unknown> => {
  const response = await api.post('/payments/create-intent', data);
  return response.data.data;
};

/**
 * Create a payment from a gift card product.
 */
export const createPaymentFromProduct = async (data: Record<string, unknown>): Promise<unknown> => {
  const response = await api.post('/payments/from-product', data);
  return response.data.data;
};

/**
 * Create a bulk gift card purchase for multiple recipients.
 */
export const createBulkPurchase = async (data: Record<string, unknown>): Promise<unknown> => {
  const response = await api.post('/payments/bulk-purchase', data);
  return response.data.data;
};

export const paymentsApi = {
  fetchPayments,
  fetchPaymentById,
  createPayment,
  confirmPayment,
  refundPayment,
  fetchPaymentSuggestions,
  fetchGateways,
  createStripeConnect,
  getStripeConnectLink,
  connectPayPal,
  verifyGateway,
  deactivateGateway,
  deleteGateway,
  createPaymentIntent,
  createPaymentFromProduct,
  createBulkPurchase,
};
