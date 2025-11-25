import express from 'express';
import giftCardShareController from '../controllers/giftcard-share.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Generate share token (authenticated)
router.post(
  '/:giftCardId/generate-token',
  authenticate,
  giftCardShareController.generateShareToken.bind(giftCardShareController)
);

// Get gift card by share token (public)
router.get(
  '/token/:token',
  giftCardShareController.getGiftCardByToken.bind(giftCardShareController)
);

// Revoke share token (authenticated)
router.delete(
  '/:giftCardId/revoke-token',
  authenticate,
  giftCardShareController.revokeShareToken.bind(giftCardShareController)
);

// Get NFC data (authenticated)
router.get(
  '/:giftCardId/nfc-data',
  authenticate,
  giftCardShareController.getNFCData.bind(giftCardShareController)
);

export default router;

