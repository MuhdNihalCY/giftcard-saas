import { Router } from 'express';
import giftCardController from '../controllers/giftcard.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createGiftCardSchema,
  updateGiftCardSchema,
  bulkCreateGiftCardSchema,
  createTemplateSchema,
  updateTemplateSchema,
} from '../validators/giftcard.validator';

const router = Router();

// Gift Card Routes
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'MERCHANT'),
  validate(createGiftCardSchema),
  giftCardController.create.bind(giftCardController)
);

router.get(
  '/',
  authenticate,
  giftCardController.list.bind(giftCardController)
);

router.get(
  '/suggestions',
  authenticate,
  giftCardController.suggestions.bind(giftCardController)
);

// Template Routes - MUST be defined before /:id routes to avoid route conflicts
router.post(
  '/templates',
  authenticate,
  authorize('ADMIN', 'MERCHANT'),
  validate(createTemplateSchema),
  giftCardController.createTemplate.bind(giftCardController)
);

router.get(
  '/templates',
  giftCardController.listTemplates.bind(giftCardController)
);

router.get(
  '/templates/:id',
  giftCardController.getTemplateById.bind(giftCardController)
);

router.put(
  '/templates/:id',
  authenticate,
  authorize('ADMIN', 'MERCHANT'),
  validate(updateTemplateSchema),
  giftCardController.updateTemplate.bind(giftCardController)
);

router.delete(
  '/templates/:id',
  authenticate,
  authorize('ADMIN', 'MERCHANT'),
  giftCardController.deleteTemplate.bind(giftCardController)
);

// Gift Card specific routes - defined after templates to avoid conflicts
router.get(
  '/code/:code',
  giftCardController.getByCode.bind(giftCardController)
);

router.get(
  '/:id/qr',
  giftCardController.getQRCode.bind(giftCardController)
);

router.get(
  '/:id',
  giftCardController.getById.bind(giftCardController)
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'MERCHANT'),
  validate(updateGiftCardSchema),
  giftCardController.update.bind(giftCardController)
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'MERCHANT'),
  giftCardController.delete.bind(giftCardController)
);

router.post(
  '/bulk',
  authenticate,
  authorize('ADMIN', 'MERCHANT'),
  validate(bulkCreateGiftCardSchema),
  giftCardController.bulkCreate.bind(giftCardController)
);

export default router;

