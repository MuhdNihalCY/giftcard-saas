'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import logger from '@/lib/logger';

interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

interface AuditLogStats {
  total: number;
  byAction: Array<{ action: string; count: number }>;
  byResourceType: Array<{ resourceType: string; count: number }>;
  recentActivity: Array<{
    id: string;
    action: string;
    resourceType: string;
    userEmail?: string;
    createdAt: string;
  }>;
}

export default function AdminAuditLogsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [filters, setFilters] = useState({
    userEmail: '',
    action: '',
    resourceType: '',
    ipAddress: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      window.location.href = '/dashboard';
    }
  }, [user]);

  useEffect(() => {
    fetchLogs();
    fetchStatistics();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.userEmail) params.append('userEmail', filters.userEmail);
      if (filters.action) params.append('action', filters.action);
      if (filters.resourceType) params.append('resourceType', filters.resourceType);
      if (filters.ipAddress) params.append('ipAddress', filters.ipAddress);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());

      const response = await api.get(`/admin/audit-logs?${params.toString()}`);
      setLogs(response.data.data.logs);
      setPagination(response.data.data.pagination);
    } catch (err: unknown) {
      logger.error('Failed to load audit logs', { error: err });
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/admin/audit-logs/statistics?${params.toString()}`);
      setStats(response.data.data);
    } catch (err: unknown) {
      logger.error('Failed to load statistics', { error: err });
    }
  };

  const updateFilter = (key: string, value: string | number) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setExporting(true);
      const params = new URLSearchParams();
      if (filters.userEmail) params.append('userEmail', filters.userEmail);
      if (filters.action) params.append('action', filters.action);
      if (filters.resourceType) params.append('resourceType', filters.resourceType);
      if (filters.ipAddress) params.append('ipAddress', filters.ipAddress);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      params.append('format', format);

      const response = await api.get(`/admin/audit-logs/export?${params.toString()}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      logger.error('Failed to export audit logs', { error: err });
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionColor = (action: string) => {
    if (action.includes('LOGIN') || action.includes('SUCCESS')) {
      return 'bg-green-900/30 text-green-400 border border-green-500/30';
    }
    if (action.includes('FAILED') || action.includes('DELETE')) {
      return 'bg-red-900/30 text-red-400 border border-red-500/30';
    }
    if (action.includes('CREATE') || action.includes('UPDATE')) {
      return 'bg-blue-900/30 text-blue-400 border border-blue-500/30';
    }
    return 'bg-navy-700/50 text-plum-300 border border-navy-600';
  };

  if (loading && logs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-plum-300">Audit Logs</h1>
        <p className="text-navy-200 mt-2 text-lg">View and monitor all system activities</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-plum-300">{stats.total}</div>
              <div className="text-sm text-plum-200 mt-1">Total Logs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-400">{stats.byAction.length}</div>
              <div className="text-sm text-plum-200 mt-1">Action Types</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-400">{stats.byResourceType.length}</div>
              <div className="text-sm text-plum-200 mt-1">Resource Types</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gold-400">{stats.recentActivity.length}</div>
              <div className="text-sm text-plum-200 mt-1">Recent Activities</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Input
              label="User Email"
              value={filters.userEmail}
              onChange={(e) => updateFilter('userEmail', e.target.value)}
              placeholder="Search by email"
            />
            <Input
              label="Action"
              value={filters.action}
              onChange={(e) => updateFilter('action', e.target.value)}
              placeholder="e.g., LOGIN_SUCCESS"
            />
            <Input
              label="Resource Type"
              value={filters.resourceType}
              onChange={(e) => updateFilter('resourceType', e.target.value)}
              placeholder="e.g., Payment, GiftCard"
            />
            <Input
              label="IP Address"
              value={filters.ipAddress}
              onChange={(e) => updateFilter('ipAddress', e.target.value)}
              placeholder="Search by IP"
            />
            <Input
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={(e) => updateFilter('startDate', e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={(e) => updateFilter('endDate', e.target.value)}
            />
            <div className="flex items-end gap-2">
              <Button
                onClick={() => setFilters({
                  userEmail: '',
                  action: '',
                  resourceType: '',
                  ipAddress: '',
                  startDate: '',
                  endDate: '',
                  page: 1,
                  limit: 50,
                })}
                variant="outline"
              >
                Clear
              </Button>
              <Button
                onClick={() => handleExport('csv')}
                disabled={exporting}
                variant="outline"
              >
                {exporting ? 'Exporting...' : 'Export CSV'}
              </Button>
              <Button
                onClick={() => handleExport('json')}
                disabled={exporting}
                variant="outline"
              >
                {exporting ? 'Exporting...' : 'Export JSON'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-plum-300">
              <p>No audit logs found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 bg-navy-800 rounded-lg border border-navy-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-navy-700 text-plum-300 border border-navy-600">
                          {log.resourceType}
                        </span>
                        {log.userEmail && (
                          <span className="text-sm text-plum-300">{log.userEmail}</span>
                        )}
                      </div>
                      <div className="text-sm text-plum-200 space-y-1">
                        <p>Timestamp: {formatDate(log.createdAt)}</p>
                        {log.resourceId && <p>Resource ID: {log.resourceId}</p>}
                        {log.ipAddress && <p>IP Address: {log.ipAddress}</p>}
                      </div>
                      {expandedLogId === log.id && log.metadata && (
                        <div className="mt-3 p-3 bg-navy-900 rounded border border-navy-700">
                          <pre className="text-xs text-plum-200 overflow-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {log.metadata && (
                        <Button
                          onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                          variant="outline"
                          size="sm"
                        >
                          {expandedLogId === log.id ? 'Hide' : 'Details'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-plum-200">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => updateFilter('page', pagination.page - 1)}
                  disabled={pagination.page === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => updateFilter('page', pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

