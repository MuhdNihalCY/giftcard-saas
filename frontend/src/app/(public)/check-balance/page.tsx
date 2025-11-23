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
import { Navigation } from '@/components/Navigation';
import { useToast } from '@/components/ui/ToastContainer';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

const checkBalanceSchema = z.object({
  code: z.string().min(1, 'Gift card code is required'),
});

type CheckBalanceFormData = z.infer<typeof checkBalanceSchema>;

export default function CheckBalancePage() {
  const { isAuthenticated } = useAuthStore();
  const toast = useToast();
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
      setError('');
      toast.success('Balance retrieved successfully!');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || 'Failed to check balance';
      setError(errorMsg);
      setBalance(null);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900">
      <Navigation />
      <div className="py-16 px-4 sm:px-6 lg:px-8 page-transition">
        <div className="max-w-2xl mx-auto">
        <h1 className="text-5xl font-serif font-bold text-plum-300 mb-4 text-center">
          Check Gift Card Balance
        </h1>
        <p className="text-center text-navy-200 mb-12">Verify your gift card details</p>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Enter Gift Card Code</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Gift Card Code"
                placeholder="GIFT-XXXX-XXXX-XXXX"
                error={errors.code?.message}
                variant="plum"
                {...register('code')}
              />
              <Button type="submit" variant="gold" className="w-full text-lg py-4" isLoading={isLoading}>
                Check Balance
              </Button>
            </form>

            {error && (
              <div className="mt-6 bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {balance && (
              <div className="mt-8 p-8 bg-plum-900/20 border border-plum-500/30 rounded-xl backdrop-blur-sm">
                <h3 className="text-2xl font-serif font-semibold mb-6 text-plum-300">Gift Card Details</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-navy-700">
                    <span className="text-plum-200">Code:</span>
                    <span className="font-mono font-semibold text-navy-50">{balance.code}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-navy-700">
                    <span className="text-plum-200">Balance:</span>
                    <span className="text-3xl font-serif font-bold bg-gold-gradient bg-clip-text text-transparent">
                      {formatCurrency(balance.balance, balance.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-navy-700">
                    <span className="text-plum-200">Original Value:</span>
                    <span className="font-semibold text-navy-50">
                      {formatCurrency(balance.value, balance.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-navy-700">
                    <span className="text-plum-200">Status:</span>
                    <span
                      className={`font-semibold ${
                        balance.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {balance.status}
                    </span>
                  </div>
                  {balance.expiryDate && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-plum-200">Expires:</span>
                      <span className="font-semibold text-navy-50">{formatDate(balance.expiryDate)}</span>
                    </div>
                  )}
                </div>
                {isAuthenticated && (
                  <div className="mt-6 pt-6 border-t border-navy-700">
                    <Link href={`/redeem/${balance.code}`}>
                      <Button variant="gold" className="w-full">
                        Redeem Gift Card
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}

