/**
 * Payments feature — public API
 */

// API
export { paymentsApi } from './api';
export {
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
} from './api';

// Hooks
export { usePayments } from './hooks/usePayments';

// Types
export type {
  Payment,
  PaymentStatus,
  PaymentMethod,
  CreatePaymentData,
  ConfirmPaymentData,
  RefundPaymentData,
  PaymentListParams,
} from './types';
