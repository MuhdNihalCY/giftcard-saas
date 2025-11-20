import { z } from 'zod';

export const deliverGiftCardSchema = z.object({
  giftCardId: z.string().uuid('Invalid gift card ID'),
  deliveryMethod: z.enum(['email', 'sms', 'both']),
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().optional(),
  recipientName: z.string().optional(),
  scheduleFor: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
});

export const sendReminderSchema = z.object({
  daysBeforeExpiry: z.number().int().min(1).max(30).optional().default(7),
});

