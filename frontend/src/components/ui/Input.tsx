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
      ? 'border-plum-500 focus:border-gold-500 focus:ring-gold-500' 
      : error 
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
        : 'border-navy-600 focus:border-gold-500 focus:ring-gold-500';

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-plum-200 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-900 transition-all',
            'text-navy-50 bg-navy-800/50 backdrop-blur-sm placeholder:text-plum-300',
            borderColor,
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

