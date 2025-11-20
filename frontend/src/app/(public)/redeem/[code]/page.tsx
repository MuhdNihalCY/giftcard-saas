'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const redeemSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  merchantId: z.string().uuid('Merchant ID is required'),
  location: z.string().optional(),
  notes: z.string().optional(),
});

type RedeemFormData = z.infer<typeof redeemSchema>;

export default function RedeemPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [giftCard, setGiftCard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RedeemFormData>({
    resolver: zodResolver(redeemSchema),
    defaultValues: {
      amount: 0,
    },
  });

  useEffect(() => {
    if (code) {
      fetchGiftCard();
    }
  }, [code]);

  const fetchGiftCard = async () => {
    try {
      const response = await api.post('/redemptions/check-balance', { code });
      setGiftCard(response.data.data);
      setValue('amount', response.data.data.balance);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Gift card not found');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: RedeemFormData) => {
    try {
      setIsRedeeming(true);
      setError('');

      const response = await api.post(`/redemptions/redeem/${code}`, {
        ...data,
        redemptionMethod: 'LINK',
      });

      // Show success and redirect
      alert(`Successfully redeemed ${formatCurrency(data.amount, giftCard.currency)}!`);
      router.push(`/redeem/${code}/success`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Redemption failed');
    } finally {
      setIsRedeeming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!giftCard) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => router.push('/')}>Go Home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Redeem Gift Card
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Gift Card Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-primary-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Code:</span>
                <span className="font-mono font-semibold">{giftCard.code}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Balance:</span>
                <span className="text-2xl font-bold text-primary-600">
                  {formatCurrency(giftCard.balance, giftCard.currency)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`font-semibold ${
                    giftCard.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {giftCard.status}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Redemption Amount"
                type="number"
                step="0.01"
                max={giftCard.balance}
                error={errors.amount?.message}
                {...register('amount', { valueAsNumber: true })}
              />
              <div>
                <Input
                  label="Merchant ID (Your User ID)"
                  placeholder="Enter your merchant account ID"
                  error={errors.merchantId?.message}
                  {...register('merchantId')}
                />
                <p className="mt-1 text-sm text-gray-600">
                  Your Merchant ID is your user account ID. You can find it in your{' '}
                  <a href="/dashboard/settings" className="text-primary-600 hover:underline">
                    Dashboard Settings
                  </a>
                  {' '}or{' '}
                  <a href="/login" className="text-primary-600 hover:underline">
                    log in
                  </a>
                  {' '}to redeem without entering it manually.
                </p>
              </div>
              <Input
                label="Location (optional)"
                placeholder="Store location"
                error={errors.location?.message}
                {...register('location')}
              />
              <Input
                label="Notes (optional)"
                placeholder="Additional notes"
                error={errors.notes?.message}
                {...register('notes')}
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" isLoading={isRedeeming}>
                Redeem Gift Card
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

