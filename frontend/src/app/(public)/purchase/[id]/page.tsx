'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { Navigation } from '@/components/Navigation';
import { CardSkeleton } from '@/components/ui/Skeleton';

const purchaseSchema = z.object({
  recipientEmail: z.string().email('Invalid email address').optional(),
  recipientName: z.string().optional(),
  customMessage: z.string().optional(),
  paymentMethod: z.enum(['STRIPE', 'PAYPAL', 'RAZORPAY', 'UPI']),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;

export default function PurchasePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const giftCardId = params.id as string;
  const [giftCard, setGiftCard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [_paymentIntent, setPaymentIntent] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      paymentMethod: 'STRIPE',
      recipientEmail: user?.email || '',
    },
  });

  useEffect(() => {
    if (giftCardId) {
      fetchGiftCard();
    }
  }, [giftCardId]);

  const fetchGiftCard = async () => {
    try {
      const response = await api.get(`/gift-cards/${giftCardId}`);
      setGiftCard(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Gift card not found');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: PurchaseFormData) => {
    try {
      setIsProcessing(true);
      setError('');

      // Create payment intent
      const paymentResponse = await api.post('/payments/create-intent', {
        giftCardId,
        amount: Number(giftCard.value),
        currency: giftCard.currency,
        paymentMethod: data.paymentMethod,
        returnUrl: `${window.location.origin}/purchase/${giftCardId}/success`,
        cancelUrl: `${window.location.origin}/purchase/${giftCardId}`,
      });

      setPaymentIntent(paymentResponse.data.data);

      // Handle different payment methods
      if (data.paymentMethod === 'STRIPE' && paymentResponse.data.data.clientSecret) {
        // Redirect to Stripe checkout or handle client-side
        // For now, we'll show a message
        router.push(`/purchase/${giftCardId}/payment?intent=${paymentResponse.data.data.payment.paymentIntentId}`);
      } else if (data.paymentMethod === 'PAYPAL' && paymentResponse.data.data.orderId) {
        // Redirect to PayPal
        const approvalUrl = paymentResponse.data.data.links?.find(
          (link: any) => link.rel === 'approve'
        )?.href;
        if (approvalUrl) {
          window.location.href = approvalUrl;
        }
      } else if (data.paymentMethod === 'RAZORPAY') {
        // Handle Razorpay payment
        router.push(`/purchase/${giftCardId}/payment?orderId=${paymentResponse.data.data.orderId}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Payment initialization failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-900">
        <Navigation />
        <div className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!giftCard) {
    return (
      <div className="min-h-screen bg-navy-900">
        <Navigation />
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <Button variant="gold" onClick={() => router.push('/browse')}>Browse Gift Cards</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900">
      <Navigation />
      <div className="py-16 px-4 sm:px-6 lg:px-8 page-transition">
        <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-serif font-bold text-plum-300 mb-4 text-center">
          Purchase Gift Card
        </h1>
        <p className="text-center text-navy-200 mb-12">Complete your purchase</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Gift Card Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-plum-300 mb-1">Merchant</p>
                  <p className="text-xl font-serif font-semibold text-navy-50">{giftCard.merchant.businessName}</p>
                </div>
                <div>
                  <p className="text-sm text-plum-300 mb-1">Value</p>
                  <p className="text-4xl font-serif font-bold bg-gold-gradient bg-clip-text text-transparent">
                    {formatCurrency(Number(giftCard.value), giftCard.currency)}
                  </p>
                </div>
                {giftCard.expiryDate && (
                  <div>
                    <p className="text-sm text-plum-300 mb-1">Expires</p>
                    <p className="text-base text-navy-100">{new Date(giftCard.expiryDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Purchase Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  label="Recipient Email (optional)"
                  type="email"
                  placeholder="recipient@example.com"
                  error={errors.recipientEmail?.message}
                  {...register('recipientEmail')}
                />
                <Input
                  label="Recipient Name (optional)"
                  type="text"
                  placeholder="John Doe"
                  error={errors.recipientName?.message}
                  {...register('recipientName')}
                />
                <Input
                  label="Custom Message (optional)"
                  type="text"
                  placeholder="Happy Birthday!"
                  error={errors.customMessage?.message}
                  {...register('customMessage')}
                />
                <div>
                  <label className="block text-sm font-medium text-plum-200 mb-2">
                    Payment Method
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 border-navy-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 bg-navy-800/50 text-navy-50"
                    {...register('paymentMethod')}
                  >
                    <option value="STRIPE" className="bg-navy-800">Stripe (Card, Apple Pay, Google Pay)</option>
                    <option value="PAYPAL" className="bg-navy-800">PayPal</option>
                    <option value="RAZORPAY" className="bg-navy-800">Razorpay (Cards, UPI, Wallets)</option>
                    <option value="UPI" className="bg-navy-800">UPI</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-navy-700">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xl font-serif font-semibold text-plum-300">Total:</span>
                    <span className="text-3xl font-serif font-bold bg-gold-gradient bg-clip-text text-transparent">
                      {formatCurrency(Number(giftCard.value), giftCard.currency)}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Trust Indicators */}
                <div className="flex items-center justify-center gap-6 py-4 text-sm text-plum-200">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                    </svg>
                    <span>Encrypted</span>
                  </div>
                </div>

                <Button type="submit" variant="gold" className="w-full text-lg py-4" isLoading={isProcessing}>
                  Purchase Gift Card
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}

