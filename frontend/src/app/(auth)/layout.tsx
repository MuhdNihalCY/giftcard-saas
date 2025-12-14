'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import logger from '@/lib/logger';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    // Check auth status
    checkAuth();

    // Check localStorage directly for immediate check
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          
          // Import auth utility to check token expiration
          import('@/lib/auth').then(({ auth: authUtil }) => {
            if (!authUtil.isAccessTokenExpired()) {
              // User is authenticated, redirect away from auth pages
              if (pathname === '/login' || pathname === '/register' || pathname === '/auth') {
                const redirectUrl = user.role === 'ADMIN' || user.role === 'MERCHANT' 
                  ? '/dashboard' 
                  : '/';
                window.location.replace(redirectUrl);
              }
            }
          });
        } catch (e) {
          // Error in auth check - acceptable in layout
          if (process.env.NODE_ENV === 'development') {
            logger.error('Error checking auth', { error: e });
          }
        }
      }
    }

    // Also check Zustand state
    if (isAuthenticated) {
      const user = useAuthStore.getState().user;
      if (user && (pathname === '/login' || pathname === '/register' || pathname === '/auth')) {
        const redirectUrl = user.role === 'ADMIN' || user.role === 'MERCHANT' 
          ? '/dashboard' 
          : '/';
        window.location.href = redirectUrl;
      }
    }
  }, [isAuthenticated, pathname, router, checkAuth]);

  return <>{children}</>;
}

