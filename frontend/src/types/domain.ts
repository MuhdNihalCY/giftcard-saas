/**
 * Domain model type definitions for frontend
 */

// Money/Currency types
export interface Money {
  amount: number;
  currency: string;
}

// Form types
export interface FormError {
  field: string;
  message: string;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Table/List types
export interface TableColumn<T = unknown> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// Filter types
export interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
  value: unknown;
}


