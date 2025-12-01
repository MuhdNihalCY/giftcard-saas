'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DataTable, Column } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { CreditCard, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface Payment {
  id: string;
  giftCardId: string;
  giftCard?: {
    code: string;
    value: number;
  };
  customerId?: string;
  customer?: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentIntentId: string;
  status: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function PaymentsPage() {
  const { user } = useAuthStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
    fetchPayments();
  }, [searchQuery, statusFilter, methodFilter, dateRange, pagination.page, pagination.limit, sortKey, sortDirection]);

  const fetchPayments = async () => {
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
      if (statusFilter) params.status = statusFilter;
      if (methodFilter) params.paymentMethod = methodFilter;
      if (dateRange.start) params.startDate = dateRange.start.toISOString();
      if (dateRange.end) params.endDate = dateRange.end.toISOString();
      if (sortKey) {
        params.sortBy = sortKey;
        params.sortOrder = sortDirection;
      }

      const response = await api.get('/payments', { params });
      setPayments(response.data.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination?.total || response.data.data?.length || 0,
      }));
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefund = async (paymentId: string) => {
    if (!confirm('Are you sure you want to process a refund for this payment?')) {
      return;
    }

    try {
      await api.post(`/payments/${paymentId}/refund`, {
        amount: null, // Full refund
        reason: 'Merchant request',
      });
      fetchPayments();
    } catch (error) {
      console.error('Failed to process refund:', error);
      alert('Failed to process refund');
    }
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const handleExport = () => {
    const headers = ['Date', 'Payment ID', 'Amount', 'Method', 'Status', 'Gift Card Code', 'Customer'];
    const rows = payments.map((p) => [
      formatDateTime(p.createdAt),
      p.paymentIntentId,
      formatCurrency(p.amount, p.currency),
      p.paymentMethod,
      p.status,
      p.giftCard?.code || '-',
      p.customer?.email || '-',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns: Column<Payment>[] = [
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-plum-300">{formatDateTime(value)}</span>
      ),
    },
    {
      key: 'paymentIntentId',
      label: 'Payment ID',
      render: (value) => (
        <span className="font-mono text-xs text-navy-300">{value.substring(0, 20)}...</span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value, row) => (
        <span className="font-semibold text-gold-400">
          {formatCurrency(value, row.currency)}
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      label: 'Method',
      sortable: true,
      render: (value) => (
        <Badge variant="default">{value}</Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <Badge variant={getStatusBadgeVariant(value)}>{value}</Badge>
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
      key: 'customer',
      label: 'Customer',
      render: (_, row) => (
        <span className="text-sm text-plum-300">
          {row.customer?.email || '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          {row.status === 'COMPLETED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRefund(row.id)}
              className="text-red-400 hover:text-red-300"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refund
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page-transition">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-serif font-bold text-plum-300 mb-2 flex items-center space-x-3">
            <CreditCard className="w-8 h-8" />
            <span>Payments</span>
          </h1>
          <p className="text-navy-200 text-lg">View and manage all payment transactions</p>
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
            searchPlaceholder="Search by payment ID or customer email..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            filters={[
              {
                key: 'status',
                label: 'Status',
                options: [
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'COMPLETED', label: 'Completed' },
                  { value: 'FAILED', label: 'Failed' },
                  { value: 'REFUNDED', label: 'Refunded' },
                ],
                value: statusFilter,
                onChange: setStatusFilter,
              },
              {
                key: 'method',
                label: 'Payment Method',
                options: [
                  { value: 'STRIPE', label: 'Stripe' },
                  { value: 'PAYPAL', label: 'PayPal' },
                  { value: 'RAZORPAY', label: 'Razorpay' },
                  { value: 'UPI', label: 'UPI' },
                ],
                value: methodFilter,
                onChange: setMethodFilter,
              },
            ]}
            onClear={() => {
              setSearchQuery('');
              setStatusFilter('');
              setMethodFilter('');
              setDateRange({ start: null, end: null });
            }}
          />
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payments ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={payments}
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
            emptyMessage="No payments found"
            onRowClick={(row) => {
              // Could navigate to payment detail
              console.log('Payment clicked:', row);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}




