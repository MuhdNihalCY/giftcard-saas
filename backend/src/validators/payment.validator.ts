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

export const createPaymentFromProductSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  amount: z.number().positive('Amount must be greater than 0'),
  currency: z.string().min(3).max(3).default('USD'),
  paymentMethod: z.enum(['STRIPE', 'PAYPAL', 'RAZORPAY', 'UPI']),
  recipientEmail: z.string().email().optional(),
  recipientName: z.string().optional(),
  customMessage: z.string().optional(),
  returnUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export const bulkPurchaseSchema = z.object({
  productId: z.string().uuid('Invalid product ID').optional(),
  merchantId: z.string().uuid('Invalid merchant ID').optional(),
  recipients: z.array(z.object({
    email: z.string().email('Invalid email address'),
    name: z.string().optional(),
    customMessage: z.string().optional(),
    amount: z.number().positive('Amount must be greater than 0'),
  })).min(1, 'At least one recipient is required').max(50, 'Maximum 50 recipients allowed'),
  currency: z.string().min(3).max(3).default('USD'),
  paymentMethod: z.enum(['STRIPE', 'PAYPAL', 'RAZORPAY', 'UPI']),
  returnUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
}).refine((data) => {
  // Either productId or merchantId must be provided
  return data.productId || data.merchantId;
}, {
  message: 'Either productId or merchantId is required',
  path: ['productId'],
});

