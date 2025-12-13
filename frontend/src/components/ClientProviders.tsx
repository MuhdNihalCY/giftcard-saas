'use client';

import { useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { ToastProvider } from './ui/ToastContainer';
import { useThemeStore } from '@/store/themeStore';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  // Initialize theme on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  return (
    <ErrorBoundary>
      <ToastProvider>
        {children}
      </ToastProvider>
    </ErrorBoundary>
  );
}













