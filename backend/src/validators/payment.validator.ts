import { z } from 'zod';

export const createPaymentSchema = z.object({
  giftCardId: z.string().uuid('Invalid gift card ID'),
  amount: z.number().positive('Amount must be greater than 0'),
  currency: z.string().min(3).max(3).default('USD'),
  paymentMethod: z.enum(['STRIPE', 'PAYPAL', 'RAZORPAY', 'UPI']),
  returnUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export const confirmPaymentSchema = z.object({
  paymentId: z.string().uuid('Invalid payment ID'),
  paymentMethod: z.enum(['STRIPE', 'PAYPAL', 'RAZORPAY', 'UPI']),
  paymentIntentId: z.string().optional(),
  orderId: z.string().optional(),
  paymentMethodId: z.string().optional(),
  signature: z.string().optional(),
});

export const refundPaymentSchema = z.object({
  amount: z.number().positive().optional(),
  reason: z.string().optional(),
});

