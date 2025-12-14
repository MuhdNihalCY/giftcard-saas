'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { DataTable } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import { useToast } from '@/components/ui/ToastContainer';
import logger from '@/lib/logger';

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
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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
      logger.error('Failed to load blacklist', { error });
      toast.error(error.response?.data?.error?.message || 'Failed to load blacklist entries');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.value.trim()) {
      toast.error('Please enter a value to blacklist');
      return;
    }

    try {
      const data: any = { ...formData };
      if (data.expiresAt) {
        data.expiresAt = new Date(data.expiresAt).toISOString();
      } else {
        delete data.expiresAt;
      }

      await api.post('/admin/blacklist', data);
      toast.success('Blacklist entry added successfully');
      setShowAddForm(false);
      setEditingId(null);
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
      logger.error('Failed to add blacklist entry', { error });
      toast.error(error.response?.data?.error?.message || 'Failed to add blacklist entry');
    }
  };

  const handleEdit = (entry: BlacklistEntry) => {
    setEditingId(entry.id);
    setFormData({
      type: entry.type,
      value: entry.value,
      reason: entry.reason || '',
      severity: entry.severity,
      autoBlock: entry.autoBlock,
      expiresAt: entry.expiresAt ? new Date(entry.expiresAt).toISOString().slice(0, 16) : '',
    });
    setShowAddForm(false);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    
    if (!formData.value.trim()) {
      toast.error('Please enter a value to blacklist');
      return;
    }

    try {
      const data: any = { ...formData };
      if (data.expiresAt) {
        data.expiresAt = new Date(data.expiresAt).toISOString();
      } else {
        delete data.expiresAt;
      }

      // Don't send type and value in update (they shouldn't change)
      const { type, value, ...updateData } = data;

      await api.put(`/admin/blacklist/${editingId}`, updateData);
      toast.success('Blacklist entry updated successfully');
      setEditingId(null);
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
      logger.error('Failed to update blacklist entry', { error });
      toast.error(error.response?.data?.error?.message || 'Failed to update blacklist entry');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      type: 'EMAIL',
      value: '',
      reason: '',
      severity: 'HIGH',
      autoBlock: true,
      expiresAt: '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this entry from the blacklist?')) {
      return;
    }

    try {
      await api.delete(`/admin/blacklist/${id}`);
      toast.success('Blacklist entry deleted successfully');
      loadBlacklist();
    } catch (error: any) {
      logger.error('Failed to delete entry', { error });
      toast.error(error.response?.data?.error?.message || 'Failed to delete blacklist entry');
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
        row.expiresAt ? formatDate(row.expiresAt) : <span className="text-slate-400 dark:text-slate-500">Never</span>,
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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(row)}
            className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
            title="Edit entry"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(row.id)}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Delete entry"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-2">Fraud Blacklist</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Manage blacklisted emails, IPs, phones, and payment methods
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingId(null);
            if (!showAddForm) {
              setFormData({
                type: 'EMAIL',
                value: '',
                reason: '',
                severity: 'HIGH',
                autoBlock: true,
                expiresAt: '',
              });
            }
          }}
          className="flex items-center gap-2 px-6 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700"
        >
          <div className="p-1 rounded-full bg-white/20">
            <Plus className="h-4 w-4" />
          </div>
          <span>{editingId ? 'Cancel Edit' : 'Add Entry'}</span>
        </Button>
      </div>

      {(showAddForm || editingId) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {editingId ? 'Edit Blacklist Entry' : 'Add Blacklist Entry'}
              </CardTitle>
              {editingId && (
                <button
                  onClick={handleCancelEdit}
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  title="Cancel editing"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Type</label>
              <select
                className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                disabled={!!editingId}
              >
                <option value="EMAIL">Email</option>
                <option value="IP">IP Address</option>
                <option value="PHONE">Phone</option>
                <option value="PAYMENT_METHOD">Payment Method</option>
                <option value="USER_ID">User ID</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Value</label>
              <Input
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="Enter value to blacklist"
                disabled={!!editingId}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Severity</label>
              <select
                className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Expires At (Optional)</label>
              <Input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Reason</label>
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
                className="w-4 h-4 text-cyan-500 focus:ring-cyan-500 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
              />
              <label htmlFor="autoBlock" className="text-sm text-slate-700 dark:text-slate-300">
                Automatically block transactions from this entry
              </label>
            </div>
            <div className="md:col-span-2 flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button 
                variant="primary" 
                onClick={editingId ? handleUpdate : handleAdd}
                className="flex items-center gap-2 px-6 py-3 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700"
              >
                {editingId ? (
                  <>
                    <Edit2 className="h-4 w-4" />
                    Update Entry
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Entry
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false);
                  handleCancelEdit();
                }}
                className="px-6 py-3 text-base font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </Button>
            </div>
          </div>
          </CardContent>
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

      <Card>
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

