'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import QRCode from 'react-qr-code';

const redeemSchema = z.object({
  code: z.string().min(1, 'Gift card code is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  location: z.string().optional(),
  notes: z.string().optional(),
});

type RedeemFormData = z.infer<typeof redeemSchema>;

export default function RedeemPage() {
  const { user } = useAuthStore();
  const [giftCard, setGiftCard] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [qrData, setQrData] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RedeemFormData>({
    resolver: zodResolver(redeemSchema),
  });

  const code = watch('code');

  const validateGiftCard = async (code: string) => {
    try {
      setIsValidating(true);
      setError('');
      setGiftCard(null);

      const response = await api.post('/redemptions/validate', { code });
      const giftCardData = response.data.data.giftCard;
      setGiftCard(giftCardData);

      // Set default amount to full balance
      setValue('amount', giftCardData.balance);

      // Generate QR code data
      setQrData(JSON.stringify({ code: giftCardData.code, id: giftCardData.id }));
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid gift card code');
      setGiftCard(null);
    } finally {
      setIsValidating(false);
    }
  };

  const onSubmit = async (data: RedeemFormData) => {
    try {
      setIsRedeeming(true);
      setError('');
      setSuccess('');

      if (!giftCard) {
        setError('Please validate the gift card first');
        return;
      }

      if (!user || !user.id) {
        setError('You must be logged in to redeem gift cards');
        return;
      }

      if (data.amount > giftCard.balance) {
        setError(`Amount cannot exceed balance of ${formatCurrency(giftCard.balance, giftCard.currency)}`);
        return;
      }

      // Redeem via QR code if we have the data
      // Merchant ID is automatically taken from authenticated user
      const response = await api.post('/redemptions/redeem/qr', {
        qrData: qrData || data.code,
        amount: data.amount,
        location: data.location,
        notes: data.notes,
      });

      setSuccess(
        `Successfully redeemed ${formatCurrency(data.amount, giftCard.currency)}! New balance: ${formatCurrency(response.data.data.giftCard.balance, giftCard.currency)}`
      );

      // Refresh gift card data
      await validateGiftCard(data.code);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Redemption failed');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="page-transition">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-plum-300">Redeem Gift Card</h1>
        <p className="text-navy-200 mt-2 text-lg">Enter gift card code or scan QR code to redeem</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Enter Gift Card Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input
                  label="Gift Card Code"
                  placeholder="GIFT-XXXX-XXXX-XXXX"
                  error={errors.code?.message}
                  {...register('code')}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={() => code && validateGiftCard(code)}
                  isLoading={isValidating}
                >
                  Validate Gift Card
                </Button>
              </div>

              {giftCard && (
                <div className="p-6 bg-green-900/20 border border-green-500/30 rounded-xl">
                  <h3 className="font-serif font-semibold text-green-400 mb-4">Gift Card Valid</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-navy-700">
                      <span className="text-plum-200">Code:</span>
                      <span className="font-mono font-semibold text-navy-50">{giftCard.code}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-navy-700">
                      <span className="text-plum-200">Balance:</span>
                      <span className="font-serif font-bold text-2xl bg-gold-gradient bg-clip-text text-transparent">
                        {formatCurrency(giftCard.balance, giftCard.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-plum-200">Status:</span>
                      <span className="font-semibold text-green-400">{giftCard.status}</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-900/30 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Redemption Amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={giftCard?.balance || 0}
                  error={errors.amount?.message}
                  disabled={!giftCard}
                  {...register('amount', { valueAsNumber: true })}
                />

                <Input
                  label="Location (Optional)"
                  placeholder="Store location"
                  error={errors.location?.message}
                  disabled={!giftCard}
                  {...register('location')}
                />

                <div>
                  <label className="block text-sm font-medium text-plum-200 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-plum-500/30 rounded-lg text-navy-50 bg-navy-800/50 placeholder-plum-300 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                    rows={3}
                    disabled={!giftCard}
                    {...register('notes')}
                  />
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  className="w-full text-lg py-4"
                  isLoading={isRedeeming}
                  disabled={!giftCard || isRedeeming}
                >
                  Redeem Gift Card
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>QR Code Scanner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-6 bg-navy-800/50 rounded-lg text-center border border-navy-700">
                <p className="text-sm text-plum-200 mb-4">
                  Scan QR code from customer's gift card
                </p>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <QRCode
                    value={qrData || 'Scan QR code to redeem'}
                    size={200}
                    level="H"
                    fgColor="#000000"
                    bgColor="#FFFFFF"
                  />
                </div>
                <p className="text-xs text-plum-300 mt-4">
                  QR code will appear after validating a gift card
                </p>
              </div>

              <div className="p-6 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <h4 className="font-serif font-semibold text-plum-300 mb-3">How to Redeem:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-plum-200">
                  <li>Enter gift card code or scan QR code</li>
                  <li>Click "Validate Gift Card"</li>
                  <li>Enter redemption amount</li>
                  <li>Click "Redeem Gift Card"</li>
                  <li>Balance will be deducted automatically</li>
                </ol>
              </div>

              {giftCard && (
                <div className="p-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-plum-200">
                    <strong className="text-gold-400">Note:</strong> Partial redemption is{' '}
                    {giftCard.allowPartialRedemption ? (
                      <span className="text-green-400">allowed</span>
                    ) : (
                      <span className="text-red-400">not allowed</span>
                    )}
                    . You can only redeem the full balance.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

