'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { formatDateTime } from '@/lib/utils';
import { GiftCardSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastContainer';
import { GiftCardShare } from '@/components/GiftCardShare';
import logger from '@/lib/logger';
import type { Transaction } from '@/types/transaction';

interface GiftCard {
  id: string;
  code: string;
  value: number;
  balance: number;
  currency: string;
  status: string;
  expiryDate?: string;
  qrCodeUrl?: string;
  createdAt?: string;
  merchant: {
    businessName: string;
  };
}

export default function WalletPage() {
  const { user, isAuthenticated } = useAuthStore();
  const toast = useToast();
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showTransactions, setShowTransactions] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'redeemed'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'balance' | 'date'>('date');
  const [sharingCardId, setSharingCardId] = useState<string | null>(null);

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
      logger.error('Failed to fetch gift cards', { error });
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
      logger.error('Failed to fetch transactions', { error, giftCardId });
    }
  };

  // Filter and sort gift cards - must be before any conditional returns (Rules of Hooks)
  const filteredAndSortedCards = useMemo(() => {
    let filtered = [...giftCards];

    // Filter by status
    if (filter === 'active') {
      filtered = filtered.filter(card => card.status === 'ACTIVE');
    } else if (filter === 'expired') {
      filtered = filtered.filter(card => card.status === 'EXPIRED');
    } else if (filter === 'redeemed') {
      filtered = filtered.filter(card => card.balance === 0);
    }

    // Sort
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.merchant.businessName.localeCompare(b.merchant.businessName));
        break;
      case 'value':
        filtered.sort((a, b) => b.value - a.value);
        break;
      case 'balance':
        filtered.sort((a, b) => b.balance - a.balance);
        break;
      case 'date':
      default:
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
    }

    return filtered;
  }, [giftCards, filter, sortBy]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <GiftCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="page-transition">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-plum-300">My Gift Card Wallet</h1>
        <p className="text-navy-200 mt-2 text-lg">Manage and redeem your gift cards</p>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filter === 'all' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'active' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
          >
            Active
          </Button>
          <Button
            variant={filter === 'expired' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setFilter('expired')}
          >
            Expired
          </Button>
          <Button
            variant={filter === 'redeemed' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setFilter('redeemed')}
          >
            Redeemed
          </Button>
        </div>
        <div className="sm:ml-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'code' | 'balance' | 'expiryDate' | 'createdAt')}
            className="px-4 py-2 bg-navy-800/50 border-2 border-plum-500/30 rounded-lg text-navy-50 focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="date" className="bg-navy-800">Newest First</option>
            <option value="name" className="bg-navy-800">Name (A-Z)</option>
            <option value="value" className="bg-navy-800">Highest Value</option>
            <option value="balance" className="bg-navy-800">Highest Balance</option>
          </select>
        </div>
      </div>

      {filteredAndSortedCards.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-2xl font-serif font-semibold text-plum-300 mb-2">
              {giftCards.length === 0 ? 'No gift cards yet' : 'No cards match your filter'}
            </h3>
            <p className="text-plum-200 mb-6">
              {giftCards.length === 0
                ? 'Start building your collection of gift cards'
                : 'Try adjusting your filters'}
            </p>
            <Link href="/browse">
              <Button variant="gold">Browse Gift Cards</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedCards.map((card) => (
            <Card
              key={card.id}
              className="cursor-pointer hover:shadow-gold-glow-sm transition-all duration-300 hover:scale-105"
            >
              <CardHeader>
                <CardTitle className="text-xl">{card.merchant.businessName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-3xl font-serif font-bold bg-gold-gradient bg-clip-text text-transparent">
                    {formatCurrency(card.balance, card.currency)}
                  </p>
                  <p className="text-sm text-plum-300">
                    of {formatCurrency(card.value, card.currency)}
                  </p>
                </div>
                <div className="mb-4">
                  <p className="text-xs font-mono text-plum-200">{card.code}</p>
                  <p
                    className={`text-sm mt-1 font-semibold ${
                      card.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {card.status}
                  </p>
                </div>
                {card.expiryDate && (
                  <p className="text-xs text-plum-300 mb-4">
                    Expires: {formatDate(card.expiryDate)}
                  </p>
                )}
                <div className="flex flex-col gap-2">
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
                    {card.status === 'ACTIVE' && card.balance > 0 && (
                      <Link href={`/redeem/${card.code}`} className="flex-1">
                        <Button variant="gold" className="w-full">
                          Redeem
                        </Button>
                      </Link>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSharingCardId(card.id)}
                    className="w-full"
                  >
                    Share Gift Card
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal for card details */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">{selectedCard.merchant.businessName}</CardTitle>
                <button
                  onClick={() => {
                    setSelectedCard(null);
                    setShowTransactions(false);
                    setTransactions([]);
                  }}
                  className="text-plum-300 hover:text-gold-400 transition-colors p-1"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-4xl font-serif font-bold bg-gold-gradient bg-clip-text text-transparent">
                  {formatCurrency(selectedCard.balance, selectedCard.currency)}
                </p>
                <p className="text-sm text-plum-300">
                  Remaining balance of {formatCurrency(selectedCard.value, selectedCard.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-plum-200 mb-1">Gift Card Code:</p>
                <p className="font-mono font-semibold text-navy-50">{selectedCard.code}</p>
              </div>
              {selectedCard.qrCodeUrl && (
                <div className="flex justify-center p-4 bg-navy-800/50 rounded-lg border border-navy-700">
                  <QRCodeSVG value={selectedCard.code} size={200} />
                </div>
              )}
              <div className="space-y-4">
                {showTransactions && transactions.length > 0 && (
                  <div className="border-t border-navy-700 pt-4">
                    <h4 className="font-serif font-semibold text-plum-300 mb-3">Transaction History</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex justify-between items-center p-3 bg-navy-800/50 rounded-lg text-sm border border-navy-700"
                        >
                          <div>
                            <p className="font-medium text-navy-50">{tx.type}</p>
                            <p className="text-xs text-plum-300">
                              {formatDateTime(tx.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-semibold ${
                                tx.type === 'PURCHASE'
                                  ? 'text-green-400'
                                  : tx.type === 'REDEMPTION'
                                  ? 'text-red-400'
                                  : 'text-plum-300'
                              }`}
                            >
                              {tx.type === 'PURCHASE' ? '+' : '-'}
                              {formatCurrency(Number(tx.amount), selectedCard.currency)}
                            </p>
                            <p className="text-xs text-plum-300">
                              Balance: {formatCurrency(Number(tx.balanceAfter), selectedCard.currency)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex space-x-2 pt-4 border-t border-navy-700">
                  {selectedCard.status === 'ACTIVE' && selectedCard.balance > 0 && (
                    <Link href={`/redeem/${selectedCard.code}`} className="flex-1">
                      <Button variant="gold" className="w-full">Redeem</Button>
                    </Link>
                  )}
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

      {/* Share Modal */}
      {sharingCardId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="max-w-lg w-full">
            <GiftCardShare
              giftCardId={sharingCardId}
              onClose={() => setSharingCardId(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

