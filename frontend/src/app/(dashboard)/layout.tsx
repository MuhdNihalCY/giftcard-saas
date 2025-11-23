'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Navigation } from '@/components/Navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    // Check auth on mount
    checkAuth();
    
    // Also check after a short delay to ensure state is loaded
    const timeout = setTimeout(() => {
      const currentAuth = useAuthStore.getState();
      if (!currentAuth.isAuthenticated) {
        router.replace('/login');
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-navy-900 text-navy-50">
      <Navigation />
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
        {children}
      </main>
    </div>
  );
}

