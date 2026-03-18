/**
 * Shared lib re-exports
 *
 * Import shared utilities from '@/shared/lib' rather than directly from '@/lib/*'.
 * This keeps the dependency direction clean (features -> shared, never shared -> features).
 */

// Axios instance (default export)
export { default as api } from '@/lib/api';

// Auth utilities
export { auth } from '@/lib/auth';
export type { User, AuthResponse } from '@/lib/auth';

// Logger
export { default as logger } from '@/lib/logger';

// Utility functions
export {
  formatCurrency,
  formatDate,
  formatDateTime,
  cn,
} from '@/lib/utils';
