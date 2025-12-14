'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FilterBar } from '@/components/dashboard/FilterBar';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import Image from 'next/image';
import logger from '@/lib/logger';

interface GiftCardProduct {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  minAmount?: number | null;
  maxAmount?: number | null;
  minSalePrice?: number | null;
  maxSalePrice?: number | null;
  allowCustomAmount: boolean;
  fixedAmounts?: number[] | null;
  fixedSalePrices?: number[] | null;
  currency: string;
  category?: string | null;
  isActive: boolean;
  isPublic?: boolean;
  createdAt: string;
}

export default function GiftCardProductsPage() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<GiftCardProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');
  const [filters, setFilters] = useState({
    isActive: '',
    search: searchParams?.get('search') || '',
    page: 1,
    limit: 20,
  });

  // Initialize search from URL on mount
  useEffect(() => {
    const urlSearch = searchParams?.get('search') || '';
    if (urlSearch) {
      setSearchQuery(urlSearch);
      setFilters(prev => ({ ...prev, search: urlSearch }));
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      const params: Record<string, string | number> = {
        page: filters.page,
        limit: filters.limit,
      };

      if (user?.role === 'MERCHANT') {
        params.merchantId = user.id as string;
      }

      if (filters.isActive !== '') {
        params.isActive = String(filters.isActive === 'true');
      }

      if (filters.search) {
        params.search = filters.search;
      }

      const response = await api.get('/gift-card-products', { params });
      setProducts(response.data.data || []);
    } catch (error) {
      logger.error('Failed to fetch products', { error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      await api.delete(`/gift-card-products/${id}`);
      fetchProducts();
    } catch (error: unknown) {
      const errorMessage = 
        (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data && error.response.data.error && typeof error.response.data.error === 'object' && 'message' in error.response.data.error && typeof error.response.data.error.message === 'string')
          ? error.response.data.error.message
          : 'Failed to delete product';
      alert(errorMessage);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/gift-card-products/${id}`, {
        isActive: !currentStatus,
      });
      fetchProducts();
    } catch (error) {
      logger.error('Failed to update product status', { error, productId: id, isActive: !currentStatus });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500/20 border-t-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="page-transition">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-slate-100">Gift Card Products</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your gift card product catalog</p>
        </div>
        <Link href="/dashboard/gift-card-products/create">
          <Button variant="primary">Create Product</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
          <FilterBar
            searchPlaceholder="Search by product name or description..."
            searchValue={searchQuery}
            onSearchChange={(value) => {
              setSearchQuery(value);
              setFilters({ ...filters, search: value, page: 1 });
            }}
            suggestionEndpoint="/gift-card-products/suggestions"
          filters={[
            {
              key: 'isActive',
              label: 'Status',
              value: filters.isActive,
              options: [
                { label: 'All Products', value: '' },
                { label: 'Active', value: 'true' },
                { label: 'Inactive', value: 'false' },
              ],
              onChange: (value) => setFilters({ ...filters, isActive: value, page: 1 }),
            },
          ]}
          onClear={() => {
            setSearchQuery('');
            setFilters({ isActive: '', search: '', page: 1, limit: 20 });
          }}
        />
      </div>

      {/* Products List */}
      <div className="grid grid-cols-1 gap-4">
        {products.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <div className="text-6xl mb-4">🎁</div>
              <h3 className="text-2xl font-serif font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No products found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Create your first product to get started</p>
              <Link href="/dashboard/gift-card-products/create">
                <Button variant="primary">Create Product</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          products.map((product) => (
            <Card key={product.id} className="hover:shadow-gold-glow-sm transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {product.image && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <h3 className="text-xl font-serif font-semibold text-slate-900 dark:text-slate-100">{product.name}</h3>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded ${
                          product.isActive
                            ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {product.isPublic && (
                        <span className="px-3 py-1 text-xs font-semibold rounded bg-blue-900/30 text-blue-400 border border-blue-500/30">
                          Public
                        </span>
                      )}
                      {product.category && (
                        <span className="px-3 py-1 text-xs font-semibold rounded bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
                          {product.category}
                        </span>
                      )}
                    </div>
                    {product.description && (
                      <p className="text-slate-700 dark:text-slate-300 mb-4 line-clamp-2">{product.description}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 mb-1">Pricing</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                          {product.allowCustomAmount
                            ? `Custom: ${formatCurrency(Number(product.minAmount || 0), product.currency)} - ${formatCurrency(Number(product.maxAmount || 0), product.currency)}`
                            : product.fixedAmounts && product.fixedAmounts.length > 0
                            ? `${product.fixedAmounts.length} option${product.fixedAmounts.length !== 1 ? 's' : ''}`
                            : 'N/A'}
                        </p>
                        {product.fixedAmounts && product.fixedAmounts.length > 0 && product.fixedSalePrices && product.fixedSalePrices.length > 0 && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Sale prices available
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 mb-1">Currency</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{product.currency}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 mb-1">Created</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{formatDate(product.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 mb-1">Actions</p>
                        <div className="flex space-x-2">
                          <Link href={`/dashboard/gift-card-products/${product.id}/edit`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant={product.isActive ? 'outline' : 'primary'}
                            size="sm"
                            onClick={() => toggleActive(product.id, product.isActive)}
                          >
                            {product.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

