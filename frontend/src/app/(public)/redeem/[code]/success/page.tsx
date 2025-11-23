'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';

export default function RedeemSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [giftCard, setGiftCard] = useState<any>(null);

  useEffect(() => {
    if (code) {
      fetchGiftCard();
    }
  }, [code]);

  const fetchGiftCard = async () => {
    try {
      const response = await api.post('/redemptions/check-balance', { code });
      setGiftCard(response.data.data);
    } catch (error) {
      console.error('Failed to fetch gift card:', error);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900">
      <Navigation />
      <div className="py-16 px-4 sm:px-6 lg:px-8 page-transition">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-3xl text-green-400">
                ✅ Redemption Successful!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                <div className="p-8 bg-green-900/20 border border-green-500/30 rounded-xl">
                  <h2 className="text-3xl font-serif font-bold text-plum-300 mb-6">
                    Gift Card Redeemed Successfully
                  </h2>
                  {giftCard && (
                    <div className="space-y-4 text-left max-w-md mx-auto">
                      <div className="flex justify-between items-center py-2 border-b border-navy-700">
                        <span className="text-plum-200">Gift Card Code:</span>
                        <span className="font-mono font-semibold text-navy-50">{giftCard.code}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-navy-700">
                        <span className="text-plum-200">Remaining Balance:</span>
                        <span className="text-3xl font-serif font-bold bg-gold-gradient bg-clip-text text-transparent">
                          {formatCurrency(giftCard.balance, giftCard.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-plum-200">Status:</span>
                        <span
                          className={`font-semibold ${
                            giftCard.status === 'ACTIVE'
                              ? 'text-green-400'
                              : giftCard.status === 'REDEEMED'
                              ? 'text-blue-400'
                              : 'text-plum-300'
                          }`}
                        >
                          {giftCard.status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4 justify-center pt-4">
                  <Link href="/">
                    <Button variant="outline">Go Home</Button>
                  </Link>
                  {giftCard && giftCard.status === 'ACTIVE' && (
                    <Link href={`/redeem/${code}`}>
                      <Button variant="gold">Redeem Again</Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

