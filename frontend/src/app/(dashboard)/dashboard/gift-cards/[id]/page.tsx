'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { QRCode } from 'react-qr-code';

interface GiftCard {
  id: string;
  code: string;
  value: number;
  balance: number;
  currency: string;
  status: string;
  expiryDate?: string;
  customMessage?: string;
  recipientEmail?: string;
  recipientName?: string;
  allowPartialRedemption: boolean;
  createdAt: string;
  qrCodeUrl?: string;
  merchant: {
    id: string;
    businessName: string;
  };
}

export default function GiftCardDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [giftCard, setGiftCard] = useState<GiftCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redemptions, setRedemptions] = useState<any[]>([]);

  useEffect(() => {
    if (params.id) {
      fetchGiftCard();
      fetchRedemptions();
    }
  }, [params.id]);

  const fetchGiftCard = async () => {
    try {
      const response = await api.get(`/gift-cards/${params.id}`);
      setGiftCard(response.data.data);
    } catch (error) {
      console.error('Failed to fetch gift card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRedemptions = async () => {
    try {
      const response = await api.get(`/redemptions/gift-card/${params.id}/history`);
      // API returns { giftCard, redemptions, totalRedeemed }
      const responseData = response.data.data;
      if (responseData && Array.isArray(responseData.redemptions)) {
        setRedemptions(responseData.redemptions);
      } else if (Array.isArray(responseData)) {
        // Fallback: if response is directly an array
        setRedemptions(responseData);
      } else {
        setRedemptions([]);
      }
    } catch (error) {
      console.error('Failed to fetch redemptions:', error);
      setRedemptions([]); // Set to empty array on error
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this gift card?')) return;

    try {
      await api.delete(`/gift-cards/${params.id}`);
      router.push('/dashboard/gift-cards');
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

  if (!giftCard) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Gift card not found</p>
        <Link href="/dashboard/gift-cards">
          <Button className="mt-4">Back to Gift Cards</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gift Card Details</h1>
          <p className="text-gray-600 mt-1">Code: {giftCard.code}</p>
        </div>
        <div className="flex space-x-2">
          <Link href={`/dashboard/gift-cards/${params.id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          {giftCard.status !== 'REDEEMED' && (
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded mt-1 ${
                      giftCard.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : giftCard.status === 'REDEEMED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {giftCard.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Value</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(giftCard.value, giftCard.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Balance</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(giftCard.balance, giftCard.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(giftCard.createdAt)}
                  </p>
                </div>
                {giftCard.expiryDate && (
                  <div>
                    <p className="text-sm text-gray-500">Expires</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(giftCard.expiryDate)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Partial Redemption</p>
                  <p className="font-semibold text-gray-900">
                    {giftCard.allowPartialRedemption ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              {giftCard.customMessage && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">Custom Message</p>
                  <p className="text-gray-900 mt-1">{giftCard.customMessage}</p>
                </div>
              )}

              {giftCard.recipientEmail && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">Recipient</p>
                  <p className="text-gray-900 mt-1">
                    {giftCard.recipientName || giftCard.recipientEmail}
                  </p>
                  <p className="text-sm text-gray-600">{giftCard.recipientEmail}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Redemption History</CardTitle>
            </CardHeader>
            <CardContent>
              {!Array.isArray(redemptions) || redemptions.length === 0 ? (
                <p className="text-gray-600">No redemptions yet</p>
              ) : (
                <div className="space-y-4">
                  {redemptions.map((redemption: any) => (
                    <div key={redemption.id} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(redemption.amount, giftCard.currency)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(redemption.createdAt)}
                          </p>
                          {redemption.location && (
                            <p className="text-sm text-gray-600">{redemption.location}</p>
                          )}
                        </div>
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          Redeemed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <QRCode
                value={JSON.stringify({ code: giftCard.code, id: giftCard.id })}
                size={200}
                level="H"
                fgColor="#000000"
                bgColor="#FFFFFF"
              />
              <p className="mt-4 text-sm text-gray-600 text-center font-mono">
                {giftCard.code}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  const link = `${window.location.origin}/redeem/${giftCard.code}`;
                  navigator.clipboard.writeText(link);
                  alert('Redemption link copied to clipboard!');
                }}
              >
                Copy Redemption Link
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/redeem/${giftCard.code}`} className="block">
                <Button variant="outline" className="w-full">
                  View Public Page
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full"
                onClick={async () => {
                  try {
                    const response = await api.get(`/delivery/pdf/${giftCard.id}`, {
                      responseType: 'blob',
                    });
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `gift-card-${giftCard.code}.pdf`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                  } catch (error) {
                    console.error('Failed to download PDF:', error);
                  }
                }}
              >
                Download PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

