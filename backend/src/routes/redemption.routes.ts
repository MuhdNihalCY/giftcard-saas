import { Router } from 'express';
import redemptionController from '../controllers/redemption.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  validateGiftCardSchema,
  redeemGiftCardSchema,
  redeemViaQRSchema,
  redeemViaLinkSchema,
  checkBalanceSchema,
} from '../validators/redemption.validator';
import { env } from '../config/env';

const router = Router();

// Public endpoints
router.post(
  '/validate',
  validate(validateGiftCardSchema),
  redemptionController.validateGiftCard.bind(redemptionController)
);

router.post(
  '/check-balance',
  validate(checkBalanceSchema),
  redemptionController.checkBalance.bind(redemptionController)
);

router.post(
  '/redeem/:code',
  validate(redeemViaLinkSchema),
  redemptionController.redeemViaLink.bind(redemptionController)
);

// Authenticated endpoints
router.post(
  '/redeem',
  authenticate,
  authorize('ADMIN', 'MERCHANT'),
  validate(redeemGiftCardSchema),
  redemptionController.redeemGiftCard.bind(redemptionController)
);

router.post(
  '/redeem/qr',
  authenticate,
  authorize('ADMIN', 'MERCHANT'),
  validate(redeemViaQRSchema),
  redemptionController.redeemViaQR.bind(redemptionController)
);

router.get(
  '/',
  authenticate,
  redemptionController.listRedemptions.bind(redemptionController)
);

router.get(
  '/:id',
  authenticate,
  redemptionController.getRedemption.bind(redemptionController)
);

router.get(
  '/gift-card/:id/history',
  authenticate,
  redemptionController.getGiftCardHistory.bind(redemptionController)
);

router.get(
  '/gift-card/:id/transactions',
  authenticate,
  redemptionController.getTransactionHistory.bind(redemptionController)
);

export default router;

