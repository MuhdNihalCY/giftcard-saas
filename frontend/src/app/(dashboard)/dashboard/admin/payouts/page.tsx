'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/dashboard/FilterBar';
import api from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { DollarSign, RefreshCw, Play, RotateCw } from 'lucide-react';
import { useToast } from '@/components/ui/ToastContainer';

interface Payout {
  id: string;
  merchantId: string;
  merchant?: {
    id: string;
    email: string;
    businessName?: string;
  };
  amount: number;
  currency: string;
  status: string;
  payoutMethod: string;
  netAmount: number;
  commissionAmount?: number;
  createdAt: string;
  processedAt?: string;
  failureReason?: string;
  retryCount: number;
}

interface PayoutStats {
  totalPayouts: number;
  totalAmount: number;
  byStatus: Array<{
    status: string;
    count: number;
    amount: number;
  }>;
}

export default function AdminPayoutsPage() {
  const toast = useToast();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [stats, setStats] = useState<PayoutStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [merchantFilter, setMerchantFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [statusFilter, merchantFilter, pagination.page]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (statusFilter) params.status = statusFilter;
      if (merchantFilter) params.merchantId = merchantFilter;

      const [payoutsRes, statsRes] = await Promise.all([
        api.get('/admin/payouts', { params }),
        api.get('/admin/payouts/stats'),
      ]);

      setPayouts(payoutsRes.data.data || []);
      setStats(statsRes.data.data);
      setPagination((prev) => ({
        ...prev,
        total: payoutsRes.data.pagination?.total || 0,
      }));
    } catch (error: any) {
      toast.error('Failed to load payouts');
    } finally {
      setIsLoading(false);
    }
  };

  const processPayout = async (id: string) => {
    if (!confirm('Process this payout manually?')) return;

    try {
      setProcessingId(id);
      await api.post(`/admin/payouts/${id}/process`);
      toast.success('Payout processed successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process payout');
    } finally {
      setProcessingId(null);
    }
  };

  const retryPayout = async (id: string) => {
    if (!confirm('Retry this failed payout?')) return;

    try {
      setRetryingId(id);
      await api.post(`/admin/payouts/${id}/retry`);
      toast.success('Payout retry initiated');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to retry payout');
    } finally {
      setRetryingId(null);
    }
  };

  const columns: Column<Payout>[] = [
    {
      key: 'merchant',
      header: 'Merchant',
      render: (payout) =>
        payout.merchant?.businessName || payout.merchant?.email || payout.merchantId,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (payout) => formatCurrency(payout.amount, payout.currency),
    },
    {
      key: 'netAmount',
      header: 'Net Amount',
      render: (payout) => formatCurrency(payout.netAmount, payout.currency),
    },
    {
      key: 'status',
      header: 'Status',
      render: (payout) => (
        <Badge variant={getStatusBadgeVariant(payout.status.toLowerCase())}>
          {payout.status}
        </Badge>
      ),
    },
    {
      key: 'payoutMethod',
      header: 'Method',
      render: (payout) => payout.payoutMethod.replace('_', ' '),
    },
    {
      key: 'createdAt',
      header: 'Requested',
      render: (payout) => formatDateTime(payout.createdAt),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (payout) => (
        <div className="flex items-center gap-2">
          {payout.status === 'PENDING' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => processPayout(payout.id)}
              disabled={processingId === payout.id}
            >
              <Play className="w-4 h-4 mr-1" />
              {processingId === payout.id ? 'Processing...' : 'Process'}
            </Button>
          )}
          {payout.status === 'FAILED' && payout.retryCount < 3 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => retryPayout(payout.id)}
              disabled={retryingId === payout.id}
            >
              <RotateCw className="w-4 h-4 mr-1" />
              {retryingId === payout.id ? 'Retrying...' : 'Retry'}
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading && !stats) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payout Management</h1>
          <p className="text-gray-600 mt-1">Manage all merchant payouts</p>
        </div>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <span className="text-2xl font-bold">{stats.totalPayouts}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <span className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {stats.byStatus.map((status) => (
            <Card key={status.status}>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  {status.status}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{status.count}</div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency(status.amount)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <FilterBar
            searchValue={merchantFilter}
            onSearchChange={setMerchantFilter}
            searchPlaceholder="Search by merchant..."
            filters={[
              {
                key: 'status',
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: '', label: 'All' },
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'PROCESSING', label: 'Processing' },
                  { value: 'COMPLETED', label: 'Completed' },
                  { value: 'FAILED', label: 'Failed' },
                  { value: 'CANCELLED', label: 'Cancelled' },
                ],
              },
            ]}
          />

          {payouts.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No payouts found</p>
          ) : (
            <>
              <DataTable data={payouts} columns={columns} />
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} payouts
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                    }
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                    }
                    disabled={pagination.page * pagination.limit >= pagination.total}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

