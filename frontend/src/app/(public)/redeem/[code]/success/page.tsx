'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-green-600">
              ✅ Redemption Successful!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-6">
              <div className="p-6 bg-green-50 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Gift Card Redeemed Successfully
                </h2>
                {giftCard && (
                  <div className="space-y-2 text-left max-w-md mx-auto">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gift Card Code:</span>
                      <span className="font-mono font-semibold">{giftCard.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining Balance:</span>
                      <span className="text-2xl font-bold text-primary-600">
                        {formatCurrency(giftCard.balance, giftCard.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`font-semibold ${
                          giftCard.status === 'ACTIVE'
                            ? 'text-green-600'
                            : giftCard.status === 'REDEEMED'
                            ? 'text-blue-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {giftCard.status}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-4 justify-center">
                <Link href="/">
                  <Button variant="outline">Go Home</Button>
                </Link>
                {giftCard && giftCard.status === 'ACTIVE' && (
                  <Link href={`/redeem/${code}`}>
                    <Button>Redeem Again</Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

