'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CurrencySelector } from '@/components/CurrencySelector';
import api from '@/lib/api';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  minAmount: z.number().positive().optional(), // Gift card value
  maxAmount: z.number().positive().optional(), // Gift card value
  minSalePrice: z.number().positive().optional(), // What customer pays
  maxSalePrice: z.number().positive().optional(), // What customer pays
  allowCustomAmount: z.boolean().default(false),
  fixedAmounts: z.string().optional(), // Comma-separated string (gift card values)
  fixedSalePrices: z.string().optional(), // Comma-separated string (sale prices)
  currency: z.string().min(1, 'Currency is required'),
  expiryDays: z.number().int().positive().optional(),
  category: z.string().optional(),
  tags: z.string().optional(), // Comma-separated string
  isActive: z.boolean().default(true),
  isPublic: z.boolean().default(false),
}).refine((data) => {
  if (data.allowCustomAmount && (!data.minAmount || !data.maxAmount)) {
    return false;
  }
  return true;
}, {
  message: 'Minimum and maximum amounts are required when custom amounts are allowed',
  path: ['minAmount'],
});

type ProductFormData = z.infer<typeof productSchema>;

export default function CreateProductPage() {
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
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      currency: 'USD',
      allowCustomAmount: false,
      isActive: true,
    },
  });

  const allowCustomAmount = watch('allowCustomAmount');

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsLoading(true);
      setError('');

      const payload: any = {
        name: data.name,
        description: data.description || undefined,
        image: data.image || undefined,
        currency: data.currency,
        expiryDays: data.expiryDays ? Number(data.expiryDays) : undefined,
        category: data.category || undefined,
        allowCustomAmount: data.allowCustomAmount,
        isActive: data.isActive,
        isPublic: data.isPublic,
      };

      if (data.allowCustomAmount) {
        payload.minAmount = Number(data.minAmount);
        payload.maxAmount = Number(data.maxAmount);
        if (data.minSalePrice) payload.minSalePrice = Number(data.minSalePrice);
        if (data.maxSalePrice) payload.maxSalePrice = Number(data.maxSalePrice);
      } else if (data.fixedAmounts) {
        const amounts = data.fixedAmounts
          .split(',')
          .map(a => parseFloat(a.trim()))
          .filter(a => !isNaN(a) && a > 0);
        payload.fixedAmounts = amounts;
        
        // Parse fixed sale prices if provided
        if (data.fixedSalePrices) {
          const salePrices = data.fixedSalePrices
            .split(',')
            .map(a => parseFloat(a.trim()))
            .filter(a => !isNaN(a) && a > 0);
          if (salePrices.length === amounts.length) {
            payload.fixedSalePrices = salePrices;
          }
        }
      }

      if (data.tags) {
        payload.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
      }

      const response = await api.post('/gift-card-products', payload);

      router.push(`/dashboard/gift-card-products/${response.data.data.id}/edit`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-transition">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-plum-300">Create Product</h1>
        <p className="text-navy-200 mt-2 text-lg">Create a new gift card product for your catalog</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Product Details</CardTitle>
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
                label="Product Name *"
                type="text"
                error={errors.name?.message}
                {...register('name')}
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

              <div className="md:col-span-2">
                <Input
                  label="Description"
                  type="text"
                  error={errors.description?.message}
                  {...register('description')}
                />
              </div>

              <Input
                label="Image URL"
                type="url"
                placeholder="https://example.com/image.jpg"
                error={errors.image?.message}
                {...register('image')}
              />

              <Input
                label="Category"
                type="text"
                placeholder="e.g., Retail, Restaurant, Services"
                error={errors.category?.message}
                {...register('category')}
              />

              <Input
                label="Tags (comma-separated)"
                type="text"
                placeholder="birthday, holiday, thank you"
                error={errors.tags?.message}
                {...register('tags')}
              />

              <Input
                label="Expiry Days (optional)"
                type="number"
                placeholder="365"
                error={errors.expiryDays?.message}
                {...register('expiryDays', { valueAsNumber: true })}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowCustomAmount"
                className="h-4 w-4 text-gold-500 focus:ring-gold-500 border-plum-500/30 rounded bg-navy-800/50"
                {...register('allowCustomAmount')}
              />
              <label htmlFor="allowCustomAmount" className="ml-2 block text-sm text-plum-200">
                Allow customers to enter custom amounts
              </label>
            </div>

            {allowCustomAmount ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-plum-300 mb-4">Gift Card Values (What customer gets)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Minimum Gift Card Value *"
                      type="number"
                      step="0.01"
                      min="0.01"
                      error={errors.minAmount?.message}
                      {...register('minAmount', { valueAsNumber: true })}
                    />
                    <Input
                      label="Maximum Gift Card Value *"
                      type="number"
                      step="0.01"
                      min="0.01"
                      error={errors.maxAmount?.message}
                      {...register('maxAmount', { valueAsNumber: true })}
                    />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-plum-300 mb-4">Sale Prices (What customer pays) - Optional</h4>
                  <p className="text-sm text-plum-200 mb-4">Leave empty to use gift card values as sale prices (no discount)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Minimum Sale Price"
                      type="number"
                      step="0.01"
                      min="0.01"
                      error={errors.minSalePrice?.message}
                      {...register('minSalePrice', { valueAsNumber: true })}
                    />
                    <Input
                      label="Maximum Sale Price"
                      type="number"
                      step="0.01"
                      min="0.01"
                      error={errors.maxSalePrice?.message}
                      {...register('maxSalePrice', { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-plum-300 mb-4">Gift Card Values (What customer gets)</h4>
                  <Input
                    label="Fixed Gift Card Values (comma-separated) *"
                    type="text"
                    placeholder="25, 50, 100, 200"
                    error={errors.fixedAmounts?.message}
                    {...register('fixedAmounts')}
                  />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-plum-300 mb-4">Sale Prices (What customer pays) - Optional</h4>
                  <p className="text-sm text-plum-200 mb-4">Comma-separated, must match the number of gift card values. Leave empty for no discount.</p>
                  <Input
                    label="Fixed Sale Prices (comma-separated)"
                    type="text"
                    placeholder="20, 45, 90, 180"
                    error={errors.fixedSalePrices?.message}
                    {...register('fixedSalePrices')}
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  className="h-4 w-4 text-gold-500 focus:ring-gold-500 border-plum-500/30 rounded bg-navy-800/50"
                  {...register('isActive')}
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-plum-200">
                  Product is active
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  className="h-4 w-4 text-gold-500 focus:ring-gold-500 border-plum-500/30 rounded bg-navy-800/50"
                  {...register('isPublic')}
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-plum-200">
                  Make product public (visible to all users in browse page)
                </label>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" variant="gold" isLoading={isLoading}>
                Create Product
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

