'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ChartContainer } from '@/components/dashboard/ChartContainer';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BreakageMetrics {
  current: {
    breakageAmount: number;
    breakagePercentage: number;
    totalIssued: number;
    totalUnredeemed: number;
  };
  previous: {
    breakageAmount: number;
    breakagePercentage: number;
    totalIssued: number;
  };
  trend: {
    breakageAmountChange: number;
    breakagePercentageChange: number;
    trendDirection: 'increasing' | 'decreasing' | 'stable';
  };
}

interface BreakageReport {
  period: {
    startDate: string;
    endDate: string;
  };
  calculations: {
    totalIssued: number;
    totalRedeemed: number;
    totalUnredeemed: number;
    totalExpired: number;
    totalExpiredUnredeemed: number;
    breakageAmount: number;
    breakagePercentage: number;
    gracePeriodDays: number;
  };
  expiredCards: Array<{
    id: string;
    code: string;
    value: number;
    balance: number;
    expiryDate: string;
    expiredDate: string;
    gracePeriodEndDate: string;
    isBreakage: boolean;
  }>;
}

export default function BreakagePage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<BreakageMetrics | null>(null);
  const [report, setReport] = useState<BreakageReport | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBreakageData();
  }, [startDate, endDate]);

  const loadBreakageData = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();

      const [metricsRes, reportRes] = await Promise.all([
        api.get('/breakage/metrics', { params }),
        api.get('/breakage/report', { params }),
      ]);

      setMetrics(metricsRes.data.data);
      setReport(reportRes.data.data);
    } catch (error: any) {
      console.error('Failed to load breakage data:', error);
      setError(error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || 'Failed to load breakage data');
    } finally {
      setLoading(false);
    }
  };

  const chartData = report
    ? [
        {
          name: 'Issued',
          value: report.calculations.totalIssued,
        },
        {
          name: 'Redeemed',
          value: report.calculations.totalRedeemed,
        },
        {
          name: 'Unredeemed',
          value: report.calculations.totalUnredeemed,
        },
        {
          name: 'Breakage',
          value: report.calculations.breakageAmount,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy-50">Breakage & Liability</h1>
        <p className="text-navy-300 mt-2">
          Track unredeemed gift cards, breakage, and liability management
        </p>
      </div>

      <FilterBar
        searchValue=""
        onSearchChange={() => {}}
        dateRange={{
          start: startDate,
          end: endDate,
        }}
        onDateRangeChange={(range) => {
          setStartDate(range.start);
          setEndDate(range.end);
        }}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-navy-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-6 bg-navy-800 border-navy-700">
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={loadBreakageData}
              className="px-4 py-2 bg-plum-600 hover:bg-plum-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </Card>
      ) : !metrics && !report ? (
        <Card className="p-6 bg-navy-800 border-navy-700">
          <div className="text-center py-8">
            <p className="text-navy-300 mb-4">No breakage data available yet.</p>
            <p className="text-navy-400 text-sm">
              Breakage data will appear here once you have gift cards that have expired past the grace period.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Current Breakage"
                value={formatCurrency(metrics.current.breakageAmount)}
                trend={
                  metrics.trend.breakageAmountChange !== 0
                    ? {
                        value: Math.abs(metrics.trend.breakageAmountChange),
                        label: metrics.trend.trendDirection === 'increasing' ? 'vs last period' : 'vs last period',
                      }
                    : undefined
                }
              />
              <MetricCard
                title="Total Issued"
                value={formatCurrency(metrics.current.totalIssued)}
              />
              <MetricCard
                title="Total Unredeemed"
                value={formatCurrency(metrics.current.totalUnredeemed)}
              />
              <MetricCard
                title="Breakage Trend"
                value={metrics.trend.trendDirection}
              />
            </div>
          )}

          {report && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer title="Breakage Overview" isLoading={false}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#A855F7" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>

              <Card className="p-6 bg-navy-800 border-navy-700">
                <h3 className="text-lg font-semibold text-navy-50 mb-4">Breakage Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-navy-300">Grace Period:</span>
                    <span className="text-navy-50 font-medium">
                      {report.calculations.gracePeriodDays} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-navy-300">Total Expired:</span>
                    <span className="text-navy-50 font-medium">
                      {formatCurrency(report.calculations.totalExpired)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-navy-300">Expired Unredeemed:</span>
                    <span className="text-navy-50 font-medium">
                      {formatCurrency(report.calculations.totalExpiredUnredeemed)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-navy-300">Breakage Amount:</span>
                    <span className="text-navy-50 font-medium text-plum-400">
                      {formatCurrency(report.calculations.breakageAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-navy-300">Breakage %:</span>
                    <span className="text-navy-50 font-medium text-plum-400">
                      {report.calculations.breakagePercentage.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {report && report.expiredCards.length > 0 && (
            <Card className="p-6 bg-navy-800 border-navy-700">
              <h3 className="text-lg font-semibold text-navy-50 mb-4">
                Expired Cards ({report.expiredCards.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-navy-700">
                      <th className="text-left py-3 px-4 text-navy-300">Code</th>
                      <th className="text-left py-3 px-4 text-navy-300">Value</th>
                      <th className="text-left py-3 px-4 text-navy-300">Balance</th>
                      <th className="text-left py-3 px-4 text-navy-300">Expiry Date</th>
                      <th className="text-left py-3 px-4 text-navy-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.expiredCards.slice(0, 10).map((card) => (
                      <tr key={card.id} className="border-b border-navy-700/50">
                        <td className="py-3 px-4 text-navy-50 font-mono text-sm">{card.code}</td>
                        <td className="py-3 px-4 text-navy-50">{formatCurrency(card.value)}</td>
                        <td className="py-3 px-4 text-navy-50">{formatCurrency(card.balance)}</td>
                        <td className="py-3 px-4 text-navy-300">
                          {new Date(card.expiryDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={card.isBreakage ? 'error' : 'warning'}
                          >
                            {card.isBreakage ? 'Breakage' : 'Grace Period'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

