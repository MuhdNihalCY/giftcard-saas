import { z } from 'zod';

export const createGiftCardSchema = z.object({
  value: z.number().positive('Value must be greater than 0'),
  currency: z.string().optional().default('USD'),
  expiryDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
  templateId: z.string().uuid().optional(),
  customMessage: z.string().optional(),
  recipientEmail: z.string().email().optional(),
  recipientName: z.string().optional(),
  allowPartialRedemption: z.boolean().optional().default(true),
});

export const updateGiftCardSchema = z.object({
  value: z.number().positive().optional(),
  expiryDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
  customMessage: z.string().optional(),
  recipientEmail: z.string().email().optional(),
  recipientName: z.string().optional(),
  allowPartialRedemption: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'REDEEMED', 'EXPIRED', 'CANCELLED']).optional(),
});

export const bulkCreateGiftCardSchema = z.object({
  count: z.number().int().min(1).max(1000),
  value: z.number().positive('Value must be greater than 0'),
  currency: z.string().optional().default('USD'),
  expiryDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
  templateId: z.string().uuid().optional(),
});

export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  designData: z.object({
    colors: z.object({
      primary: z.string().optional(),
      secondary: z.string().optional(),
      background: z.string().optional(),
      text: z.string().optional(),
    }).optional(),
    images: z.object({
      logo: z.string().optional(),
      background: z.string().optional(),
    }).optional(),
    layout: z.string().optional(),
  }),
  isPublic: z.boolean().optional().default(false),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  designData: z.object({
    colors: z.object({
      primary: z.string().optional(),
      secondary: z.string().optional(),
      background: z.string().optional(),
      text: z.string().optional(),
    }).optional(),
    images: z.object({
      logo: z.string().optional(),
      background: z.string().optional(),
    }).optional(),
    layout: z.string().optional(),
  }).optional(),
  isPublic: z.boolean().optional(),
});

