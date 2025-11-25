'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().optional(),
  minSalePrice: z.number().positive().optional(),
  maxSalePrice: z.number().positive().optional(),
  allowCustomAmount: z.boolean().default(false),
  fixedAmounts: z.string().optional(),
  fixedSalePrices: z.string().optional(),
  currency: z.string().min(1, 'Currency is required'),
  expiryDays: z.number().int().positive().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
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

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
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

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/gift-card-products/${productId}?includeInactive=true`);
      const product = response.data.data;

      setValue('name', product.name);
      setValue('description', product.description || '');
      setValue('image', product.image || '');
      setValue('currency', product.currency);
      setValue('expiryDays', product.expiryDays || undefined);
      setValue('category', product.category || '');
      setValue('allowCustomAmount', product.allowCustomAmount);
      setValue('isActive', product.isActive);
      setValue('isPublic', product.isPublic || false);

      if (product.allowCustomAmount) {
        setValue('minAmount', Number(product.minAmount || 0));
        setValue('maxAmount', Number(product.maxAmount || 0));
        if (product.minSalePrice) setValue('minSalePrice', Number(product.minSalePrice));
        if (product.maxSalePrice) setValue('maxSalePrice', Number(product.maxSalePrice));
      } else if (product.fixedAmounts && Array.isArray(product.fixedAmounts)) {
        setValue('fixedAmounts', product.fixedAmounts.join(', '));
        if (product.fixedSalePrices && Array.isArray(product.fixedSalePrices)) {
          setValue('fixedSalePrices', product.fixedSalePrices.join(', '));
        }
      }

      if (product.tags && Array.isArray(product.tags)) {
        setValue('tags', product.tags.join(', '));
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch product');
    } finally {
      setIsFetching(false);
    }
  };

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
        payload.fixedAmounts = undefined;
        payload.fixedSalePrices = undefined;
      } else if (data.fixedAmounts) {
        const amounts = data.fixedAmounts
          .split(',')
          .map(a => parseFloat(a.trim()))
          .filter(a => !isNaN(a) && a > 0);
        payload.fixedAmounts = amounts;
        
        if (data.fixedSalePrices) {
          const salePrices = data.fixedSalePrices
            .split(',')
            .map(a => parseFloat(a.trim()))
            .filter(a => !isNaN(a) && a > 0);
          if (salePrices.length === amounts.length) {
            payload.fixedSalePrices = salePrices;
          }
        }
        payload.minAmount = undefined;
        payload.maxAmount = undefined;
        payload.minSalePrice = undefined;
        payload.maxSalePrice = undefined;
      }

      if (data.tags) {
        payload.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
      }

      await api.put(`/gift-card-products/${productId}`, payload);

      router.push('/dashboard/gift-card-products');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update product');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="page-transition">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-plum-300">Edit Product</h1>
        <p className="text-navy-200 mt-2 text-lg">Update your gift card product</p>
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
                Update Product
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

