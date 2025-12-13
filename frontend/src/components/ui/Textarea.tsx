import React, { useId } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  variant?: 'default' | 'plum';
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, variant = 'default', ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    const borderColor = variant === 'plum' 
      ? 'border-plum-500 focus:border-gold-500 focus:ring-gold-500' 
      : error 
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
        : 'border-navy-600 focus:border-gold-500 focus:ring-gold-500';

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-plum-200 mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-900 transition-all',
            'text-navy-50 bg-navy-800/50 backdrop-blur-sm placeholder:text-plum-300',
            'resize-y min-h-[100px]',
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

Textarea.displayName = 'Textarea';




