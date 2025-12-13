'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Activity, Database, Mail, MessageSquare, CreditCard, Server } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface SystemStatus {
  api: {
    status: string;
    version: string;
    uptime: number;
  };
  database: {
    status: string;
  };
  services: {
    email: string;
    sms: string;
    stripe: string;
    paypal: string;
    razorpay: string;
  };
  timestamp: string;
}

interface SystemMetrics {
  users: {
    total: number;
    merchants: number;
    customers: number;
  };
  giftCards: {
    total: number;
    active: number;
    expired: number;
    redeemed: number;
  };
  transactions: {
    payments: number;
    redemptions: number;
  };
  revenue: {
    total: number;
    currency: string;
  };
  timestamp: string;
}

export default function SystemStatusPage() {
  const { user } = useAuthStore();
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      return;
    }
    fetchSystemStatus();
    const interval = setInterval(() => {
      fetchSystemStatus();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const fetchSystemStatus = async () => {
    try {
      setError(null);
      const [statusRes, metricsRes] = await Promise.all([
        api.get('/health/status'),
        api.get('/health/metrics'),
      ]);

      setStatus(statusRes.data.data);
      setMetrics(metricsRes.data.data);
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error('Failed to fetch system status:', error);
      setError(error?.response?.data?.message || error?.message || 'Failed to fetch system status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'warning' | 'error'> = {
      operational: 'default',
      configured: 'default',
      healthy: 'default',
      degraded: 'warning',
      not_configured: 'warning',
      unhealthy: 'error',
      unknown: 'warning',
    };

    const colors: Record<string, string> = {
      operational: 'text-green-400',
      configured: 'text-green-400',
      healthy: 'text-green-400',
      degraded: 'text-yellow-400',
      not_configured: 'text-yellow-400',
      unhealthy: 'text-red-400',
      unknown: 'text-gray-400',
    };

    const badgeVariant = variants[status] || 'default';

    return (
      <Badge variant={badgeVariant} className={colors[status] || ''}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <p className="text-navy-300">Access denied. Admin only.</p>
      </div>
    );
  }

  if (loading && !status && !error) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-navy-800 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-navy-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-navy-50">System Status</h1>
          <p className="text-navy-300 mt-2">
            Monitor platform health and service status
          </p>
        </div>
        <div className="flex items-center gap-4">
          {error && (
            <Button
              onClick={fetchSystemStatus}
              variant="outline"
              size="sm"
            >
              Retry
            </Button>
          )}
          <div className="text-sm text-navy-400">
            Last updated: {formatDate(lastUpdated.toISOString())}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="p-6 bg-red-900/20 border-red-700">
          <div className="flex items-center gap-2 text-red-400">
            <span className="font-semibold">Error:</span>
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* System Status */}
      {status ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-navy-800 border-navy-700">
            <h2 className="text-xl font-semibold text-navy-50 mb-4 flex items-center gap-2">
              <Server className="h-5 w-5" />
              API Status
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-navy-300">Status</span>
                {getStatusBadge(status.api.status)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-navy-300">Version</span>
                <span className="text-navy-50">{status.api.version}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-navy-300">Uptime</span>
                <span className="text-navy-50">{formatUptime(status.api.uptime)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-navy-800 border-navy-700">
            <h2 className="text-xl font-semibold text-navy-50 mb-4 flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Status
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-navy-300">Status</span>
                {getStatusBadge(status.database.status)}
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-6 bg-navy-800 border-navy-700">
          <p className="text-navy-300">No status data available. Please try refreshing.</p>
        </Card>
      )}

      {/* Service Status */}
      {status ? (
        <Card className="p-6 bg-navy-800 border-navy-700">
          <h2 className="text-xl font-semibold text-navy-50 mb-4">Service Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="flex items-center justify-between p-3 bg-navy-900 rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-navy-400" />
                <span className="text-navy-300">Email</span>
              </div>
              {getStatusBadge(status.services.email)}
            </div>
            <div className="flex items-center justify-between p-3 bg-navy-900 rounded-lg">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-navy-400" />
                <span className="text-navy-300">SMS</span>
              </div>
              {getStatusBadge(status.services.sms)}
            </div>
            <div className="flex items-center justify-between p-3 bg-navy-900 rounded-lg">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-navy-400" />
                <span className="text-navy-300">Stripe</span>
              </div>
              {getStatusBadge(status.services.stripe)}
            </div>
            <div className="flex items-center justify-between p-3 bg-navy-900 rounded-lg">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-navy-400" />
                <span className="text-navy-300">PayPal</span>
              </div>
              {getStatusBadge(status.services.paypal)}
            </div>
            <div className="flex items-center justify-between p-3 bg-navy-900 rounded-lg">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-navy-400" />
                <span className="text-navy-300">Razorpay</span>
              </div>
              {getStatusBadge(status.services.razorpay)}
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 bg-navy-800 border-navy-700">
          <p className="text-navy-300">No service status data available.</p>
        </Card>
      )}

      {/* System Metrics */}
      {metrics ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Users"
              value={metrics.users.total.toString()}
              icon={Activity}
            />
            <MetricCard
              title="Gift Cards"
              value={metrics.giftCards.total.toString()}
              icon={Activity}
            />
            <MetricCard
              title="Transactions"
              value={(metrics.transactions.payments + metrics.transactions.redemptions).toString()}
              icon={Activity}
            />
            <MetricCard
              title="Total Revenue"
              value={`$${metrics.revenue.total.toLocaleString()}`}
              icon={Activity}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-navy-800 border-navy-700">
              <h3 className="text-lg font-semibold text-navy-50 mb-4">User Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-navy-300">Total Users</span>
                  <span className="text-navy-50 font-semibold">{metrics.users.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-300">Merchants</span>
                  <span className="text-navy-50 font-semibold">{metrics.users.merchants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-300">Customers</span>
                  <span className="text-navy-50 font-semibold">{metrics.users.customers}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-navy-800 border-navy-700">
              <h3 className="text-lg font-semibold text-navy-50 mb-4">Gift Card Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-navy-300">Total Cards</span>
                  <span className="text-navy-50 font-semibold">{metrics.giftCards.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-300">Active</span>
                  <span className="text-navy-50 font-semibold">{metrics.giftCards.active}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-300">Redeemed</span>
                  <span className="text-navy-50 font-semibold">{metrics.giftCards.redeemed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-300">Expired</span>
                  <span className="text-navy-50 font-semibold">{metrics.giftCards.expired}</span>
                </div>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <Card className="p-6 bg-navy-800 border-navy-700">
          <p className="text-navy-300">No metrics data available. Please try refreshing.</p>
        </Card>
      )}
    </div>
  );
}

