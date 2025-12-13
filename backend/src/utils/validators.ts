import { z } from 'zod';

/**
 * Common validation schemas
 */

export const uuidSchema = z.string().uuid('Invalid UUID format');

export const emailSchema = z.string().email('Invalid email format');

export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: 'Start date must be before end date',
});

export const amountSchema = z.number().positive('Amount must be positive').max(1000000, 'Amount exceeds maximum');

export const currencySchema = z.string().length(3, 'Currency must be 3 characters').toUpperCase();

export const giftCardCodeSchema = z.string().min(10, 'Gift card code must be at least 10 characters').max(50);

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const businessNameSchema = z.string().min(2, 'Business name must be at least 2 characters').max(100);

export const customMessageSchema = z.string().max(500, 'Custom message must be less than 500 characters').optional();













