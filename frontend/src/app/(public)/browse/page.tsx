'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { GiftCardSkeleton } from '@/components/ui/Skeleton';

interface GiftCard {
  id: string;
  code: string;
  value: number;
  currency: string;
  status: string;
  merchant: {
    id: string;
    businessName: string;
  };
}

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'default';

function BrowsePageContent() {
  const searchParams = useSearchParams();
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');
  const [selectedMerchant, setSelectedMerchant] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  useEffect(() => {
    fetchGiftCards();
  }, []);

  const fetchGiftCards = async () => {
    try {
      const response = await api.get('/gift-cards', {
        params: { status: 'ACTIVE' },
      });
      setGiftCards(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch gift cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique merchants for filter
  const merchants = useMemo(() => {
    const unique = Array.from(new Set(giftCards.map(card => card.merchant.businessName)));
    return unique.sort();
  }, [giftCards]);

  // Filter and sort gift cards
  const filteredAndSortedCards = useMemo(() => {
    let filtered = [...giftCards];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(card =>
        card.merchant.businessName.toLowerCase().includes(query) ||
        card.currency.toLowerCase().includes(query)
      );
    }

    // Filter by merchant
    if (selectedMerchant !== 'all') {
      filtered = filtered.filter(card => card.merchant.businessName === selectedMerchant);
    }

    // Sort
    switch (sortBy) {
      case 'name-asc':
        filtered.sort((a, b) => a.merchant.businessName.localeCompare(b.merchant.businessName));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.merchant.businessName.localeCompare(a.merchant.businessName));
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.value - b.value);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.value - a.value);
        break;
      default:
        break;
    }

    return filtered;
  }, [giftCards, searchQuery, selectedMerchant, sortBy]);

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
                    placeholder="Search by merchant name or currency..."
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

              {/* Merchant Filter */}
              <div className="md:w-64">
                <select
                  value={selectedMerchant}
                  onChange={(e) => setSelectedMerchant(e.target.value)}
                  className="w-full px-4 py-3 bg-navy-800/50 border-2 border-plum-500/30 rounded-lg text-navy-50 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                >
                  <option value="all" className="bg-navy-800">All Merchants</option>
                  {merchants.map((merchant) => (
                    <option key={merchant} value={merchant} className="bg-navy-800">
                      {merchant}
                    </option>
                  ))}
                </select>
              </div>

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
                Showing {filteredAndSortedCards.length} of {giftCards.length} gift cards
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
          ) : filteredAndSortedCards.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <div className="text-6xl mb-4">🎁</div>
                <h3 className="text-2xl font-serif font-semibold text-plum-300 mb-2">
                  No gift cards found
                </h3>
                <p className="text-plum-200 mb-6">
                  {searchQuery || selectedMerchant !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No gift cards available at the moment.'}
                </p>
                {(searchQuery || selectedMerchant !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedMerchant('all');
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
              {filteredAndSortedCards.map((giftCard) => (
                <Card
                  key={giftCard.id}
                  className="hover:shadow-gold-glow-sm transition-all duration-300 hover:scale-105"
                >
                  <CardHeader>
                    <CardTitle className="text-2xl">{giftCard.merchant.businessName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <p className="text-4xl font-serif font-bold bg-gold-gradient bg-clip-text text-transparent">
                        {formatCurrency(giftCard.value, giftCard.currency)}
                      </p>
                      <p className="text-sm text-plum-300 mt-2">Gift Card</p>
                    </div>
                    <Link href={`/purchase/${giftCard.id}`}>
                      <Button variant="gold" className="w-full text-lg py-3">
                        Purchase Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
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

