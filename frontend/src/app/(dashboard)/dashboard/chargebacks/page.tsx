'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { DataTable } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Chargeback {
  id: string;
  paymentId: string;
  giftCardId: string;
  amount: number;
  currency: string;
  fee: number;
  status: 'PENDING' | 'WON' | 'LOST' | 'WITHDRAWN';
  reason?: string;
  chargebackId: string;
  disputeId?: string;
  createdAt: string;
  resolvedAt?: string;
  payment: {
    id: string;
    giftCard: {
      id: string;
      code: string;
    };
  };
}

interface ChargebackStatistics {
  total: number;
  pending: number;
  won: number;
  lost: number;
  totalAmount: number;
  totalFees: number;
  winRate: number;
}

export default function ChargebacksPage() {
  const [loading, setLoading] = useState(true);
  const [chargebacks, setChargebacks] = useState<Chargeback[]>([]);
  const [statistics, setStatistics] = useState<ChargebackStatistics | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    loadChargebacks();
    loadStatistics();
  }, [filters]);

  const loadChargebacks = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: filters.page,
        limit: filters.limit,
      };
      if (filters.status) params.status = filters.status;

      const response = await api.get('/chargebacks', { params });
      setChargebacks(response.data.data);
    } catch (error: any) {
      console.error('Failed to load chargebacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await api.get('/chargebacks/statistics');
      setStatistics(response.data.data);
    } catch (error: any) {
      console.error('Failed to load statistics:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
      PENDING: 'warning',
      WON: 'success',
      LOST: 'error',
      WITHDRAWN: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const columns = [
    {
      key: 'chargebackId',
      label: 'Chargeback ID',
      render: (_value: any, row: Chargeback) => (
        <span className="font-mono text-sm">{row.chargebackId.substring(0, 12)}...</span>
      ),
    },
    {
      key: 'paymentId',
      label: 'Payment',
      render: (_value: any, row: Chargeback) => (
        <span className="font-mono text-sm">{row.payment.id.substring(0, 8)}...</span>
      ),
    },
    {
      key: 'giftCardCode',
      label: 'Gift Card',
      render: (_value: any, row: Chargeback) => (
        <span className="font-mono text-sm">{row.payment.giftCard.code}</span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (_value: any, row: Chargeback) => formatCurrency(row.amount, row.currency),
    },
    {
      key: 'fee',
      label: 'Fee',
      render: (_value: any, row: Chargeback) => formatCurrency(row.fee, row.currency),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_value: any, row: Chargeback) => getStatusBadge(row.status),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (_value: any, row: Chargeback) => formatDate(row.createdAt),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy-50">Chargebacks</h1>
        <p className="text-navy-300 mt-2">
          Manage chargebacks, disputes, and evidence submission
        </p>
      </div>

      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-navy-800 border-navy-700">
            <div className="text-navy-300 text-sm">Total Chargebacks</div>
            <div className="text-2xl font-bold text-navy-50 mt-1">{statistics.total}</div>
          </Card>
          <Card className="p-6 bg-navy-800 border-navy-700">
            <div className="text-navy-300 text-sm">Pending</div>
            <div className="text-2xl font-bold text-yellow-400 mt-1">{statistics.pending}</div>
          </Card>
          <Card className="p-6 bg-navy-800 border-navy-700">
            <div className="text-navy-300 text-sm">Total Amount</div>
            <div className="text-2xl font-bold text-navy-50 mt-1">
              {formatCurrency(statistics.totalAmount)}
            </div>
          </Card>
          <Card className="p-6 bg-navy-800 border-navy-700">
            <div className="text-navy-300 text-sm">Win Rate</div>
            <div className="text-2xl font-bold text-green-400 mt-1">
              {statistics.winRate.toFixed(1)}%
            </div>
          </Card>
        </div>
      )}

      <FilterBar
        searchValue={filters.search}
        onSearchChange={(value) => setFilters({ ...filters, search: value, page: 1 })}
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: filters.status,
            options: [
              { label: 'All', value: '' },
              { label: 'Pending', value: 'PENDING' },
              { label: 'Won', value: 'WON' },
              { label: 'Lost', value: 'LOST' },
              { label: 'Withdrawn', value: 'WITHDRAWN' },
            ],
            onChange: (value) => setFilters({ ...filters, status: value, page: 1 }),
          },
        ]}
      />

      <Card className="p-6 bg-navy-800 border-navy-700">
        <DataTable
          data={chargebacks}
          columns={columns}
          isLoading={loading}
          pagination={{
            page: filters.page,
            limit: filters.limit,
            total: chargebacks.length,
            onPageChange: (page) => setFilters({ ...filters, page }),
          }}
        />
      </Card>
    </div>
  );
}

