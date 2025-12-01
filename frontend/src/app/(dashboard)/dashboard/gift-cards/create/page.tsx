'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CurrencySelector } from '@/components/CurrencySelector';
import { TemplateSelector } from '@/components/TemplateSelector';
import api from '@/lib/api';
import { currencies } from '@/lib/currencies';

const giftCardSchema = z.object({
  value: z.number().min(1, 'Value must be at least 1'),
  currency: z.string().min(1, 'Currency is required'),
  expiryDate: z.string().optional(),
  templateId: z.string().uuid().optional().or(z.literal('')),
  customMessage: z.string().optional(),
  recipientEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  recipientName: z.string().optional(),
  allowPartialRedemption: z.boolean().default(true),
});

type GiftCardFormData = z.infer<typeof giftCardSchema>;

const CURRENCY_STORAGE_KEY = 'giftcard_preferred_currency';

export default function CreateGiftCardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<GiftCardFormData>({
    resolver: zodResolver(giftCardSchema),
    defaultValues: {
      currency: 'USD',
      allowPartialRedemption: true,
    },
  });

  // Load preferred currency on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (savedCurrency) {
      // Verify the saved currency still exists in our list
      const currencyExists = currencies.some(c => c.code === savedCurrency);
      if (currencyExists) {
        setValue('currency', savedCurrency);
      }
    }
  }, [setValue]);

  // Watch for currency changes to save preference
  const selectedCurrency = watch('currency');
  useEffect(() => {
    if (selectedCurrency) {
      localStorage.setItem(CURRENCY_STORAGE_KEY, selectedCurrency);
    }
  }, [selectedCurrency]);

  const onSubmit = async (data: GiftCardFormData) => {
    try {
      setIsLoading(true);
      setError('');

      const payload = {
        ...data,
        value: Number(data.value),
        expiryDate: data.expiryDate ? new Date(data.expiryDate).toISOString() : undefined,
        templateId: data.templateId || undefined,
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
    <div className="page-transition">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-plum-300">Create Gift Card</h1>
        <p className="text-navy-200 mt-2 text-lg">Create a new digital gift card</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Gift Card Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
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

              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <CurrencySelector
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.currency?.message}
                  />
                )}
              />

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

            <div className="md:col-span-2">
              <Controller
                name="templateId"
                control={control}
                render={({ field }) => (
                  <TemplateSelector
                    value={field.value}
                    onChange={field.onChange}
                    label="Gift Card Template"
                    showPreview={true}
                    error={errors.templateId?.message}
                  />
                )}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowPartial"
                className="h-4 w-4 text-gold-500 focus:ring-gold-500 border-plum-500/30 rounded bg-navy-800/50"
                {...register('allowPartialRedemption')}
              />
              <label htmlFor="allowPartial" className="ml-2 block text-sm text-plum-200">
                Allow partial redemption
              </label>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" variant="gold" isLoading={isLoading}>
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

