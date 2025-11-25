/**
 * Application constants for frontend
 */

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  GIFT_CARDS: {
    LIST: '/gift-cards',
    CREATE: '/gift-cards',
    GET: (id: string) => `/gift-cards/${id}`,
    UPDATE: (id: string) => `/gift-cards/${id}`,
    DELETE: (id: string) => `/gift-cards/${id}`,
  },
  PAYMENTS: {
    CREATE_INTENT: '/payments/create-intent',
    CONFIRM: '/payments/confirm',
    REFUND: (id: string) => `/payments/${id}/refund`,
  },
  REDEMPTIONS: {
    VALIDATE: '/redemptions/validate',
    CHECK_BALANCE: '/redemptions/check-balance',
    REDEEM: '/redemptions/redeem',
  },
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  WALLET: '/dashboard/wallet',
  REDEEM: '/dashboard/redeem',
  BROWSE: '/browse',
} as const;

// User roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MERCHANT: 'MERCHANT',
  CUSTOMER: 'CUSTOMER',
} as const;

// Gift card statuses
export const GIFT_CARD_STATUS = {
  ACTIVE: 'ACTIVE',
  REDEEMED: 'REDEEMED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
} as const;

// Payment methods
export const PAYMENT_METHODS = {
  STRIPE: 'STRIPE',
  PAYPAL: 'PAYPAL',
  RAZORPAY: 'RAZORPAY',
  UPI: 'UPI',
} as const;

// Default values
export const DEFAULTS = {
  PAGINATION_LIMIT: 20,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An error occurred on the server. Please try again later.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  SAVED: 'Saved successfully',
} as const;


