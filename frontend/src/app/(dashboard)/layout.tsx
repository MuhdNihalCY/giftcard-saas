'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, clearAuth, checkAuth } = useAuthStore();

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

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navigation */}
      <nav className="bg-white shadow-sm text-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-xl font-bold text-primary-600">
                🎁 GiftCard SaaS
              </Link>
              <div className="flex space-x-4">
                <Link
                  href="/dashboard"
                  className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                {(user?.role === 'ADMIN' || user?.role === 'MERCHANT') && (
                  <>
                    <Link
                      href="/dashboard/gift-cards"
                      className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Gift Cards
                    </Link>
                    <Link
                      href="/dashboard/templates"
                      className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Templates
                    </Link>
                    <Link
                      href="/dashboard/analytics"
                      className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Analytics
                    </Link>
                    <Link
                      href="/dashboard/reports/sales"
                      className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Reports
                    </Link>
                    <Link
                      href="/dashboard/redeem"
                      className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Redeem
                    </Link>
                  </>
                )}
                {user?.role === 'ADMIN' && (
                  <>
                    <Link
                      href="/dashboard/users"
                      className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Users
                    </Link>
                    <Link
                      href="/dashboard/admin/communications"
                      className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Communications
                    </Link>
                    <Link
                      href="/dashboard/admin/communication-logs"
                      className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Comm Logs
                    </Link>
                  </>
                )}
                <Link
                  href="/dashboard/settings"
                  className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Settings
                </Link>
                <Link
                  href="/wallet"
                  className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  My Wallet
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-900">{user?.email}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

