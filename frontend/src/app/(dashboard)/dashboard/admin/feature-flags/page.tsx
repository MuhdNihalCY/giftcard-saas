'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { DataTable } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useFeatureFlagStore } from '@/store/featureFlagStore';
import { Flag, Plus, Edit, Trash2, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/ToastContainer';
import logger from '@/lib/logger';

interface FeatureFlag {
  id: string;
  featureKey: string;
  featureName: string;
  description: string | null;
  category: 'PAGE' | 'FEATURE';
  targetRole: 'MERCHANT' | 'CUSTOMER' | 'ALL';
  isEnabled: boolean;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

interface FeatureFlagStats {
  total: number;
  enabled: number;
  disabled: number;
  byCategory: Record<string, number>;
  byRole: Record<string, number>;
}

export default function AdminFeatureFlagsPage() {
  const { user } = useAuthStore();
  const { fetchFlags } = useFeatureFlagStore();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [stats, setStats] = useState<FeatureFlagStats | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    targetRole: '',
    isEnabled: '',
    search: '',
  });
  const [formData, setFormData] = useState({
    featureKey: '',
    featureName: '',
    description: '',
    category: 'PAGE' as FeatureFlag['category'],
    targetRole: 'MERCHANT' as FeatureFlag['targetRole'],
    isEnabled: true,
  });

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      window.location.href = '/dashboard';
    }
  }, [user]);

  useEffect(() => {
    loadFeatureFlags();
    loadStatistics();
  }, [filters]);

  const loadFeatureFlags = async () => {
    try {
      setLoading(true);
      const response = await api.get('/feature-flags/admin/all');
      let allFlags: FeatureFlag[] = response.data.data || [];

      // Apply filters
      if (filters.category) {
        allFlags = allFlags.filter((f) => f.category === filters.category);
      }
      if (filters.targetRole) {
        allFlags = allFlags.filter((f) => f.targetRole === filters.targetRole);
      }
      if (filters.isEnabled !== '') {
        const enabled = filters.isEnabled === 'true';
        allFlags = allFlags.filter((f) => f.isEnabled === enabled);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        allFlags = allFlags.filter(
          (f) =>
            f.featureKey.toLowerCase().includes(search) ||
            f.featureName.toLowerCase().includes(search) ||
            (f.description && f.description.toLowerCase().includes(search))
        );
      }

      setFlags(allFlags);
    } catch (error: any) {
      logger.error('Failed to load feature flags', { error });
      toast.error(error.response?.data?.error?.message || 'Failed to load feature flags');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await api.get('/feature-flags/admin/statistics');
      setStats(response.data.data);
    } catch (error: any) {
      logger.error('Failed to load statistics', { error });
    }
  };

  const handleAdd = async () => {
    try {
      await api.post('/feature-flags/admin', formData);
      toast.success('Feature flag created successfully');
      setShowAddForm(false);
      resetForm();
      loadFeatureFlags();
      loadStatistics();
      // Refresh frontend flags
      fetchFlags();
    } catch (error: any) {
      logger.error('Failed to create feature flag', { error });
      toast.error(error.response?.data?.error?.message || 'Failed to create feature flag');
    }
  };

  const handleUpdate = async () => {
    if (!editingFlag) return;

    try {
      await api.put(`/feature-flags/admin/${editingFlag.id}`, formData);
      toast.success('Feature flag updated successfully');
      setEditingFlag(null);
      resetForm();
      loadFeatureFlags();
      loadStatistics();
      // Refresh frontend flags
      fetchFlags();
    } catch (error: any) {
      logger.error('Failed to update feature flag', { error });
      toast.error(error.response?.data?.error?.message || 'Failed to update feature flag');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feature flag?')) {
      return;
    }

    try {
      await api.delete(`/feature-flags/admin/${id}`);
      toast.success('Feature flag deleted successfully');
      loadFeatureFlags();
      loadStatistics();
      // Refresh frontend flags
      fetchFlags();
    } catch (error: any) {
      logger.error('Failed to delete feature flag', { error });
      toast.error(error.response?.data?.error?.message || 'Failed to delete feature flag');
    }
  };

  const handleToggle = async (id: string, currentState: boolean) => {
    try {
      await api.post(`/feature-flags/admin/${id}/toggle`);
      toast.success(`Feature flag ${currentState ? 'disabled' : 'enabled'} successfully`);
      loadFeatureFlags();
      loadStatistics();
      // Refresh frontend flags
      fetchFlags();
    } catch (error: any) {
      logger.error('Failed to toggle feature flag', { error });
      toast.error(error.response?.data?.error?.message || 'Failed to toggle feature flag');
    }
  };

  const resetForm = () => {
    setFormData({
      featureKey: '',
      featureName: '',
      description: '',
      category: 'PAGE',
      targetRole: 'MERCHANT',
      isEnabled: true,
    });
  };

  const startEdit = (flag: FeatureFlag) => {
    setEditingFlag(flag);
    setFormData({
      featureKey: flag.featureKey,
      featureName: flag.featureName,
      description: flag.description || '',
      category: flag.category,
      targetRole: flag.targetRole,
      isEnabled: flag.isEnabled,
    });
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    setEditingFlag(null);
    setShowAddForm(false);
    resetForm();
  };

  const getCategoryBadge = (category: string) => {
    return (
      <Badge variant={category === 'PAGE' ? 'default' : 'secondary'}>
        {category}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      MERCHANT: 'default',
      CUSTOMER: 'secondary',
      ALL: 'outline',
    };
    return <Badge variant={variants[role] || 'default'}>{role}</Badge>;
  };

  const columns = [
    {
      key: 'featureKey',
      label: 'Feature Key',
      render: (_value: any, row: FeatureFlag) => (
        <span className="font-mono text-sm font-semibold">{row.featureKey}</span>
      ),
    },
    {
      key: 'featureName',
      label: 'Name',
      render: (_value: any, row: FeatureFlag) => (
        <div>
          <div className="font-medium">{row.featureName}</div>
          {row.description && (
            <div className="text-sm text-gray-500 mt-1">{row.description}</div>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (_value: any, row: FeatureFlag) => getCategoryBadge(row.category),
    },
    {
      key: 'targetRole',
      label: 'Target Role',
      render: (_value: any, row: FeatureFlag) => getRoleBadge(row.targetRole),
    },
    {
      key: 'isEnabled',
      label: 'Status',
      render: (_value: any, row: FeatureFlag) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleToggle(row.id, row.isEnabled)}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            {row.isEnabled ? (
              <ToggleRight className="w-6 h-6 text-green-500" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-gray-400" />
            )}
            <Badge variant={row.isEnabled ? 'default' : 'secondary'}>
              {row.isEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </button>
        </div>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
      render: (_value: any, row: FeatureFlag) => formatDate(row.updatedAt),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: any, row: FeatureFlag) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => startEdit(row)}
            className="h-8 w-8 p-0"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.id)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (user && user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="page-transition">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2 flex items-center space-x-3">
            <Flag className="w-8 h-8" />
            <span>Feature Flags</span>
          </h1>
          <p className="text-slate-600 text-lg">
            Manage feature visibility for merchants and customers
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              loadFeatureFlags();
              loadStatistics();
              fetchFlags();
            }}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
          <Button
            onClick={() => {
              setShowAddForm(true);
              setEditingFlag(null);
              resetForm();
            }}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Feature Flag</span>
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Flags"
            value={stats.total}
            icon={Flag}
          />
          <MetricCard
            title="Enabled"
            value={stats.enabled}
            icon={ToggleRight}
          />
          <MetricCard
            title="Disabled"
            value={stats.disabled}
            icon={ToggleLeft}
          />
          <MetricCard
            title="Page Features"
            value={stats.byCategory.PAGE || 0}
            icon={Flag}
          />
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <FilterBar
            filters={[
              {
                key: 'search',
                label: 'Search',
                type: 'text',
                value: filters.search,
                onChange: (value) => setFilters({ ...filters, search: value as string }),
                placeholder: 'Search by key, name, or description...',
              },
              {
                key: 'category',
                label: 'Category',
                type: 'select',
                value: filters.category,
                onChange: (value) => setFilters({ ...filters, category: value as string }),
                options: [
                  { value: '', label: 'All Categories' },
                  { value: 'PAGE', label: 'Page' },
                  { value: 'FEATURE', label: 'Feature' },
                ],
              },
              {
                key: 'targetRole',
                label: 'Target Role',
                type: 'select',
                value: filters.targetRole,
                onChange: (value) => setFilters({ ...filters, targetRole: value as string }),
                options: [
                  { value: '', label: 'All Roles' },
                  { value: 'MERCHANT', label: 'Merchant' },
                  { value: 'CUSTOMER', label: 'Customer' },
                  { value: 'ALL', label: 'All' },
                ],
              },
              {
                key: 'isEnabled',
                label: 'Status',
                type: 'select',
                value: filters.isEnabled,
                onChange: (value) => setFilters({ ...filters, isEnabled: value as string }),
                options: [
                  { value: '', label: 'All' },
                  { value: 'true', label: 'Enabled' },
                  { value: 'false', label: 'Disabled' },
                ],
              },
            ]}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingFlag ? 'Edit Feature Flag' : 'Add New Feature Flag'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="featureKey">Feature Key *</Label>
                <Input
                  id="featureKey"
                  value={formData.featureKey}
                  onChange={(e) => setFormData({ ...formData, featureKey: e.target.value })}
                  placeholder="e.g., gift_cards"
                  disabled={!!editingFlag}
                  className="font-mono"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Unique identifier (lowercase, underscores only)
                </p>
              </div>

              <div>
                <Label htmlFor="featureName">Feature Name *</Label>
                <Input
                  id="featureName"
                  value={formData.featureName}
                  onChange={(e) => setFormData({ ...formData, featureName: e.target.value })}
                  placeholder="e.g., Gift Cards Management"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of what this feature controls..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as FeatureFlag['category'] })
                    }
                  >
                    <option value="PAGE">Page</option>
                    <option value="FEATURE">Feature</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="targetRole">Target Role *</Label>
                  <Select
                    id="targetRole"
                    value={formData.targetRole}
                    onChange={(e) =>
                      setFormData({ ...formData, targetRole: e.target.value as FeatureFlag['targetRole'] })
                    }
                  >
                    <option value="MERCHANT">Merchant</option>
                    <option value="CUSTOMER">Customer</option>
                    <option value="ALL">All</option>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isEnabled"
                  checked={formData.isEnabled}
                  onChange={(e) =>
                    setFormData({ ...formData, isEnabled: e.target.checked })
                  }
                />
                <Label htmlFor="isEnabled" className="cursor-pointer">
                  Enabled by default
                </Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button onClick={editingFlag ? handleUpdate : handleAdd}>
                  {editingFlag ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Flags Table */}
      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={flags}
            columns={columns}
            loading={loading}
            emptyMessage="No feature flags found"
          />
        </CardContent>
      </Card>
    </div>
  );
}



