'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ChartContainer } from '@/components/dashboard/ChartContainer';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import logger from '@/lib/logger';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Gift,
  TrendingUp,
  CreditCard,
  Users,
  DollarSign,
  Package,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { format, subDays } from 'date-fns';

const COLORS = ['#ffd700', '#8241a5', '#667eea', '#f093fb', '#4facfe'];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.role === 'MERCHANT') {
      fetchDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const merchantId = user?.role === 'MERCHANT' ? user.id : undefined;

      // Fetch all data in parallel
      const [
        giftCardsRes,
        paymentsRes,
        redemptionsRes,
        salesAnalytics,
        redemptionAnalytics,
        customerAnalytics,
        giftCardStats,
      ] = await Promise.all([
        api.get('/gift-cards', { params: { limit: 100, merchantId } }),
        api.get('/payments', { params: { status: 'COMPLETED', limit: 100 } }),
        api.get('/redemptions', { params: { limit: 20 } }),
        api.get('/analytics/sales', { params: { merchantId } }),
        api.get('/analytics/redemptions', { params: { merchantId } }),
        api.get('/analytics/customers', { params: { merchantId } }),
        api.get('/analytics/gift-cards', { params: { merchantId } }),
      ]);

      const giftCards = giftCardsRes.data.data || [];
      const payments = paymentsRes.data.data || [];
      const redemptions = redemptionsRes.data.data || [];

      // Calculate stats
      const totalRevenue = payments.reduce(
        (sum: number, p: any) => sum + Number(p.amount),
        0
      );
      const activeCards = giftCards.filter((gc: any) => gc.status === 'ACTIVE').length;
      const redeemedCards = giftCards.filter((gc: any) => gc.status === 'REDEEMED').length;
      const totalTransactions = payments.length;
      const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      setStats({
        totalRevenue,
        activeCards,
        redeemedCards,
        totalCards: giftCards.length,
        totalTransactions,
        avgTransactionValue,
        merchantBalance: (user as any)?.merchantBalance || 0,
      });

      setAnalytics({
        sales: salesAnalytics.data.data,
        redemptions: redemptionAnalytics.data.data,
        customers: customerAnalytics.data.data,
        giftCards: giftCardStats.data.data,
      });

      // Prepare recent activity
      const activities = [
        ...payments.slice(0, 5).map((p: any) => ({
          type: 'payment',
          message: `Payment of ${formatCurrency(p.amount)} received`,
          time: p.createdAt,
          id: p.id,
        })),
        ...redemptions.slice(0, 5).map((r: any) => ({
          type: 'redemption',
          message: `Gift card redeemed for ${formatCurrency(r.amount)}`,
          time: r.createdAt,
          id: r.id,
        })),
        ...giftCards.slice(0, 3).map((gc: any) => ({
          type: 'giftcard',
          message: `Gift card ${gc.code} created`,
          time: gc.createdAt,
          id: gc.id,
        })),
      ]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 10);

      setRecentActivity(activities);
    } catch (error) {
      logger.error('Failed to fetch dashboard data', { error });
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare chart data
  const revenueByMethodData = analytics?.sales?.revenueByMethod
    ? Object.entries(analytics.sales.revenueByMethod).map(([method, value]) => ({
        name: method,
        value: Number(value),
      }))
    : [];

  const redemptionByMethodData = analytics?.redemptions?.redemptionByMethod
    ? Object.entries(analytics.redemptions.redemptionByMethod).map(([method, value]) => ({
        name: method,
        value: Number(value),
      }))
    : [];

  // Generate revenue trend data (last 30 days - simplified)
  const revenueTrendData = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    return {
      date: format(date, 'MMM d'),
      revenue: Math.random() * 1000 + 500, // Placeholder - would come from API
    };
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="page-transition">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-plum-300 mb-2">
          Welcome back, {user?.firstName || user?.email}!
        </h1>
        <p className="text-navy-200 text-lg">
          {user?.role === 'CUSTOMER'
            ? 'Manage your gift cards and wallet from here.'
            : 'Here is an overview of your business performance.'}
        </p>
      </div>

      {/* Metrics Cards */}
      {(user?.role === 'ADMIN' || user?.role === 'MERCHANT') && stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              icon={DollarSign}
              trend={
                stats.totalRevenue > 0
                  ? {
                      value: 12.5, // Placeholder - would calculate from previous period
                      label: 'vs last month',
                    }
                  : undefined
              }
            />
            <MetricCard
              title="Active Gift Cards"
              value={stats.activeCards}
              icon={Gift}
            />
            <MetricCard
              title="Total Transactions"
              value={stats.totalTransactions}
              icon={CreditCard}
            />
            <MetricCard
              title="Avg Transaction"
              value={formatCurrency(stats.avgTransactionValue)}
              icon={TrendingUp}
            />
          </div>

          {/* Additional Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Redeemed Cards"
              value={stats.redeemedCards}
              icon={Package}
            />
            {user?.role === 'MERCHANT' && (
              <MetricCard
                title="Merchant Balance"
                value={formatCurrency(stats.merchantBalance)}
                icon={DollarSign}
              />
            )}
            {user?.role === 'ADMIN' && (
              <>
                <MetricCard
                  title="Total Users"
                  value={analytics?.customers?.totalCustomers || 0}
                  icon={Users}
                />
                <MetricCard
                  title="Platform Revenue"
                  value={formatCurrency(stats.totalRevenue)}
                  icon={DollarSign}
                />
              </>
            )}
            {user?.role === 'MERCHANT' && (
              <MetricCard
                title="Total Cards"
                value={stats.totalCards}
                icon={Gift}
              />
            )}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartContainer
              title="Revenue Trend"
              description="Last 30 days"
              height={300}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a0d21" />
                  <XAxis dataKey="date" stroke="#b48dc9" />
                  <YAxis stroke="#b48dc9" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a1428',
                      border: '1px solid #341a42',
                      borderRadius: '8px',
                    }}
                    formatter={(value: any) => formatCurrency(value)}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#ffd700"
                    strokeWidth={2}
                    dot={{ fill: '#ffd700', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer
              title="Revenue by Payment Method"
              description="Breakdown by payment gateway"
              height={300}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueByMethodData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Gift Card Status Distribution */}
          {analytics?.giftCards && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ChartContainer
                title="Gift Card Status Distribution"
                description="Current status breakdown"
                height={300}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: 'Active',
                        value: analytics.giftCards.active || 0,
                      },
                      {
                        name: 'Redeemed',
                        value: analytics.giftCards.redeemed || 0,
                      },
                      {
                        name: 'Expired',
                        value: analytics.giftCards.expired || 0,
                      },
                      {
                        name: 'Cancelled',
                        value: analytics.giftCards.cancelled || 0,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a0d21" />
                    <XAxis dataKey="name" stroke="#b48dc9" />
                    <YAxis stroke="#b48dc9" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8241a5" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>

              <ChartContainer
                title="Redemption by Method"
                description="How customers are redeeming"
                height={300}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={redemptionByMethodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a0d21" />
                    <XAxis dataKey="name" stroke="#b48dc9" />
                    <YAxis stroke="#b48dc9" />
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                    <Bar dataKey="value" fill="#ffd700" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          )}

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/gift-cards/create">
                  <Button variant="gold" className="w-full justify-between">
                    <span className="flex items-center space-x-2">
                      <Gift className="w-4 h-4" />
                      <span>Create Gift Card</span>
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/dashboard/gift-card-products/create">
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center space-x-2">
                      <Package className="w-4 h-4" />
                      <span>Create Product</span>
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/dashboard/templates/create">
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center space-x-2">
                      <Activity className="w-4 h-4" />
                      <span>Create Template</span>
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/dashboard/redeem">
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4" />
                      <span>Process Redemption</span>
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/dashboard/analytics">
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>View Analytics</span>
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3 p-3 rounded-lg bg-navy-700/30 hover:bg-navy-700/50 transition-colors"
                      >
                        <div className="w-2 h-2 rounded-full bg-gold-500 mt-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-navy-50">{activity.message}</p>
                          <p className="text-xs text-plum-300 mt-1">
                            {format(new Date(activity.time), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-plum-200 text-center py-8">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Customer View */}
      {user?.role === 'CUSTOMER' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/dashboard/wallet">
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
              <CardTitle className="text-xl">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-plum-200">No recent activity</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
