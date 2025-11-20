'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gift Cards</h1>
        <Link href="/dashboard/gift-cards/create">
          <Button>Create Gift Card</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex space-x-4">
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="REDEEMED">Redeemed</option>
          <option value="EXPIRED">Expired</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Gift Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {giftCards.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600">No gift cards found.</p>
            </CardContent>
          </Card>
        ) : (
          giftCards.map((card) => (
            <Card key={card.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold">{card.merchant.businessName}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          card.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : card.status === 'REDEEMED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {card.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Code</p>
                        <p className="font-mono font-semibold">{card.code}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Value</p>
                        <p className="font-semibold">
                          {formatCurrency(card.value, card.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Balance</p>
                        <p className="font-semibold">
                          {formatCurrency(card.balance, card.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Created</p>
                        <p className="font-semibold">{formatDate(card.createdAt)}</p>
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
  );
}

