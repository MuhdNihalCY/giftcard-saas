'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { Badge } from '@/components/ui/Badge';
import { ChartContainer } from '@/components/dashboard/ChartContainer';
import { MetricCard } from '@/components/dashboard/MetricCard';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import logger from '@/lib/logger';
import { Shield, Download, FileText, Activity } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [sortKey, setSortKey] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
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
  }, [searchQuery, actionFilter, resourceTypeFilter, dateRange, pagination.page, pagination.limit, sortKey, sortDirection]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (searchQuery) params.userEmail = searchQuery;
      if (actionFilter) params.action = actionFilter;
      if (resourceTypeFilter) params.resourceType = resourceTypeFilter;
      if (dateRange.start) params.startDate = dateRange.start.toISOString();
      if (dateRange.end) params.endDate = dateRange.end.toISOString();
      if (sortKey) {
        params.sortBy = sortKey;
        params.sortOrder = sortDirection;
      }

      const response = await api.get('/admin/audit-logs', { params });
      setLogs(response.data.data.logs || []);
      setPagination({
        page: response.data.data.pagination?.page || pagination.page,
        limit: response.data.data.pagination?.limit || pagination.limit,
        total: response.data.data.pagination?.total || 0,
        totalPages: response.data.data.pagination?.totalPages || 0,
      });
    } catch (err: unknown) {
      logger.error('Failed to load audit logs', { error: err });
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const params: any = {};
      if (dateRange.start) params.startDate = dateRange.start.toISOString();
      if (dateRange.end) params.endDate = dateRange.end.toISOString();

      const response = await api.get('/admin/audit-logs/statistics', { params });
      setStats(response.data.data);
    } catch (err: unknown) {
      logger.error('Failed to load statistics', { error: err });
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setExporting(true);
      const params: any = { format };
      if (searchQuery) params.userEmail = searchQuery;
      if (actionFilter) params.action = actionFilter;
      if (resourceTypeFilter) params.resourceType = resourceTypeFilter;
      if (dateRange.start) params.startDate = dateRange.start.toISOString();
      if (dateRange.end) params.endDate = dateRange.end.toISOString();

      const response = await api.get('/admin/audit-logs/export', {
        params,
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

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const getActionBadgeVariant = (action: string): 'success' | 'error' | 'warning' | 'info' | 'default' => {
    if (action.includes('LOGIN') || action.includes('SUCCESS')) {
      return 'success';
    }
    if (action.includes('FAILED') || action.includes('DELETE')) {
      return 'error';
    }
    if (action.includes('CREATE') || action.includes('UPDATE')) {
      return 'info';
    }
    return 'default';
  };

  // Get unique actions and resource types for filters
  const uniqueActions = stats?.byAction.map((a) => a.action) || [];
  const uniqueResourceTypes = stats?.byResourceType.map((r) => r.resourceType) || [];

  const columns: Column<AuditLog>[] = [
    {
      key: 'action',
      label: 'Action',
      sortable: true,
      render: (value) => (
        <Badge variant={getActionBadgeVariant(value)}>{value}</Badge>
      ),
    },
    {
      key: 'resourceType',
      label: 'Resource Type',
      sortable: true,
      render: (value) => <Badge variant="default">{value}</Badge>,
    },
    {
      key: 'userEmail',
      label: 'User',
      sortable: true,
      render: (value) => (
        <span className="text-plum-300">{value || 'System'}</span>
      ),
    },
    {
      key: 'resourceId',
      label: 'Resource ID',
      render: (value) => (
        <span className="text-navy-300 font-mono text-xs">{value || '-'}</span>
      ),
    },
    {
      key: 'ipAddress',
      label: 'IP Address',
      render: (value) => (
        <span className="text-navy-300 font-mono text-xs">{value || '-'}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Timestamp',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-plum-300">{formatDateTime(value)}</span>
      ),
    },
  ];

  if (user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="page-transition">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-serif font-bold text-plum-300 mb-2 flex items-center space-x-3">
            <Shield className="w-8 h-8" />
            <span>Audit Logs</span>
          </h1>
          <p className="text-navy-200 text-lg">View and monitor all system activities</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('json')}
            disabled={exporting}
            className="flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Export JSON</span>
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Logs"
            value={stats.total}
            icon={Activity}
          />
          <MetricCard
            title="Action Types"
            value={stats.byAction.length}
            icon={FileText}
          />
          <MetricCard
            title="Resource Types"
            value={stats.byResourceType.length}
            icon={Shield}
          />
          <MetricCard
            title="Recent Activities"
            value={stats.recentActivity.length}
            icon={Activity}
          />
        </div>
      )}

      {/* Charts */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartContainer
            title="Actions by Type"
            description="Distribution of audit log actions"
            height={300}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byAction.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a0d21" />
                <XAxis dataKey="action" stroke="#b48dc9" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#b48dc9" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a1428',
                    border: '1px solid #341a42',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#ffd700" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer
            title="Resources by Type"
            description="Distribution of resource types"
            height={300}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byResourceType.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a0d21" />
                <XAxis dataKey="resourceType" stroke="#b48dc9" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#b48dc9" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a1428',
                    border: '1px solid #341a42',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#8241a5" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <FilterBar
            searchPlaceholder="Search by user email..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            filters={[
              {
                key: 'action',
                label: 'Action',
                options: uniqueActions.map((a) => ({ value: a, label: a })),
                value: actionFilter,
                onChange: setActionFilter,
              },
              {
                key: 'resourceType',
                label: 'Resource Type',
                options: uniqueResourceTypes.map((r) => ({ value: r, label: r })),
                value: resourceTypeFilter,
                onChange: setResourceTypeFilter,
              },
            ]}
            onClear={() => {
              setSearchQuery('');
              setActionFilter('');
              setResourceTypeFilter('');
              setDateRange({ start: null, end: null });
            }}
          />
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={logs}
            isLoading={loading}
            pagination={{
              page: pagination.page,
              limit: pagination.limit,
              total: pagination.total,
              onPageChange: (page) => setPagination((prev) => ({ ...prev, page })),
              onLimitChange: (limit) =>
                setPagination((prev) => ({ ...prev, limit, page: 1 })),
            }}
            sortable
            onSort={handleSort}
            sortKey={sortKey}
            sortDirection={sortDirection}
            exportable
            onExport={() => handleExport('csv')}
            emptyMessage="No audit logs found"
            onRowClick={(row) => {
              // Could show detailed view in a modal
              console.log('Log clicked:', row);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
