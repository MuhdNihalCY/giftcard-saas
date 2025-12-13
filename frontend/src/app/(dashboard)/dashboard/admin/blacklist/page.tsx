'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { DataTable } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';

interface BlacklistEntry {
  id: string;
  type: 'EMAIL' | 'IP' | 'PHONE' | 'PAYMENT_METHOD' | 'USER_ID';
  value: string;
  reason?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  autoBlock: boolean;
  expiresAt?: string;
  createdAt: string;
}

export default function BlacklistPage() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    type: '',
    severity: '',
    activeOnly: false,
    page: 1,
    limit: 20,
  });
  const [formData, setFormData] = useState({
    type: 'EMAIL' as BlacklistEntry['type'],
    value: '',
    reason: '',
    severity: 'HIGH' as BlacklistEntry['severity'],
    autoBlock: true,
    expiresAt: '',
  });

  useEffect(() => {
    loadBlacklist();
  }, [filters]);

  const loadBlacklist = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: filters.page,
        limit: filters.limit,
      };
      if (filters.type) params.type = filters.type;
      if (filters.severity) params.severity = filters.severity;
      if (filters.activeOnly) params.activeOnly = 'true';

      const response = await api.get('/admin/blacklist', { params });
      setEntries(response.data.data || []);
      if (response.data.pagination) {
        setPagination({
          page: response.data.pagination.page || filters.page,
          limit: response.data.pagination.limit || filters.limit,
          total: response.data.pagination.total || 0,
          totalPages: response.data.pagination.totalPages || 0,
        });
      }
    } catch (error: any) {
      console.error('Failed to load blacklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const data: any = { ...formData };
      if (data.expiresAt) {
        data.expiresAt = new Date(data.expiresAt).toISOString();
      } else {
        delete data.expiresAt;
      }

      await api.post('/admin/blacklist', data);
      setShowAddForm(false);
      setFormData({
        type: 'EMAIL',
        value: '',
        reason: '',
        severity: 'HIGH',
        autoBlock: true,
        expiresAt: '',
      });
      loadBlacklist();
    } catch (error: any) {
      console.error('Failed to add blacklist entry:', error);
      alert(error.response?.data?.error?.message || 'Failed to add entry');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this entry from the blacklist?')) {
      return;
    }

    try {
      await api.delete(`/admin/blacklist/${id}`);
      loadBlacklist();
    } catch (error: any) {
      console.error('Failed to delete entry:', error);
      alert(error.response?.data?.error?.message || 'Failed to delete entry');
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, 'default' | 'warning' | 'error'> = {
      LOW: 'default',
      MEDIUM: 'warning',
      HIGH: 'error',
      CRITICAL: 'error',
    };
    return <Badge variant={variants[severity] || 'default'}>{severity}</Badge>;
  };

  const columns = [
    {
      key: 'type',
      label: 'Type',
      render: (_value: any, row: BlacklistEntry) => (
        <Badge variant="default">{row.type}</Badge>
      ),
    },
    {
      key: 'value',
      label: 'Value',
      render: (_value: any, row: BlacklistEntry) => (
        <span className="font-mono text-sm">{row.value}</span>
      ),
    },
    {
      key: 'severity',
      label: 'Severity',
      render: (_value: any, row: BlacklistEntry) => getSeverityBadge(row.severity),
    },
    {
      key: 'autoBlock',
      label: 'Auto Block',
      render: (_value: any, row: BlacklistEntry) => (
        <Badge variant={row.autoBlock ? 'error' : 'default'}>
          {row.autoBlock ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      key: 'expiresAt',
      label: 'Expires',
      render: (_value: any, row: BlacklistEntry) =>
        row.expiresAt ? formatDate(row.expiresAt) : <span className="text-navy-400">Never</span>,
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (_value: any, row: BlacklistEntry) => formatDate(row.createdAt),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: any, row: BlacklistEntry) => (
        <Button
          variant="danger"
          size="sm"
          onClick={() => handleDelete(row.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Fraud Blacklist</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage blacklisted emails, IPs, phones, and payment methods
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Add Blacklist Entry</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Type</label>
              <select
                className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-navy-50"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="EMAIL">Email</option>
                <option value="IP">IP Address</option>
                <option value="PHONE">Phone</option>
                <option value="PAYMENT_METHOD">Payment Method</option>
                <option value="USER_ID">User ID</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-300 mb-2">Value</label>
              <Input
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="Enter value to blacklist"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-300 mb-2">Severity</label>
              <select
                className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-navy-50"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-300 mb-2">Expires At (Optional)</label>
              <Input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-navy-300 mb-2">Reason</label>
              <Input
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Reason for blacklisting"
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="autoBlock"
                checked={formData.autoBlock}
                onChange={(e) => setFormData({ ...formData, autoBlock: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="autoBlock" className="text-sm text-navy-300">
                Automatically block transactions from this entry
              </label>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <Button onClick={handleAdd}>Add Entry</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <FilterBar
        filters={[
          {
            key: 'type',
            label: 'Type',
            value: filters.type,
            options: [
              { label: 'All', value: '' },
              { label: 'Email', value: 'EMAIL' },
              { label: 'IP', value: 'IP' },
              { label: 'Phone', value: 'PHONE' },
              { label: 'Payment Method', value: 'PAYMENT_METHOD' },
              { label: 'User ID', value: 'USER_ID' },
            ],
            onChange: (value) => setFilters({ ...filters, type: value, page: 1 }),
          },
          {
            key: 'severity',
            label: 'Severity',
            value: filters.severity,
            options: [
              { label: 'All', value: '' },
              { label: 'Low', value: 'LOW' },
              { label: 'Medium', value: 'MEDIUM' },
              { label: 'High', value: 'HIGH' },
              { label: 'Critical', value: 'CRITICAL' },
            ],
            onChange: (value) => setFilters({ ...filters, severity: value, page: 1 }),
          },
        ]}
      />

      <Card className="p-6 bg-navy-800 border-navy-700">
        <DataTable
          data={entries}
          columns={columns}
          isLoading={loading}
          pagination={{
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            onPageChange: (page) => {
              setFilters({ ...filters, page });
              setPagination((prev) => ({ ...prev, page }));
            },
          }}
        />
      </Card>
    </div>
  );
}

