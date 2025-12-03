'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DataTable, Column } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { Mail, Download, Send, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface Delivery {
  id: string;
  giftCardId: string;
  giftCard?: {
    code: string;
    value: number;
  };
  channel: string;
  recipient: string;
  status: string;
  subject?: string;
  message?: string;
  errorMessage?: string;
  createdAt: string;
}

export default function DeliveryPage() {
  const { user } = useAuthStore();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
    fetchDeliveries();
  }, [searchQuery, channelFilter, statusFilter, dateRange, pagination.page, pagination.limit, sortKey, sortDirection]);

  const fetchDeliveries = async () => {
    try {
      setIsLoading(true);
      // Note: This endpoint might need to be created or use communication logs
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (user?.role === 'MERCHANT') {
        params.merchantId = user.id;
      }
      if (searchQuery) params.search = searchQuery;
      if (channelFilter) params.channel = channelFilter;
      if (statusFilter) params.status = statusFilter;
      if (dateRange.start) params.startDate = dateRange.start.toISOString();
      if (dateRange.end) params.endDate = dateRange.end.toISOString();
      if (sortKey) {
        params.sortBy = sortKey;
        params.sortOrder = sortDirection;
      }

      // Using communication logs endpoint as delivery history
      const response = await api.get('/admin/communication-logs/logs', { params });
      const logs = response.data.data || [];
      
      // Transform communication logs to delivery format
      const transformedDeliveries: Delivery[] = logs.map((log: any) => ({
        id: log.id,
        giftCardId: log.metadata?.giftCardId || '',
        channel: log.channel,
        recipient: log.recipient,
        status: log.status,
        subject: log.subject,
        message: log.message,
        errorMessage: log.errorMessage,
        createdAt: log.createdAt,
      }));

      setDeliveries(transformedDeliveries);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination?.total || transformedDeliveries.length,
      }));
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendGiftCard = () => {
    // Navigate to gift cards page or open send modal
    window.location.href = '/dashboard/gift-cards';
  };

  const handleDownloadPDF = async (giftCardId: string) => {
    try {
      const response = await api.get(`/delivery/pdf/${giftCardId}/download`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gift-card-${giftCardId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const handleExport = () => {
    const headers = ['Date', 'Channel', 'Recipient', 'Status', 'Subject', 'Gift Card ID'];
    const rows = deliveries.map((d) => [
      formatDateTime(d.createdAt),
      d.channel,
      d.recipient,
      d.status,
      d.subject || '-',
      d.giftCardId || '-',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deliveries-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns: Column<Delivery>[] = [
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-plum-300">{formatDateTime(value)}</span>
      ),
    },
    {
      key: 'channel',
      label: 'Channel',
      sortable: true,
      render: (value) => (
        <Badge variant="default">{value}</Badge>
      ),
    },
    {
      key: 'recipient',
      label: 'Recipient',
      render: (value) => (
        <span className="text-sm text-plum-300">{value}</span>
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
      key: 'subject',
      label: 'Subject',
      render: (value) => (
        <span className="text-sm text-navy-200">{value || '-'}</span>
      ),
    },
    {
      key: 'giftCardId',
      label: 'Gift Card',
      render: (value) => (
        <div>
          {value ? (
            <Link
              href={`/dashboard/gift-cards/${value}`}
              className="text-gold-400 hover:text-gold-300 font-mono text-sm"
            >
              View Card
            </Link>
          ) : (
            <span className="text-navy-300">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          {row.giftCardId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownloadPDF(row.giftCardId)}
              className="text-plum-300 hover:text-gold-400"
            >
              <FileDown className="w-3 h-3" />
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
            <Mail className="w-8 h-8" />
            <span>Delivery Management</span>
          </h1>
          <p className="text-navy-200 text-lg">View and manage gift card deliveries</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="gold"
            onClick={handleSendGiftCard}
            className="flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send Gift Card</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <FilterBar
            searchPlaceholder="Search by recipient email or phone..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            filters={[
              {
                key: 'channel',
                label: 'Channel',
                options: [
                  { value: 'EMAIL', label: 'Email' },
                  { value: 'SMS', label: 'SMS' },
                  { value: 'PUSH', label: 'Push' },
                ],
                value: channelFilter,
                onChange: setChannelFilter,
              },
              {
                key: 'status',
                label: 'Status',
                options: [
                  { value: 'SENT', label: 'Sent' },
                  { value: 'FAILED', label: 'Failed' },
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'BLOCKED', label: 'Blocked' },
                ],
                value: statusFilter,
                onChange: setStatusFilter,
              },
            ]}
            onClear={() => {
              setSearchQuery('');
              setChannelFilter('');
              setStatusFilter('');
              setDateRange({ start: null, end: null });
            }}
          />
        </CardContent>
      </Card>

      {/* Deliveries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery History ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={deliveries}
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
            emptyMessage="No deliveries found"
            onRowClick={(row) => {
              // Could show delivery details
              console.log('Delivery clicked:', row);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}





