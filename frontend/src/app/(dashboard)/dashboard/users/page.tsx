'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import logger from '@/lib/logger';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Users as UsersIcon, Download } from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  businessName?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');
  const [roleFilter, setRoleFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Initialize search from URL on mount
  useEffect(() => {
    const urlSearch = searchParams?.get('search') || '';
    if (urlSearch && urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchUsers();
  }, [user, searchQuery, roleFilter, pagination.page, pagination.limit, sortKey, sortDirection]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (roleFilter) params.role = roleFilter;
      if (searchQuery) params.search = searchQuery;
      if (sortKey) {
        params.sortBy = sortKey;
        params.sortOrder = sortDirection;
      }

      const response = await api.get('/admin/users', { params });
      setUsers(response.data.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination?.total || response.data.data?.length || 0,
      }));
    } catch (error) {
      logger.error('Failed to fetch users', { error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-active`, {
        isActive: !currentStatus,
      });
      fetchUsers();
    } catch (error) {
      logger.error('Failed to toggle user status', { error });
    }
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const handleExport = () => {
    // Export users to CSV
    const headers = ['Name', 'Email', 'Role', 'Status', 'Email Verified', 'Created At'];
    const rows = users.map((u) => [
      `${u.firstName} ${u.lastName}`,
      u.email,
      u.role,
      u.isActive ? 'Active' : 'Inactive',
      u.isEmailVerified ? 'Yes' : 'No',
      formatDate(u.createdAt),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (_, row) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">
            {row.firstName} {row.lastName}
          </div>
          {row.businessName && (
            <div className="text-sm text-slate-600 dark:text-slate-400">{row.businessName}</div>
          )}
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (value) => <span className="text-slate-700 dark:text-slate-300">{value}</span>,
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (value) => {
        const variant =
          value === 'ADMIN'
            ? 'info'
            : value === 'MERCHANT'
            ? 'default'
            : 'default';
        return <Badge variant={variant}>{value}</Badge>;
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (_, row) => (
        <div className="space-y-1">
          <Badge variant={row.isActive ? 'active' : 'inactive'}>
            {row.isActive ? 'Active' : 'Inactive'}
          </Badge>
          {!row.isEmailVerified && (
            <div className="text-xs text-yellow-400">Unverified</div>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">{formatDate(value)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleToggleActive(row.id, row.isActive)}
        >
          {row.isActive ? 'Deactivate' : 'Activate'}
        </Button>
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
          <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center space-x-3">
            <UsersIcon className="w-8 h-8" />
            <span>User Management</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Manage all users in the system</p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          className="flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <FilterBar
            searchPlaceholder="Search by email or name..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            suggestionEndpoint="/users/suggestions"
            filters={[
              {
                key: 'role',
                label: 'Role',
                options: [
                  { value: 'ADMIN', label: 'Admin' },
                  { value: 'MERCHANT', label: 'Merchant' },
                  { value: 'CUSTOMER', label: 'Customer' },
                ],
                value: roleFilter,
                onChange: setRoleFilter,
              },
            ]}
            onClear={() => {
              setSearchQuery('');
              setRoleFilter('');
            }}
          />
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={users}
            isLoading={isLoading}
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
            onExport={handleExport}
            emptyMessage="No users found"
            onRowClick={(row) => {
              // Could navigate to user detail page
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
