import React, { useId } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: 'default' | 'plum';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, variant = 'default', ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    const borderColor = variant === 'plum' 
      ? 'border-rose-500 focus:border-cyan-500 focus:ring-cyan-500' 
      : error 
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
        : 'border-slate-300 dark:border-slate-700 focus:border-cyan-500 focus:ring-cyan-500';

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 transition-all',
            'text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-400 dark:placeholder:text-slate-500',
            borderColor,
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

