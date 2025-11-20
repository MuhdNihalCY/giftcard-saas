'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import api from '@/lib/api';

const giftCardSchema = z.object({
  value: z.number().min(1, 'Value must be at least 1'),
  currency: z.string().min(1, 'Currency is required'),
  expiryDate: z.string().optional(),
  customMessage: z.string().optional(),
  recipientEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  recipientName: z.string().optional(),
  allowPartialRedemption: z.boolean().default(true),
});

type GiftCardFormData = z.infer<typeof giftCardSchema>;

export default function CreateGiftCardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<GiftCardFormData>({
    resolver: zodResolver(giftCardSchema),
    defaultValues: {
      currency: 'USD',
      allowPartialRedemption: true,
    },
  });

  const onSubmit = async (data: GiftCardFormData) => {
    try {
      setIsLoading(true);
      setError('');

      const payload = {
        ...data,
        value: Number(data.value),
        expiryDate: data.expiryDate ? new Date(data.expiryDate).toISOString() : undefined,
        recipientEmail: data.recipientEmail || undefined,
      };

      const response = await api.post('/gift-cards', payload);
      
      router.push(`/dashboard/gift-cards/${response.data.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create gift card');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Gift Card</h1>
        <p className="text-gray-600 mt-2">Create a new digital gift card</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gift Card Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Value"
                type="number"
                step="0.01"
                min="1"
                error={errors.value?.message}
                {...register('value', { valueAsNumber: true })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Currency
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  {...register('currency')}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>

              <Input
                label="Expiry Date (Optional)"
                type="date"
                error={errors.expiryDate?.message}
                {...register('expiryDate')}
              />

              <Input
                label="Recipient Email (Optional)"
                type="email"
                error={errors.recipientEmail?.message}
                {...register('recipientEmail')}
              />

              <Input
                label="Recipient Name (Optional)"
                type="text"
                error={errors.recipientName?.message}
                {...register('recipientName')}
              />

              <Input
                label="Custom Message (Optional)"
                type="text"
                error={errors.customMessage?.message}
                {...register('customMessage')}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowPartial"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                {...register('allowPartialRedemption')}
              />
              <label htmlFor="allowPartial" className="ml-2 block text-sm text-gray-900">
                Allow partial redemption
              </label>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" isLoading={isLoading}>
                Create Gift Card
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

