/**
 * Shared type definitions for the backend
 * This file exports common types used across the application
 */

// Re-export Prisma types
export type {
  User,
  GiftCard,
  GiftCardProduct,
  GiftCardTemplate,
  Payment,
  Redemption,
  Transaction,
  UserRole,
  GiftCardStatus,
  PaymentMethod,
  PaymentStatus,
  RedemptionMethod,
  TransactionType,
} from '@prisma/client';

// API Response types
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

// Common ID types
export type ID = string;

// Timestamp types
export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

// Soft delete support
export interface SoftDelete {
  deletedAt?: Date | null;
}


