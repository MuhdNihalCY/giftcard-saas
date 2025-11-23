'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
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

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [salesData, setSalesData] = useState<any>(null);
  const [redemptionData, setRedemptionData] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [giftCardStats, setGiftCardStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const merchantId = user?.role === 'MERCHANT' ? user.id : undefined;

      const [sales, redemptions, customers, stats] = await Promise.all([
        api.get('/analytics/sales', { params: { merchantId } }),
        api.get('/analytics/redemptions', { params: { merchantId } }),
        api.get('/analytics/customers', { params: { merchantId } }),
        api.get('/analytics/gift-cards', { params: { merchantId } }),
      ]);

      setSalesData(sales.data.data);
      setRedemptionData(redemptions.data.data);
      setCustomerData(customers.data.data);
      setGiftCardStats(stats.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  const salesByMethodData = salesData?.revenueByMethod
    ? Object.entries(salesData.revenueByMethod).map(([method, value]) => ({
        name: method,
        value: Number(value),
      }))
    : [];

  const redemptionByMethodData = redemptionData?.redemptionByMethod
    ? Object.entries(redemptionData.redemptionByMethod).map(([method, value]) => ({
        name: method,
        value: Number(value),
      }))
    : [];

  return (
    <div className="page-transition">
      <h1 className="text-4xl font-serif font-bold text-plum-300 mb-4">Analytics Dashboard</h1>
      <p className="text-navy-200 mb-8 text-lg">Track your business performance and insights</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-gold-glow-sm transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-plum-300">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-serif font-bold bg-gold-gradient bg-clip-text text-transparent">
              {salesData ? formatCurrency(salesData.totalRevenue) : '$0'}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-gold-glow-sm transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-plum-300">Total Redeemed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-serif font-bold text-navy-50">
              {redemptionData ? formatCurrency(redemptionData.totalRedeemed) : '$0'}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-gold-glow-sm transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-plum-300">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-serif font-bold text-navy-50">{customerData?.totalCustomers || 0}</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-gold-glow-sm transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-plum-300">Active Gift Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-serif font-bold text-navy-50">{giftCardStats?.active || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesByMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {salesByMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Redemption by Method</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={redemptionByMethodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="value" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gift Card Statistics */}
      {giftCardStats && (
        <Card>
          <CardHeader>
            <CardTitle>Gift Card Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-plum-300 mb-1">Total Cards</p>
                <p className="text-2xl font-serif font-bold text-navy-50">{giftCardStats.total}</p>
              </div>
              <div>
                <p className="text-sm text-plum-300 mb-1">Active</p>
                <p className="text-2xl font-serif font-bold text-green-400">{giftCardStats.active}</p>
              </div>
              <div>
                <p className="text-sm text-plum-300 mb-1">Redeemed</p>
                <p className="text-2xl font-serif font-bold text-blue-400">{giftCardStats.redeemed}</p>
              </div>
              <div>
                <p className="text-sm text-plum-300 mb-1">Redemption Rate</p>
                <p className="text-2xl font-serif font-bold text-gold-400">
                  {giftCardStats.redemptionRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

