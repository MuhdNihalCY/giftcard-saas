'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { GiftCardSkeleton } from '@/components/ui/Skeleton';
import { ProductCard } from '@/components/ProductCard';
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
  merchant: {
    id: string;
    businessName: string | null;
    businessLogo?: string | null;
  };
}

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'default';

function BrowsePageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<GiftCardProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/gift-card-products/public', {
        params: { isActive: true },
      });
      setProducts(response.data.data || []);
    } catch (error) {
      logger.error('Failed to fetch products', { error });
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique categories for filter
  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map(p => p.category).filter(Boolean) as string[]));
    return unique.sort();
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.merchant.businessName?.toLowerCase().includes(query) ||
        product.currency.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        const getMinPrice = (p: GiftCardProduct) => {
          if (p.fixedAmounts && p.fixedAmounts.length > 0) return Math.min(...p.fixedAmounts);
          return p.minAmount || 0;
        };
        filtered.sort((a, b) => getMinPrice(a) - getMinPrice(b));
        break;
      case 'price-desc':
        const getMaxPrice = (p: GiftCardProduct) => {
          if (p.fixedAmounts && p.fixedAmounts.length > 0) return Math.max(...p.fixedAmounts);
          return p.maxAmount || p.minAmount || 0;
        };
        filtered.sort((a, b) => getMaxPrice(b) - getMaxPrice(a));
        break;
      default:
        break;
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-navy-900">
      <Navigation />
      <div className="py-16 px-4 sm:px-6 lg:px-8 page-transition">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-serif font-bold text-plum-300 mb-4 text-center">
            Browse Gift Cards
          </h1>
          <p className="text-center text-navy-200 mb-12 text-lg">Discover our exclusive collection</p>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by product name, description, or merchant..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pl-12 bg-navy-800/50 border-2 border-plum-500/30 rounded-lg text-navy-50 placeholder-plum-300 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
                  />
                  <svg
                    className="absolute left-4 top-3.5 h-5 w-5 text-plum-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Category Filter */}
              {categories.length > 0 && (
                <div className="md:w-64">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-navy-800/50 border-2 border-plum-500/30 rounded-lg text-navy-50 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  >
                    <option value="all" className="bg-navy-800">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category} className="bg-navy-800">
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sort */}
              <div className="md:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-4 py-3 bg-navy-800/50 border-2 border-plum-500/30 rounded-lg text-navy-50 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                >
                  <option value="default" className="bg-navy-800">Default</option>
                  <option value="name-asc" className="bg-navy-800">Name (A-Z)</option>
                  <option value="name-desc" className="bg-navy-800">Name (Z-A)</option>
                  <option value="price-asc" className="bg-navy-800">Price (Low to High)</option>
                  <option value="price-desc" className="bg-navy-800">Price (High to Low)</option>
                </select>
              </div>
            </div>

            {/* Results count */}
            {!isLoading && (
              <p className="text-plum-200 text-sm">
                Showing {filteredAndSortedProducts.length} of {products.length} products
              </p>
            )}
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <GiftCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <div className="text-6xl mb-4">🎁</div>
                <h3 className="text-2xl font-serif font-semibold text-plum-300 mb-2">
                  No products found
                </h3>
                <p className="text-plum-200 mb-6">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No products available at the moment.'}
                </p>
                {(searchQuery || selectedCategory !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSortBy('default');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAndSortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-navy-900">
        <Navigation />
        <div className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <GiftCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <BrowsePageContent />
    </Suspense>
  );
}

