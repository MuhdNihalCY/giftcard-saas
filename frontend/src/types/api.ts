/**
 * API response type definitions for frontend
 */

// Generic API response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Authentication types
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'ADMIN' | 'MERCHANT' | 'CUSTOMER';
  businessName?: string;
  businessLogo?: string;
  isEmailVerified: boolean;
  isActive: boolean;
}

// Gift Card types
export interface GiftCard {
  id: string;
  code: string;
  value: number;
  balance: number;
  currency: string;
  status: 'ACTIVE' | 'REDEEMED' | 'EXPIRED' | 'CANCELLED';
  expiryDate?: string;
  merchantId: string;
  recipientEmail?: string;
  allowPartialRedemption: boolean;
  createdAt: string;
  updatedAt: string;
}

// Payment types
export interface Payment {
  id: string;
  giftCardId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  createdAt: string;
}

// Redemption types
export interface Redemption {
  id: string;
  giftCardId: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  redemptionMethod: string;
  createdAt: string;
}


