import React, { useId } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  variant?: 'default' | 'plum';
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, variant = 'default', children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    const borderColor = variant === 'plum' 
      ? 'border-rose-500 focus:border-cyan-500 focus:ring-cyan-500' 
      : error 
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
        : 'border-slate-300 dark:border-slate-700 focus:border-cyan-500 focus:ring-cyan-500';

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 transition-all',
            'text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800',
            borderColor,
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// Helper components for compatibility with shadcn-style API
export const SelectTrigger = React.forwardRef<HTMLSelectElement, SelectProps>(
  (props, ref) => <Select ref={ref} {...props} />
);
SelectTrigger.displayName = 'SelectTrigger';

export const SelectContent = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const SelectItem = ({ value, children, ...props }: { value: string; children: React.ReactNode; [key: string]: any }) => {
  return (
    <option value={value} {...props}>
      {children}
    </option>
  );
};

export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  // This is a no-op component for compatibility
  return null;
};




