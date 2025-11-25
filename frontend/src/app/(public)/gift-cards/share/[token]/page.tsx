'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Navigation } from '@/components/Navigation';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import QRCode from 'react-qr-code';
import { CardSkeleton } from '@/components/ui/Skeleton';

export default function GiftCardSharePage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const token = params.token as string;
  const [giftCard, setGiftCard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (token) {
      fetchGiftCard();
    }
  }, [token]);

  const fetchGiftCard = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await api.get(`/gift-card-share/token/${token}`);
      setGiftCard(response.data.data.giftCard);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid or expired share link');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-900">
        <Navigation />
        <div className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error || !giftCard) {
    return (
      <div className="min-h-screen bg-navy-900">
        <Navigation />
        <div className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-2xl font-serif font-bold text-plum-300 mb-2">
                  {error || 'Gift Card Not Found'}
                </h2>
                <p className="text-plum-200 mb-6">
                  {error || 'This gift card share link is invalid or has expired.'}
                </p>
                <Button variant="gold" onClick={() => router.push('/')}>
                  Go to Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const qrData = JSON.stringify({ code: giftCard.code, id: giftCard.id });

  return (
    <div className="min-h-screen bg-navy-900">
      <Navigation />
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Shared Gift Card</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Merchant Info */}
              <div className="flex items-center gap-4 pb-4 border-b border-navy-700">
                {giftCard.merchant.businessLogo && (
                  <img
                    src={giftCard.merchant.businessLogo}
                    alt={giftCard.merchant.businessName}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h3 className="text-xl font-serif font-semibold text-plum-300">
                    {giftCard.merchant.businessName}
                  </h3>
                  <p className="text-sm text-plum-200">Gift Card</p>
                </div>
              </div>

              {/* Balance */}
              <div className="text-center py-6 bg-navy-800/50 rounded-lg border border-navy-700">
                <p className="text-sm text-plum-300 mb-2">Current Balance</p>
                <p className="text-4xl font-serif font-bold bg-gold-gradient bg-clip-text text-transparent">
                  {formatCurrency(giftCard.balance, giftCard.currency)}
                </p>
                <p className="text-sm text-plum-200 mt-2">
                  Original Value: {formatCurrency(giftCard.value, giftCard.currency)}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-navy-700">
                  <span className="text-plum-200">Card Code:</span>
                  <span className="font-mono font-semibold text-navy-50">{giftCard.code}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-navy-700">
                  <span className="text-plum-200">Status:</span>
                  <span
                    className={`font-semibold ${
                      giftCard.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {giftCard.status}
                  </span>
                </div>
                {giftCard.expiryDate && (
                  <div className="flex justify-between items-center py-2 border-b border-navy-700">
                    <span className="text-plum-200">Expires:</span>
                    <span className="text-navy-50">{formatDate(giftCard.expiryDate)}</span>
                  </div>
                )}
                {giftCard.recipientName && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-plum-200">Recipient:</span>
                    <span className="text-navy-50">{giftCard.recipientName}</span>
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div className="p-6 bg-navy-800/50 rounded-lg text-center border border-navy-700">
                <p className="text-sm text-plum-200 mb-4">Scan to Redeem</p>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <QRCode
                    value={qrData}
                    size={200}
                    level="H"
                    fgColor="#000000"
                    bgColor="#FFFFFF"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                {isAuthenticated ? (
                  <>
                    <Button
                      variant="gold"
                      onClick={() => router.push('/dashboard/wallet')}
                      className="w-full"
                    >
                      View in My Wallet
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/browse')}
                      className="w-full"
                    >
                      Browse More Gift Cards
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="gold"
                      onClick={() => router.push('/auth/login')}
                      className="w-full"
                    >
                      Sign In to Claim Gift Card
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/auth/register')}
                      className="w-full"
                    >
                      Create Account
                    </Button>
                  </>
                )}
              </div>

              {/* Note */}
              <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-300">
                  <strong>Note:</strong> This is a shared gift card. The balance shown is current as of the share date.
                  To redeem, present this QR code to the merchant or use the code above.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

