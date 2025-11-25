import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  minAmount: z.number().positive('Minimum gift card value must be greater than 0').optional(),
  maxAmount: z.number().positive('Maximum gift card value must be greater than 0').optional(),
  minSalePrice: z.number().positive('Minimum sale price must be greater than 0').optional(),
  maxSalePrice: z.number().positive('Maximum sale price must be greater than 0').optional(),
  allowCustomAmount: z.boolean().optional().default(false),
  fixedAmounts: z.array(z.number().positive()).optional(), // Gift card values
  fixedSalePrices: z.array(z.number().positive()).optional(), // Sale prices (corresponding to fixedAmounts)
  currency: z.string().optional().default('USD'),
  expiryDays: z.number().int().positive().optional(),
  templateId: z.string().uuid().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional().default(true),
  isPublic: z.boolean().optional().default(false),
}).refine((data) => {
  // If allowCustomAmount is true, minAmount and maxAmount are required
  if (data.allowCustomAmount && (!data.minAmount || !data.maxAmount)) {
    return false;
  }
  return true;
}, {
  message: 'Minimum and maximum amounts are required when custom amounts are allowed',
  path: ['minAmount'],
}).refine((data) => {
  // minAmount cannot be greater than maxAmount
  if (data.minAmount && data.maxAmount && data.minAmount > data.maxAmount) {
    return false;
  }
  return true;
}, {
  message: 'Minimum amount cannot be greater than maximum amount',
  path: ['minAmount'],
}).refine((data) => {
  // Fixed amounts must be within min/max range if specified
  if (data.fixedAmounts && data.fixedAmounts.length > 0) {
    if (data.minAmount) {
      for (const amount of data.fixedAmounts) {
        if (amount < data.minAmount) return false;
      }
    }
    if (data.maxAmount) {
      for (const amount of data.fixedAmounts) {
        if (amount > data.maxAmount) return false;
      }
    }
  }
  return true;
}, {
  message: 'All fixed amounts must be within the minimum and maximum range',
  path: ['fixedAmounts'],
}).refine((data) => {
  // If allowCustomAmount is true and sale prices are set, they must match the structure
  if (data.allowCustomAmount && data.minSalePrice && data.maxSalePrice && data.minAmount && data.maxAmount) {
    // Sale prices should be valid
    if (data.minSalePrice > data.maxSalePrice) return false;
  }
  return true;
}, {
  message: 'Minimum sale price cannot be greater than maximum sale price',
  path: ['minSalePrice'],
}).refine((data) => {
  // Fixed sale prices must match fixed amounts length if provided
  if (data.fixedSalePrices && data.fixedAmounts) {
    if (data.fixedSalePrices.length !== data.fixedAmounts.length) return false;
  }
  return true;
}, {
  message: 'Fixed sale prices must have the same length as fixed amounts',
  path: ['fixedSalePrices'],
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().optional(),
  minSalePrice: z.number().positive().optional(),
  maxSalePrice: z.number().positive().optional(),
  allowCustomAmount: z.boolean().optional(),
  fixedAmounts: z.array(z.number().positive()).optional(),
  fixedSalePrices: z.array(z.number().positive()).optional(),
  currency: z.string().optional(),
  expiryDays: z.number().int().positive().optional(),
  templateId: z.string().uuid().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
}).refine((data) => {
  // If allowCustomAmount is true, minAmount and maxAmount are required
  if (data.allowCustomAmount && (!data.minAmount || !data.maxAmount)) {
    return false;
  }
  return true;
}, {
  message: 'Minimum and maximum amounts are required when custom amounts are allowed',
  path: ['minAmount'],
}).refine((data) => {
  // minAmount cannot be greater than maxAmount
  if (data.minAmount && data.maxAmount && data.minAmount > data.maxAmount) {
    return false;
  }
  return true;
}, {
  message: 'Minimum amount cannot be greater than maximum amount',
  path: ['minAmount'],
}).refine((data) => {
  // If sale prices are provided, validate them
  if (data.minSalePrice && data.maxSalePrice && data.minSalePrice > data.maxSalePrice) {
    return false;
  }
  return true;
}, {
  message: 'Minimum sale price cannot be greater than maximum sale price',
  path: ['minSalePrice'],
});

