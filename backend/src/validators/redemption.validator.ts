import { z } from 'zod';

export const validateGiftCardSchema = z.object({
  code: z.string().min(1, 'Gift card code is required'),
});

export const redeemGiftCardSchema = z.object({
  giftCardId: z.string().uuid().optional(),
  code: z.string().optional(),
  amount: z.number().positive('Amount must be greater than 0'),
  redemptionMethod: z.enum(['QR_CODE', 'CODE_ENTRY', 'LINK', 'API']),
  location: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => data.giftCardId || data.code, {
  message: 'Either giftCardId or code must be provided',
});

export const redeemViaQRSchema = z.object({
  qrData: z.string().min(1, 'QR data is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const redeemViaLinkSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  merchantId: z.string().uuid('Merchant ID is required'),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const checkBalanceSchema = z.object({
  code: z.string().min(1, 'Gift card code is required'),
});

