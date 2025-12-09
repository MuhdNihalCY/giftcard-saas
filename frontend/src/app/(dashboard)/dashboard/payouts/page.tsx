'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { DataTable, Column } from '@/components/ui/DataTable';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { DollarSign, Calendar, Settings, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/ToastContainer';

interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payoutMethod: string;
  netAmount: number;
  commissionAmount?: number;
  createdAt: string;
  processedAt?: string;
  failureReason?: string;
}

interface PayoutSettings {
  payoutMethod: string;
  payoutSchedule: string;
  minimumPayoutAmount: number;
  isActive: boolean;
}

export default function PayoutsPage() {
  const { user } = useAuthStore();
  const toast = useToast();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [settings, setSettings] = useState<PayoutSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [balanceRes, payoutsRes, settingsRes] = await Promise.all([
        api.get('/payouts/available-balance'),
        api.get('/payouts'),
        api.get('/payouts/settings'),
      ]);

      setAvailableBalance(balanceRes.data.data.availableBalance || 0);
      setPayouts(payoutsRes.data.data || []);
      setSettings(settingsRes.data.data);
    } catch (error: any) {
      toast.error('Failed to load payout data');
    } finally {
      setIsLoading(false);
    }
  };

  const requestPayout = async () => {
    const amount = parseFloat(payoutAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > availableBalance) {
      toast.error('Amount exceeds available balance');
      return;
    }

    if (settings && amount < settings.minimumPayoutAmount) {
      toast.error(
        `Minimum payout amount is ${formatCurrency(settings.minimumPayoutAmount)}`
      );
      return;
    }

    try {
      setIsRequesting(true);
      await api.post('/payouts/request', { amount });
      toast.success('Payout requested successfully');
      setPayoutAmount('');
      setShowRequestForm(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to request payout');
    } finally {
      setIsRequesting(false);
    }
  };

  const columns: Column<Payout>[] = [
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
      key: 'processedAt',
      header: 'Processed',
      render: (payout) =>
        payout.processedAt ? formatDateTime(payout.processedAt) : '-',
    },
  ];

  if (isLoading) {
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
          <h1 className="text-3xl font-bold">Payouts</h1>
          <p className="text-gray-600 mt-1">Request and manage your payouts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <span className="text-2xl font-bold">{formatCurrency(availableBalance)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Pending Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-2xl font-bold">
                {payouts.filter((p) => p.status === 'PENDING' || p.status === 'PROCESSING').length}
              </span>
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
              <span className="text-2xl font-bold">
                {formatCurrency(
                  payouts
                    .filter((p) => p.status === 'COMPLETED')
                    .reduce((sum, p) => sum + p.netAmount, 0)
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payout Settings</CardTitle>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {settings ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Payout Method:</span>
                <span className="font-medium">{settings.payoutMethod.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Schedule:</span>
                <span className="font-medium">{settings.payoutSchedule}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Minimum Amount:</span>
                <span className="font-medium">
                  {formatCurrency(settings.minimumPayoutAmount)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">No payout settings configured</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payout History</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRequestForm(!showRequestForm)}
                disabled={availableBalance <= 0}
              >
                Request Payout
              </Button>
              <Button variant="outline" size="sm" onClick={fetchData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showRequestForm && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-4">Request Payout</h3>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Amount</label>
                  <Input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder={`Max: ${formatCurrency(availableBalance)}`}
                    max={availableBalance}
                    min={settings?.minimumPayoutAmount || 10}
                  />
                </div>
                <Button onClick={requestPayout} disabled={isRequesting}>
                  {isRequesting ? 'Processing...' : 'Request'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRequestForm(false);
                    setPayoutAmount('');
                  }}
                >
                  Cancel
                </Button>
              </div>
              {settings && (
                <p className="text-xs text-gray-500 mt-2">
                  Minimum payout: {formatCurrency(settings.minimumPayoutAmount)}
                </p>
              )}
            </div>
          )}

          {payouts.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No payouts yet</p>
          ) : (
            <DataTable data={payouts} columns={columns} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

