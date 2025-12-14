import { Router } from 'express';
import giftCardProductController from '../controllers/giftcard-product.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createProductSchema,
  updateProductSchema,
} from '../validators/giftcard-product.validator';

const router = Router();

// Product Routes (Merchant)
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'MERCHANT'),
  validate(createProductSchema),
  giftCardProductController.create.bind(giftCardProductController)
);

router.get(
  '/',
  authenticate,
  giftCardProductController.list.bind(giftCardProductController)
);

router.get(
  '/suggestions',
  authenticate,
  giftCardProductController.suggestions.bind(giftCardProductController)
);

// Public product listing (no auth required)
router.get(
  '/public',
  giftCardProductController.listPublic.bind(giftCardProductController)
);

router.get(
  '/:id',
  giftCardProductController.getById.bind(giftCardProductController)
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'MERCHANT'),
  validate(updateProductSchema),
  giftCardProductController.update.bind(giftCardProductController)
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'MERCHANT'),
  giftCardProductController.delete.bind(giftCardProductController)
);

export default router;


