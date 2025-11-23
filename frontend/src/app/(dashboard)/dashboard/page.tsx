'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.role === 'MERCHANT') {
      fetchStats();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      // Fetch gift cards
      const giftCardsRes = await api.get('/gift-cards', {
        params: { merchantId: user?.id },
      });
      const giftCards = giftCardsRes.data.data || [];

      // Fetch payments
      const paymentsRes = await api.get('/payments', {
        params: { status: 'COMPLETED' },
      });
      const payments = paymentsRes.data.data || [];

      // Calculate stats
      const totalRevenue = payments.reduce(
        (sum: number, p: any) => sum + Number(p.amount),
        0
      );
      const activeCards = giftCards.filter((gc: any) => gc.status === 'ACTIVE').length;
      const redeemedCards = giftCards.filter((gc: any) => gc.status === 'REDEEMED').length;

      setStats({
        totalRevenue,
        activeCards,
        redeemedCards,
        totalCards: giftCards.length,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Welcome back, {user?.firstName || user?.email}!
      </h1>
      <p className="text-gray-600 mb-8">
        {user?.role === 'CUSTOMER'
          ? 'Manage your gift cards and wallet from here.'
          : 'Here is an overview of your business performance.'}
      </p>

      {(user?.role === 'ADMIN' || user?.role === 'MERCHANT') && stats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">Active Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.activeCards}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">Redeemed Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.redeemedCards}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">Total Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalCards}</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(user?.role === 'ADMIN' || user?.role === 'MERCHANT') && (
              <>
                <Link href="/dashboard/gift-cards/create">
                  <Button className="w-full">Create Gift Card</Button>
                </Link>
                <Link href="/dashboard/gift-cards">
                  <Button className="w-full" variant="outline">
                    Manage Gift Cards
                  </Button>
                </Link>
              </>
            )}
            <Link href="/wallet">
              <Button className="w-full" variant="outline">
                View My Wallet
              </Button>
            </Link>
            <Link href="/browse">
              <Button className="w-full" variant="outline">
                Browse Gift Cards
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">No recent activity</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

