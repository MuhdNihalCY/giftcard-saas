'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

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

export default function BrowsePage() {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto"></div>
          <p className="mt-4 text-plum-200">Loading gift cards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-serif font-bold text-plum-300 mb-4 text-center">
          Browse Gift Cards
        </h1>
        <p className="text-center text-navy-200 mb-12 text-lg">Discover our exclusive collection</p>
        
        {giftCards.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-plum-200">No gift cards available at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {giftCards.map((giftCard) => (
              <Card key={giftCard.id} className="hover:shadow-gold-glow-sm transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <CardTitle className="text-2xl">{giftCard.merchant.businessName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <p className="text-4xl font-serif font-bold bg-gold-gradient bg-clip-text text-transparent">
                      {formatCurrency(giftCard.value, giftCard.currency)}
                    </p>
                    <p className="text-sm text-plum-300 mt-2">Premium Gift Card</p>
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
  );
}

