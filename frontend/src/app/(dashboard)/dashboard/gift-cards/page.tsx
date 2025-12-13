'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { FeatureFlagGuard } from '@/components/FeatureFlagGuard';
import Link from 'next/link';

interface GiftCard {
  id: string;
  code: string;
  value: number;
  balance: number;
  currency: string;
  status: string;
  expiryDate?: string;
  createdAt: string;
  merchant: {
    businessName: string;
  };
}

export default function GiftCardsPage() {
  const { user } = useAuthStore();
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    fetchGiftCards();
  }, [filters]);

  const fetchGiftCards = async () => {
    try {
      const params: any = {
        page: filters.page,
        limit: filters.limit,
      };

      if (user?.role === 'MERCHANT') {
        params.merchantId = user.id;
      }

      if (filters.status) {
        params.status = filters.status;
      }

      const response = await api.get('/gift-cards', { params });
      setGiftCards(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch gift cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gift card?')) return;

    try {
      await api.delete(`/gift-cards/${id}`);
      fetchGiftCards();
    } catch (error) {
      console.error('Failed to delete gift card:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <FeatureFlagGuard feature="gift_cards">
      <div className="page-transition">
        <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-slate-100">Gift Cards</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your gift card collection</p>
        </div>
        <Link href="/dashboard/gift-cards/create">
          <Button variant="primary">Create Gift Card</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex space-x-4">
        <select
          className="px-4 py-3 border-2 border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
        >
          <option value="" className="bg-white dark:bg-slate-800">All Status</option>
          <option value="ACTIVE" className="bg-white dark:bg-slate-800">Active</option>
          <option value="REDEEMED" className="bg-white dark:bg-slate-800">Redeemed</option>
          <option value="EXPIRED" className="bg-white dark:bg-slate-800">Expired</option>
          <option value="CANCELLED" className="bg-white dark:bg-slate-800">Cancelled</option>
        </select>
      </div>

      {/* Gift Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {giftCards.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <div className="text-6xl mb-4">🎁</div>
              <h3 className="text-2xl font-serif font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No gift cards found
              </h3>
              <p className="text-slate-600 dark:text-slate-400">Create your first gift card to get started</p>
            </CardContent>
          </Card>
        ) : (
          giftCards.map((card) => (
            <Card key={card.id} className="hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <h3 className="text-xl font-serif font-semibold text-slate-900 dark:text-slate-100">{card.merchant.businessName}</h3>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded ${
                          card.status === 'ACTIVE'
                            ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                            : card.status === 'REDEEMED'
                            ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {card.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 mb-1">Code</p>
                        <p className="font-mono font-semibold text-slate-900 dark:text-slate-100">{card.code}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 mb-1">Value</p>
                        <p className="font-serif font-bold text-cyan-600 dark:text-cyan-400">
                          {formatCurrency(card.value, card.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 mb-1">Balance</p>
                        <p className="font-serif font-bold bg-cyan-gradient bg-clip-text text-transparent">
                          {formatCurrency(card.balance, card.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 mb-1">Created</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{formatDate(card.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Link href={`/dashboard/gift-cards/${card.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    {card.status !== 'REDEEMED' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(card.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
    </FeatureFlagGuard>
  );
}

