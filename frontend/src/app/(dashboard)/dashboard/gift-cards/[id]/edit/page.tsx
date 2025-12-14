'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import api from '@/lib/api';
import logger from '@/lib/logger';

const giftCardSchema = z.object({
  value: z.number().min(1, 'Value must be at least 1'),
  expiryDate: z.string().optional(),
  customMessage: z.string().optional(),
  allowPartialRedemption: z.boolean().default(true),
});

type GiftCardFormData = z.infer<typeof giftCardSchema>;

export default function EditGiftCardPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GiftCardFormData>({
    resolver: zodResolver(giftCardSchema),
  });

  useEffect(() => {
    fetchGiftCard();
  }, [params.id]);

  const fetchGiftCard = async () => {
    try {
      const response = await api.get(`/gift-cards/${params.id}`);
      const giftCard = response.data.data;
      
      reset({
        value: giftCard.value,
        expiryDate: giftCard.expiryDate
          ? new Date(giftCard.expiryDate).toISOString().split('T')[0]
          : undefined,
        customMessage: giftCard.customMessage || '',
        allowPartialRedemption: giftCard.allowPartialRedemption,
      });
    } catch (error) {
      logger.error('Failed to fetch gift card', { error });
      setError('Failed to load gift card');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: GiftCardFormData) => {
    try {
      setIsSaving(true);
      setError('');

      const payload = {
        ...data,
        value: Number(data.value),
        expiryDate: data.expiryDate ? new Date(data.expiryDate).toISOString() : undefined,
      };

      await api.put(`/gift-cards/${params.id}`, payload);
      router.push(`/dashboard/gift-cards/${params.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update gift card');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Gift Card</h1>
        <p className="text-gray-600 mt-2">Update gift card details</p>
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

              <Input
                label="Expiry Date (Optional)"
                type="date"
                error={errors.expiryDate?.message}
                {...register('expiryDate')}
              />

              <div className="md:col-span-2">
                <Input
                  label="Custom Message (Optional)"
                  type="text"
                  error={errors.customMessage?.message}
                  {...register('customMessage')}
                />
              </div>
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
              <Button type="submit" isLoading={isSaving}>
                Save Changes
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

