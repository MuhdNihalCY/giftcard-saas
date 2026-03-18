/**
 * Shared types re-exports
 *
 * Import shared domain / API types from '@/shared/types'.
 */

// API response shapes
export type {
  ApiResponse,
  PaginationParams,
  PaginationResult,
  AuthResponse,
  User,
  GiftCard,
  Payment,
  Redemption,
} from '@/types/api';

// Domain / UI helper types
export type {
  Money,
  FormError,
  LoadingState,
  TableColumn,
  SortConfig,
  FilterConfig,
} from '@/types/domain';
