'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface CommunicationLog {
  id: string;
  channel: string;
  recipient: string;
  subject?: string;
  message?: string;
  status: string;
  errorMessage?: string;
  userId?: string;
  createdAt: string;
}

interface CommunicationStats {
  total: number;
  sent: number;
  failed: number;
  blocked: number;
  successRate: string;
}

interface ChannelStats {
  channel: string;
  total: number;
  sent: number;
  failed: number;
  successRate: string;
}

export default function AdminCommunicationLogsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [stats, setStats] = useState<CommunicationStats | null>(null);
  const [channelStats, setChannelStats] = useState<ChannelStats[]>([]);
  const [filters, setFilters] = useState({
    channel: '',
    status: '',
    recipient: '',
    page: 1,
    limit: 50,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      window.location.href = '/dashboard';
    }
  }, [user]);

  useEffect(() => {
    fetchLogs();
    fetchStatistics();
    fetchChannelStatistics();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.channel) params.append('channel', filters.channel);
      if (filters.status) params.append('status', filters.status);
      if (filters.recipient) params.append('recipient', filters.recipient);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());

      const response = await api.get(`/admin/communication-logs/logs?${params.toString()}`);
      setLogs(response.data.data.logs);
      setPagination(response.data.data.pagination);
    } catch (err: any) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/admin/communication-logs/statistics');
      setStats(response.data.data);
    } catch (err: any) {
      console.error('Failed to load statistics:', err);
    }
  };

  const fetchChannelStatistics = async () => {
    try {
      const response = await api.get('/admin/communication-logs/statistics/channels');
      setChannelStats(response.data.data);
    } catch (err: any) {
      console.error('Failed to load channel statistics:', err);
    }
  };

  const updateFilter = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'bg-green-900/30 text-green-400 border border-green-500/30';
      case 'FAILED':
        return 'bg-red-900/30 text-red-400 border border-red-500/30';
      case 'BLOCKED':
        return 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30';
      case 'PENDING':
        return 'bg-blue-900/30 text-blue-400 border border-blue-500/30';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600';
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'EMAIL':
        return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30';
      case 'SMS':
        return 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30';
      case 'OTP':
        return 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30';
      case 'PUSH':
        return 'bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 border border-pink-200 dark:border-pink-500/30';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600';
    }
  };

  return (
    <div className="page-transition">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-slate-100">Communication Logs</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">View and monitor all communication activities</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Communications</div>
              <div className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Successful</div>
              <div className="text-3xl font-serif font-bold text-green-600 dark:text-green-400">{stats.sent}</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Failed</div>
              <div className="text-3xl font-serif font-bold text-red-600 dark:text-red-400">{stats.failed}</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Success Rate</div>
              <div className="text-3xl font-serif font-bold bg-cyan-gradient bg-clip-text text-transparent">{stats.successRate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Channel Statistics */}
      {channelStats.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Channel Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {channelStats.map((stat) => (
                <div key={stat.channel} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${getChannelColor(stat.channel)}`}>
                      {stat.channel}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">{stat.successRate}%</span>
                  </div>
                  <div className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">{stat.total}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {stat.sent} sent, {stat.failed} failed
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Channel</label>
              <select
                value={filters.channel}
                onChange={(e) => updateFilter('channel', e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="" className="bg-white dark:bg-slate-800">All Channels</option>
                <option value="EMAIL" className="bg-white dark:bg-slate-800">Email</option>
                <option value="SMS" className="bg-white dark:bg-slate-800">SMS</option>
                <option value="OTP" className="bg-white dark:bg-slate-800">OTP</option>
                <option value="PUSH" className="bg-white dark:bg-slate-800">Push</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="" className="bg-white dark:bg-slate-800">All Statuses</option>
                <option value="SENT" className="bg-white dark:bg-slate-800">Sent</option>
                <option value="FAILED" className="bg-white dark:bg-slate-800">Failed</option>
                <option value="BLOCKED" className="bg-white dark:bg-slate-800">Blocked</option>
                <option value="PENDING" className="bg-white dark:bg-slate-800">Pending</option>
              </select>
            </div>
            <div>
              <Input
                label="Recipient"
                placeholder="Search by email or phone"
                value={filters.recipient}
                onChange={(e) => updateFilter('recipient', e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setFilters({
                    channel: '',
                    status: '',
                    recipient: '',
                    page: 1,
                    limit: 50,
                  });
                }}
                variant="ghost"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Communication Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-600 dark:text-slate-400">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📧</div>
              <h3 className="text-2xl font-serif font-semibold text-slate-900 dark:text-slate-100 mb-2">No logs found</h3>
              <p className="text-slate-600 dark:text-slate-400">No communication logs match your filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Channel
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Recipient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Error
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded text-xs font-semibold ${getChannelColor(log.channel)}`}>
                            {log.channel}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                          {log.recipient}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                          {log.subject || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded text-xs font-semibold ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-plum-200">
                          {log.errorMessage ? (
                            <span className="text-red-400" title={log.errorMessage}>
                              {log.errorMessage.substring(0, 50)}...
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-plum-200">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => updateFilter('page', pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateFilter('page', pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


