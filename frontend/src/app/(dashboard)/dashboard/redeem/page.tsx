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
import { QRCode } from 'react-qr-code';

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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Redeem Gift Card</h1>
        <p className="text-gray-600 mt-1">Enter gift card code or scan QR code to redeem</p>
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
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Gift Card Valid</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Code:</span>
                      <span className="font-mono font-semibold">{giftCard.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Balance:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(giftCard.balance, giftCard.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-semibold text-green-600">{giftCard.status}</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
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
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    rows={3}
                    disabled={!giftCard}
                    {...register('notes')}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
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
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-4">
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
                <p className="text-xs text-gray-500 mt-4">
                  QR code will appear after validating a gift card
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">How to Redeem:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                  <li>Enter gift card code or scan QR code</li>
                  <li>Click "Validate Gift Card"</li>
                  <li>Enter redemption amount</li>
                  <li>Click "Redeem Gift Card"</li>
                  <li>Balance will be deducted automatically</li>
                </ol>
              </div>

              {giftCard && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Note:</strong> Partial redemption is{' '}
                    {giftCard.allowPartialRedemption ? (
                      <span className="text-green-600">allowed</span>
                    ) : (
                      <span className="text-red-600">not allowed</span>
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

