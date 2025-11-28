'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DataTable, Column } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface Redemption {
  id: string;
  giftCardId: string;
  giftCard?: {
    code: string;
    value: number;
    balance: number;
  };
  merchantId: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  redemptionMethod: string;
  location?: string;
  notes?: string;
  createdAt: string;
}

export default function RedemptionsPage() {
  const { user } = useAuthStore();
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });
  const [sortKey, setSortKey] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchRedemptions();
  }, [searchQuery, methodFilter, dateRange, pagination.page, pagination.limit, sortKey, sortDirection]);

  const fetchRedemptions = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (user?.role === 'MERCHANT') {
        params.merchantId = user.id;
      }
      if (searchQuery) params.search = searchQuery;
      if (methodFilter) params.method = methodFilter;
      if (dateRange.start) params.startDate = dateRange.start.toISOString();
      if (dateRange.end) params.endDate = dateRange.end.toISOString();
      if (sortKey) {
        params.sortBy = sortKey;
        params.sortOrder = sortDirection;
      }

      const response = await api.get('/redemptions', { params });
      setRedemptions(response.data.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination?.total || response.data.data?.length || 0,
      }));
    } catch (error) {
      console.error('Failed to fetch redemptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const handleExport = () => {
    const headers = ['Date', 'Gift Card Code', 'Amount', 'Method', 'Location', 'Balance Before', 'Balance After'];
    const rows = redemptions.map((r) => [
      formatDateTime(r.createdAt),
      r.giftCard?.code || '-',
      formatCurrency(r.amount),
      r.redemptionMethod,
      r.location || '-',
      formatCurrency(r.balanceBefore),
      formatCurrency(r.balanceAfter),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `redemptions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns: Column<Redemption>[] = [
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-plum-300">{formatDateTime(value)}</span>
      ),
    },
    {
      key: 'giftCard',
      label: 'Gift Card',
      render: (_, row) => (
        <div>
          {row.giftCard ? (
            <Link
              href={`/dashboard/gift-cards/${row.giftCardId}`}
              className="text-gold-400 hover:text-gold-300 font-mono text-sm"
            >
              {row.giftCard.code}
            </Link>
          ) : (
            <span className="text-navy-300">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-gold-400">{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'redemptionMethod',
      label: 'Method',
      sortable: true,
      render: (value) => (
        <Badge variant="default">{value.replace('_', ' ')}</Badge>
      ),
    },
    {
      key: 'balanceAfter',
      label: 'Remaining Balance',
      render: (_, row) => (
        <span className="text-navy-200">{formatCurrency(row.balanceAfter)}</span>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (value) => (
        <span className="text-sm text-plum-300">{value || '-'}</span>
      ),
    },
  ];

  return (
    <div className="page-transition">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-serif font-bold text-plum-300 mb-2 flex items-center space-x-3">
            <FileText className="w-8 h-8" />
            <span>Redemptions</span>
          </h1>
          <p className="text-navy-200 text-lg">View and manage all gift card redemptions</p>
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
            searchPlaceholder="Search by gift card code..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            filters={[
              {
                key: 'method',
                label: 'Method',
                options: [
                  { value: 'QR_CODE', label: 'QR Code' },
                  { value: 'CODE_ENTRY', label: 'Code Entry' },
                  { value: 'LINK', label: 'Link' },
                  { value: 'API', label: 'API' },
                ],
                value: methodFilter,
                onChange: setMethodFilter,
              },
            ]}
            onClear={() => {
              setSearchQuery('');
              setMethodFilter('');
              setDateRange({ start: null, end: null });
            }}
          />
        </CardContent>
      </Card>

      {/* Redemptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Redemptions ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={redemptions}
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
            emptyMessage="No redemptions found"
            onRowClick={(row) => {
              // Could navigate to redemption detail
              console.log('Redemption clicked:', row);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

