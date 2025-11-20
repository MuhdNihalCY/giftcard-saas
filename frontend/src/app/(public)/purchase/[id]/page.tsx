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
  const { isAuthenticated, user } = useAuthStore();
  const giftCardId = params.id as string;
  const [giftCard, setGiftCard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!giftCard) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => router.push('/browse')}>Browse Gift Cards</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Purchase Gift Card
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Gift Card Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Merchant</p>
                  <p className="text-lg font-semibold">{giftCard.merchant.businessName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Value</p>
                  <p className="text-3xl font-bold text-primary-600">
                    {formatCurrency(Number(giftCard.value), giftCard.currency)}
                  </p>
                </div>
                {giftCard.expiryDate && (
                  <div>
                    <p className="text-sm text-gray-600">Expires</p>
                    <p className="text-base">{new Date(giftCard.expiryDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Purchase Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    {...register('paymentMethod')}
                  >
                    <option value="STRIPE">Stripe (Card, Apple Pay, Google Pay)</option>
                    <option value="PAYPAL">PayPal</option>
                    <option value="RAZORPAY">Razorpay (Cards, UPI, Wallets)</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {formatCurrency(Number(giftCard.value), giftCard.currency)}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" isLoading={isProcessing}>
                  Proceed to Payment
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

