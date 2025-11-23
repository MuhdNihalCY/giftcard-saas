'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import QRCode from 'react-qr-code';

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  if (!giftCard) {
    return (
      <div className="text-center py-12">
        <p className="text-plum-200">Gift card not found</p>
        <Link href="/dashboard/gift-cards">
          <Button variant="gold" className="mt-4">Back to Gift Cards</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="page-transition">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-serif font-bold text-plum-300">Gift Card Details</h1>
          <p className="text-plum-200 mt-2">Code: <span className="font-mono text-navy-50">{giftCard.code}</span></p>
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
                  <p className="text-sm text-plum-300 mb-1">Status</p>
                  <span
                    className={`inline-block px-3 py-1 text-xs font-semibold rounded mt-1 ${
                      giftCard.status === 'ACTIVE'
                        ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                        : giftCard.status === 'REDEEMED'
                        ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30'
                        : 'bg-navy-700/50 text-plum-300 border border-navy-600'
                    }`}
                  >
                    {giftCard.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-plum-300 mb-1">Value</p>
                  <p className="font-serif font-bold text-gold-400">
                    {formatCurrency(giftCard.value, giftCard.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-plum-300 mb-1">Balance</p>
                  <p className="font-serif font-bold bg-gold-gradient bg-clip-text text-transparent">
                    {formatCurrency(giftCard.balance, giftCard.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-plum-300 mb-1">Created</p>
                  <p className="font-semibold text-navy-50">
                    {formatDate(giftCard.createdAt)}
                  </p>
                </div>
                {giftCard.expiryDate && (
                  <div>
                    <p className="text-sm text-plum-300 mb-1">Expires</p>
                    <p className="font-semibold text-navy-50">
                      {formatDate(giftCard.expiryDate)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-plum-300 mb-1">Partial Redemption</p>
                  <p className="font-semibold text-navy-50">
                    {giftCard.allowPartialRedemption ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              {giftCard.customMessage && (
                <div className="mt-4 pt-4 border-t border-navy-700">
                  <p className="text-sm text-plum-300 mb-1">Custom Message</p>
                  <p className="text-navy-50 mt-1">{giftCard.customMessage}</p>
                </div>
              )}

              {giftCard.recipientEmail && (
                <div className="mt-4 pt-4 border-t border-navy-700">
                  <p className="text-sm text-plum-300 mb-1">Recipient</p>
                  <p className="text-navy-50 mt-1">
                    {giftCard.recipientName || giftCard.recipientEmail}
                  </p>
                  <p className="text-sm text-plum-200">{giftCard.recipientEmail}</p>
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
                <p className="text-plum-200 text-center py-8">No redemptions yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-plum-300 uppercase bg-navy-800/50 border-b border-navy-700">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Method</th>
                        <th className="px-4 py-3">Balance (Before → After)</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {redemptions.map((redemption: any) => (
                        <tr key={redemption.id} className="border-b border-navy-700 hover:bg-navy-800/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-navy-50 whitespace-nowrap">
                            {formatDate(redemption.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-red-400 font-semibold">
                            -{formatCurrency(redemption.amount, giftCard.currency)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-900/30 text-blue-400 border border-blue-500/30">
                              {redemption.redemptionMethod?.replace('_', ' ') || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-1">
                              <span className="text-plum-300">
                                {formatCurrency(redemption.balanceBefore, giftCard.currency)}
                              </span>
                              <span className="text-plum-400">→</span>
                              <span className="font-medium text-navy-50">
                                {formatCurrency(redemption.balanceAfter, giftCard.currency)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-plum-200">
                            {redemption.location || '-'}
                          </td>
                          <td className="px-4 py-3 text-plum-200 max-w-xs truncate" title={redemption.notes}>
                            {redemption.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
              <div className="bg-white p-4 rounded-lg">
                <QRCode
                  value={JSON.stringify({ code: giftCard.code, id: giftCard.id })}
                  size={200}
                  level="H"
                  fgColor="#000000"
                  bgColor="#FFFFFF"
                />
              </div>
              <p className="mt-4 text-sm text-plum-200 text-center font-mono">
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

