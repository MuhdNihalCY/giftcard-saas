'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { formatDateTime } from '@/lib/utils';

interface GiftCard {
  id: string;
  code: string;
  value: number;
  balance: number;
  currency: string;
  status: string;
  expiryDate?: string;
  qrCodeUrl?: string;
  merchant: {
    businessName: string;
  };
}

export default function WalletPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showTransactions, setShowTransactions] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchGiftCards();
    }
  }, [isAuthenticated]);

  const fetchGiftCards = async () => {
    try {
      // Fetch gift cards where user is recipient or owner
      const response = await api.get('/gift-cards');
      setGiftCards(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch gift cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async (giftCardId: string) => {
    try {
      const response = await api.get(`/redemptions/gift-card/${giftCardId}/transactions`);
      setTransactions(response.data.data.transactions || []);
      setShowTransactions(true);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your wallet</p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Gift Card Wallet</h1>

        {giftCards.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 mb-4">You don't have any gift cards yet.</p>
              <Link href="/browse">
                <Button>Browse Gift Cards</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {giftCards.map((card) => (
              <Card key={card.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{card.merchant.businessName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-primary-600">
                      {formatCurrency(card.balance, card.currency)}
                    </p>
                    <p className="text-sm text-gray-500">
                      of {formatCurrency(card.value, card.currency)}
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs font-mono text-gray-600">{card.code}</p>
                    <p
                      className={`text-sm mt-1 ${
                        card.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {card.status}
                    </p>
                  </div>
                  {card.expiryDate && (
                    <p className="text-xs text-gray-500 mb-4">
                      Expires: {formatDate(card.expiryDate)}
                    </p>
                  )}
                  <div className="flex space-x-2">
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => {
                        setSelectedCard(card);
                        fetchTransactions(card.id);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal for card details */}
        {selectedCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{selectedCard.merchant.businessName}</CardTitle>
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-primary-600">
                    {formatCurrency(selectedCard.balance, selectedCard.currency)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Remaining balance of {formatCurrency(selectedCard.value, selectedCard.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gift Card Code:</p>
                  <p className="font-mono font-semibold">{selectedCard.code}</p>
                </div>
                {selectedCard.qrCodeUrl && (
                  <div className="flex justify-center p-4 bg-gray-50 rounded">
                    <QRCodeSVG value={selectedCard.code} size={200} />
                  </div>
                )}
                <div className="space-y-4">
                  {showTransactions && transactions.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Transaction History</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {transactions.map((tx) => (
                          <div
                            key={tx.id}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm"
                          >
                            <div>
                              <p className="font-medium">{tx.type}</p>
                              <p className="text-xs text-gray-500">
                                {formatDateTime(tx.createdAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p
                                className={`font-semibold ${
                                  tx.type === 'PURCHASE'
                                    ? 'text-green-600'
                                    : tx.type === 'REDEMPTION'
                                    ? 'text-red-600'
                                    : 'text-gray-600'
                                }`}
                              >
                                {tx.type === 'PURCHASE' ? '+' : '-'}
                                {formatCurrency(Number(tx.amount), selectedCard.currency)}
                              </p>
                              <p className="text-xs text-gray-500">
                                Balance: {formatCurrency(Number(tx.balanceAfter), selectedCard.currency)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Link href={`/redeem/${selectedCard.code}`} className="flex-1">
                      <Button className="w-full">Redeem</Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSelectedCard(null);
                        setShowTransactions(false);
                        setTransactions([]);
                      }}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

