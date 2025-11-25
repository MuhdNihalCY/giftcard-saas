'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { Navigation } from '@/components/Navigation';
import { useToast } from '@/components/ui/ToastContainer';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { AmountSelector } from '@/components/AmountSelector';
import Image from 'next/image';

const purchaseSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  recipientEmail: z.string().email('Invalid email address').optional(),
  recipientName: z.string().optional(),
  customMessage: z.string().optional(),
  paymentMethod: z.enum(['STRIPE', 'PAYPAL', 'RAZORPAY', 'UPI']),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const toast = useToast();
  const productId = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(0); // Gift card value
  const [calculatedSalePrice, setCalculatedSalePrice] = useState<number>(0); // What customer pays

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      paymentMethod: 'STRIPE',
      recipientEmail: user?.email || '',
      amount: 0,
    },
  });

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Calculate sale price when amount changes
  useEffect(() => {
    if (selectedAmount > 0 && product) {
      setValue('amount', selectedAmount);
      
      // Calculate sale price
      let salePrice = selectedAmount;
      
      if (product.allowCustomAmount) {
        // Linear interpolation for custom amounts
        if (product.minSalePrice && product.maxSalePrice && product.minAmount && product.maxAmount) {
          const minSale = Number(product.minSalePrice);
          const maxSale = Number(product.maxSalePrice);
          const minVal = Number(product.minAmount);
          const maxVal = Number(product.maxAmount);
          
          if (maxVal > minVal) {
            const ratio = (selectedAmount - minVal) / (maxVal - minVal);
            salePrice = minSale + (maxSale - minSale) * ratio;
          } else {
            salePrice = minSale;
          }
        }
      } else if (product.fixedAmounts && product.fixedAmounts.length > 0) {
        // Get corresponding sale price from fixed amounts
        const index = product.fixedAmounts.indexOf(selectedAmount);
        if (index !== -1 && product.fixedSalePrices && product.fixedSalePrices.length > index) {
          salePrice = product.fixedSalePrices[index];
        }
      }
      
      setCalculatedSalePrice(salePrice);
    }
  }, [selectedAmount, product, setValue]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/gift-card-products/${productId}`);
      setProduct(response.data.data);
      // Set default amount
      if (response.data.data.fixedAmounts && response.data.data.fixedAmounts.length > 0) {
        setSelectedAmount(response.data.data.fixedAmounts[0]);
      } else if (response.data.data.minAmount) {
        setSelectedAmount(Number(response.data.data.minAmount));
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Product not found');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: PurchaseFormData) => {
    try {
      setIsProcessing(true);
      setError('');

      if (!product) {
        setError('Product not found');
        return;
      }

      // Validate amount
      if (product.allowCustomAmount) {
        const minAmount = Number(product.minAmount || 0);
        const maxAmount = Number(product.maxAmount || 0);
        if (data.amount < minAmount || data.amount > maxAmount) {
          setError(`Amount must be between ${formatCurrency(minAmount, product.currency)} and ${formatCurrency(maxAmount, product.currency)}`);
          return;
        }
      } else if (product.fixedAmounts && product.fixedAmounts.length > 0) {
        if (!product.fixedAmounts.includes(data.amount)) {
          setError(`Amount must be one of: ${product.fixedAmounts.map((a: number) => formatCurrency(a, product.currency)).join(', ')}`);
          return;
        }
      }

      // Create payment from product
      const paymentResponse = await api.post('/payments/from-product', {
        productId: product.id,
        amount: data.amount,
        currency: product.currency,
        paymentMethod: data.paymentMethod,
        recipientEmail: data.recipientEmail,
        recipientName: data.recipientName,
        customMessage: data.customMessage,
        returnUrl: `${window.location.origin}/purchase/${productId}/success`,
        cancelUrl: `${window.location.origin}/products/${productId}`,
      });

      const paymentData = paymentResponse.data.data;

      // Handle different payment methods
      if (data.paymentMethod === 'STRIPE' && paymentData.clientSecret) {
        router.push(`/purchase/${paymentData.payment.giftCardId}/payment?intent=${paymentData.payment.paymentIntentId}`);
      } else if (data.paymentMethod === 'PAYPAL' && paymentData.orderId) {
        const approvalUrl = paymentData.links?.find(
          (link: any) => link.rel === 'approve'
        )?.href;
        if (approvalUrl) {
          window.location.href = approvalUrl;
        }
      } else if (data.paymentMethod === 'RAZORPAY') {
        router.push(`/purchase/${paymentData.payment.giftCardId}/payment?orderId=${paymentData.orderId}`);
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

  if (!product) {
    return (
      <div className="min-h-screen bg-navy-900">
        <Navigation />
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <Button variant="gold" onClick={() => router.push('/browse')}>Browse Products</Button>
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
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image and Info */}
            <div>
              {product.image && (
                <div className="relative w-full h-96 mb-6 rounded-xl overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl">{product.name}</CardTitle>
                  {product.merchant.businessName && (
                    <p className="text-plum-300 mt-2">{product.merchant.businessName}</p>
                  )}
                </CardHeader>
                <CardContent>
                  {product.description && (
                    <p className="text-navy-200 mb-4 whitespace-pre-wrap">{product.description}</p>
                  )}
                  {product.category && (
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-plum-900/50 text-plum-300 rounded-full text-sm">
                        {product.category}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Purchase Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Purchase Gift Card</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <AmountSelector
                    value={selectedAmount}
                    onChange={setSelectedAmount}
                    minAmount={product.minAmount}
                    maxAmount={product.maxAmount}
                    minSalePrice={product.minSalePrice}
                    maxSalePrice={product.maxSalePrice}
                    fixedAmounts={product.fixedAmounts}
                    fixedSalePrices={product.fixedSalePrices}
                    allowCustomAmount={product.allowCustomAmount}
                    currency={product.currency}
                    error={errors.amount?.message}
                    showSalePrice={true}
                  />

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
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-serif font-semibold text-plum-300">You Pay:</span>
                        <span className="text-3xl font-serif font-bold bg-gold-gradient bg-clip-text text-transparent">
                          {selectedAmount > 0 ? formatCurrency(calculatedSalePrice, product.currency) : 'Select amount'}
                        </span>
                      </div>
                      {calculatedSalePrice < selectedAmount && selectedAmount > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-plum-200">Gift Card Value:</span>
                          <span className="text-lg font-semibold text-green-400">
                            {formatCurrency(selectedAmount, product.currency)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <Button type="submit" variant="gold" className="w-full text-lg py-4" isLoading={isProcessing} disabled={selectedAmount <= 0}>
                    Purchase Gift Card
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/purchase/bulk?productId=${product.id}`)}
                  >
                    Bulk Purchase (Multiple Recipients)
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

