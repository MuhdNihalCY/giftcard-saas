'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { Navigation } from '@/components/Navigation';
import { RecipientForm, Recipient } from '@/components/RecipientForm';
import { AmountSelector } from '@/components/AmountSelector';

const bulkPurchaseSchema = z.object({
  paymentMethod: z.enum(['STRIPE', 'PAYPAL', 'RAZORPAY', 'UPI']),
}).refine((_data) => true, {
  message: 'At least one recipient is required',
});

type BulkPurchaseFormData = z.infer<typeof bulkPurchaseSchema>;

export default function BulkPurchasePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const productId = searchParams?.get('productId');
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([
    {
      email: '',
      name: '',
      customMessage: '',
      amount: 0,
    },
  ]);
  const [defaultAmount, setDefaultAmount] = useState<number>(0);

  const {
    register,
    handleSubmit,
  } = useForm<BulkPurchaseFormData>({
    resolver: zodResolver(bulkPurchaseSchema),
    defaultValues: {
      paymentMethod: 'STRIPE',
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/purchase/bulk' + (productId ? `?productId=${productId}` : ''));
      return;
    }

    if (productId) {
      fetchProduct();
    } else {
      setIsLoading(false);
    }
  }, [productId, isAuthenticated, router]);

  useEffect(() => {
    if (product) {
      // Set default amount
      if (product.fixedAmounts && product.fixedAmounts.length > 0) {
        const defaultAmt = product.fixedAmounts[0];
        setDefaultAmount(defaultAmt);
        setRecipients([{
          email: '',
          name: '',
          customMessage: '',
          amount: defaultAmt,
        }]);
      } else if (product.minAmount) {
        const defaultAmt = Number(product.minAmount);
        setDefaultAmount(defaultAmt);
        setRecipients([{
          email: '',
          name: '',
          customMessage: '',
          amount: defaultAmt,
        }]);
      }
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/gift-card-products/${productId}`);
      setProduct(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Product not found');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate sale price for a gift card value
  const calculateSalePrice = (giftCardValue: number): number => {
    if (!product) return giftCardValue;
    
    if (product.allowCustomAmount) {
      // Linear interpolation for custom amounts
      if (product.minSalePrice && product.maxSalePrice && product.minAmount && product.maxAmount) {
        const minSale = Number(product.minSalePrice);
        const maxSale = Number(product.maxSalePrice);
        const minVal = Number(product.minAmount);
        const maxVal = Number(product.maxAmount);
        
        if (maxVal > minVal) {
          const ratio = (giftCardValue - minVal) / (maxVal - minVal);
          return minSale + (maxSale - minSale) * ratio;
        }
        return minSale;
      }
    } else if (product.fixedAmounts && product.fixedAmounts.length > 0) {
      // Get corresponding sale price from fixed amounts
      const index = product.fixedAmounts.indexOf(giftCardValue);
      if (index !== -1 && product.fixedSalePrices && product.fixedSalePrices.length > index) {
        return product.fixedSalePrices[index];
      }
    }
    
    return giftCardValue; // No discount
  };

  const calculateTotal = () => {
    // Calculate total sale price (what customer pays)
    return recipients.reduce((sum, recipient) => {
      const salePrice = calculateSalePrice(recipient.amount || 0);
      return sum + salePrice;
    }, 0);
  };
  
  const calculateTotalGiftCardValue = () => {
    // Calculate total gift card values (what customers get)
    return recipients.reduce((sum, recipient) => sum + (recipient.amount || 0), 0);
  };

  const validateRecipients = () => {
    if (recipients.length === 0) {
      return 'At least one recipient is required';
    }

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      if (!recipient.email || !recipient.email.includes('@')) {
        return `Recipient ${i + 1} has an invalid email`;
      }
      if (!recipient.amount || recipient.amount <= 0) {
        return `Recipient ${i + 1} has an invalid amount`;
      }

      // Validate amount against product if product exists
      if (product) {
        if (product.allowCustomAmount) {
          const minAmount = Number(product.minAmount || 0);
          const maxAmount = Number(product.maxAmount || 0);
          if (recipient.amount < minAmount || recipient.amount > maxAmount) {
            return `Recipient ${i + 1} amount must be between ${formatCurrency(minAmount, product.currency)} and ${formatCurrency(maxAmount, product.currency)}`;
          }
        } else if (product.fixedAmounts && product.fixedAmounts.length > 0) {
          if (!product.fixedAmounts.includes(recipient.amount)) {
            return `Recipient ${i + 1} amount must be one of: ${product.fixedAmounts.map((a: number) => formatCurrency(a, product.currency)).join(', ')}`;
          }
        }
      }
    }

    return null;
  };

  const onSubmit = async (data: BulkPurchaseFormData) => {
    try {
      setIsProcessing(true);
      setError('');

      const validationError = validateRecipients();
      if (validationError) {
        setError(validationError);
        return;
      }

      // Create bulk purchase
      const bulkPurchaseResponse = await api.post('/payments/bulk-purchase', {
        productId: product?.id,
        recipients: recipients.map(r => ({
          email: r.email,
          name: r.name || undefined,
          customMessage: r.customMessage || undefined,
          amount: r.amount,
        })),
        currency: product?.currency || 'USD',
        paymentMethod: data.paymentMethod,
        returnUrl: `${window.location.origin}/purchase/bulk/success`,
        cancelUrl: `${window.location.origin}/purchase/bulk`,
      });

      const purchaseData = bulkPurchaseResponse.data.data;

      // Handle different payment methods
      if (data.paymentMethod === 'STRIPE' && purchaseData.clientSecret) {
        // For bulk purchases, we'll redirect to a success page after payment
        router.push(`/purchase/${purchaseData.payment.giftCardId}/payment?intent=${purchaseData.payment.paymentIntentId}&bulk=true`);
      } else if (data.paymentMethod === 'PAYPAL' && purchaseData.orderId) {
        const approvalUrl = purchaseData.links?.find(
          (link: any) => link.rel === 'approve'
        )?.href;
        if (approvalUrl) {
          window.location.href = approvalUrl;
        }
      } else if (data.paymentMethod === 'RAZORPAY') {
        router.push(`/purchase/${purchaseData.payment.giftCardId}/payment?orderId=${purchaseData.orderId}&bulk=true`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Bulk purchase failed');
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
            <Card>
              <CardContent className="py-12">
                <div className="text-center">Loading...</div>
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
            Bulk Purchase
          </h1>
          <p className="text-center text-navy-200 mb-12">Purchase multiple gift cards for different recipients</p>

          {product && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Product: {product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {product.description && (
                  <p className="text-navy-200">{product.description}</p>
                )}
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-2xl">Recipients</CardTitle>
              </CardHeader>
              <CardContent>
                <RecipientForm
                  recipients={recipients}
                  onChange={setRecipients}
                  defaultAmount={defaultAmount}
                  currency={product?.currency || 'USD'}
                />
              </CardContent>
            </Card>

            {product && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-2xl">Amount Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-plum-300 mb-4">
                    Set the amount for each recipient individually, or use the options below to set a default amount.
                  </p>
                  <AmountSelector
                    value={defaultAmount}
                    onChange={(amount) => {
                      setDefaultAmount(amount);
                      // Update all recipients with the new default amount
                      setRecipients(recipients.map(r => ({ ...r, amount })));
                    }}
                    minAmount={product.minAmount}
                    maxAmount={product.maxAmount}
                    minSalePrice={product.minSalePrice}
                    maxSalePrice={product.maxSalePrice}
                    fixedAmounts={product.fixedAmounts}
                    fixedSalePrices={product.fixedSalePrices}
                    allowCustomAmount={product.allowCustomAmount}
                    currency={product.currency}
                    showSalePrice={true}
                  />
                </CardContent>
              </Card>
            )}

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-2xl">Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-serif font-semibold text-plum-300">
                      You Pay ({recipients.length} gift card{recipients.length !== 1 ? 's' : ''}):
                    </span>
                    <span className="text-3xl font-serif font-bold bg-gold-gradient bg-clip-text text-transparent">
                      {formatCurrency(calculateTotal(), product?.currency || 'USD')}
                    </span>
                  </div>
                  {calculateTotal() < calculateTotalGiftCardValue() && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-plum-200">
                        Total Gift Card Value:
                      </span>
                      <span className="text-lg font-semibold text-green-400">
                        {formatCurrency(calculateTotalGiftCardValue(), product?.currency || 'USD')}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-plum-300">
                  Each recipient will receive their gift card via email after payment is confirmed.
                </p>
              </CardContent>
            </Card>

            {error && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                variant="gold"
                className="flex-1 text-lg py-4"
                isLoading={isProcessing}
                disabled={recipients.length === 0 || calculateTotal() <= 0}
              >
                Complete Purchase
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

