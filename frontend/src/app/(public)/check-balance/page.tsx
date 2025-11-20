'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

const checkBalanceSchema = z.object({
  code: z.string().min(1, 'Gift card code is required'),
});

type CheckBalanceFormData = z.infer<typeof checkBalanceSchema>;

export default function CheckBalancePage() {
  const [balance, setBalance] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckBalanceFormData>({
    resolver: zodResolver(checkBalanceSchema),
  });

  const onSubmit = async (data: CheckBalanceFormData) => {
    try {
      setIsLoading(true);
      setError('');
      setBalance(null);

      const response = await api.post('/redemptions/check-balance', data);
      setBalance(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to check balance');
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Check Gift Card Balance
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Enter Gift Card Code</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Gift Card Code"
                placeholder="GIFT-XXXX-XXXX-XXXX"
                error={errors.code?.message}
                {...register('code')}
              />
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Check Balance
              </Button>
            </form>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {balance && (
              <div className="mt-6 p-6 bg-primary-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Gift Card Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Code:</span>
                    <span className="font-mono font-semibold">{balance.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Balance:</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {formatCurrency(balance.balance, balance.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original Value:</span>
                    <span className="font-semibold">
                      {formatCurrency(balance.value, balance.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`font-semibold ${
                        balance.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {balance.status}
                    </span>
                  </div>
                  {balance.expiryDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expires:</span>
                      <span className="font-semibold">{formatDate(balance.expiryDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

