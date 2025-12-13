import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'active'
  | 'inactive'
  | 'pending'
  | 'completed'
  | 'expired'
  | 'cancelled'
  | 'redeemed';

export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700 border-slate-300',
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  active: 'bg-green-50 text-green-700 border-green-200',
  inactive: 'bg-slate-100 text-slate-500 border-slate-300',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  expired: 'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-300',
  redeemed: 'bg-rose-50 text-rose-700 border-rose-200',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// Helper function to get badge variant from status
export function getStatusBadgeVariant(status: string): BadgeVariant {
  const statusUpper = status.toUpperCase();
  switch (statusUpper) {
    case 'ACTIVE':
      return 'active';
    case 'INACTIVE':
      return 'inactive';
    case 'PENDING':
      return 'pending';
    case 'COMPLETED':
      return 'completed';
    case 'EXPIRED':
      return 'expired';
    case 'CANCELLED':
      return 'cancelled';
    case 'REDEEMED':
      return 'redeemed';
    case 'FAILED':
      return 'error';
    case 'SUCCESS':
      return 'success';
    default:
      return 'default';
  }
}

