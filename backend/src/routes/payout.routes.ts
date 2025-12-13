import { Router } from 'express';
import payoutController from '../controllers/payout.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// Request payout schema
const requestPayoutSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    method: z.enum(['STRIPE_CONNECT', 'PAYPAL', 'BANK_TRANSFER']).optional(),
  }),
});

// Update payout settings schema
const updatePayoutSettingsSchema = z.object({
  body: z.object({
    payoutMethod: z.enum(['STRIPE_CONNECT', 'PAYPAL', 'BANK_TRANSFER']).optional(),
    payoutSchedule: z.enum(['IMMEDIATE', 'DAILY', 'WEEKLY', 'MONTHLY']).optional(),
    minimumPayoutAmount: z.number().positive().optional(),
    payoutAccountId: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

// All routes require authentication
router.use(authenticate);

// Get available balance
router.get(
  '/available-balance',
  authorize('ADMIN', 'MERCHANT'),
  payoutController.getAvailableBalance.bind(payoutController)
);

// Get payout settings
router.get(
  '/settings',
  authorize('ADMIN', 'MERCHANT'),
  payoutController.getPayoutSettings.bind(payoutController)
);

// Update payout settings
router.put(
  '/settings',
  authorize('ADMIN', 'MERCHANT'),
  validate(updatePayoutSettingsSchema),
  payoutController.updatePayoutSettings.bind(payoutController)
);

// Request payout
router.post(
  '/request',
  authorize('ADMIN', 'MERCHANT'),
  validate(requestPayoutSchema),
  payoutController.requestPayout.bind(payoutController)
);

// List payouts
router.get(
  '/',
  authorize('ADMIN', 'MERCHANT'),
  payoutController.listPayouts.bind(payoutController)
);

// Get payout by ID
router.get(
  '/:id',
  authorize('ADMIN', 'MERCHANT'),
  payoutController.getPayout.bind(payoutController)
);

export default router;






