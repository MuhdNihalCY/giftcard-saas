/**
 * Application constants
 * Centralized location for magic strings, numbers, and configuration values
 */

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

// Payment statuses
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;

// Redemption methods
export const REDEMPTION_METHODS = {
  QR_CODE: 'QR_CODE',
  CODE_ENTRY: 'CODE_ENTRY',
  LINK: 'LINK',
  API: 'API',
} as const;

// Transaction types
export const TRANSACTION_TYPES = {
  PURCHASE: 'PURCHASE',
  REDEMPTION: 'REDEMPTION',
  REFUND: 'REFUND',
  EXPIRY: 'EXPIRY',
} as const;

// Default values
export const DEFAULTS = {
  PAGINATION_LIMIT: 20,
  PAGINATION_MAX_LIMIT: 100,
  TOKEN_EXPIRY_HOURS: 24,
  PASSWORD_MIN_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 30,
  CACHE_TTL_SECONDS: 300, // 5 minutes
} as const;

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  INTERNAL_ERROR: 'Internal server error',
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Account is locked due to too many failed login attempts',
  EMAIL_NOT_VERIFIED: 'Email address not verified',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
} as const;


