'use client';

import { ErrorBoundary } from './ErrorBoundary';
import { ToastProvider } from './ui/ToastContainer';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        {children}
      </ToastProvider>
    </ErrorBoundary>
  );
}








