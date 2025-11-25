import { Router } from 'express';
import deliveryController from '../controllers/delivery.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { deliverGiftCardSchema, sendReminderSchema } from '../validators/delivery.validator';

const router = Router();

// All delivery routes require authentication
router.use(authenticate);

// Deliver gift card
router.post(
  '/deliver',
  authorize('ADMIN', 'MERCHANT'),
  validate(deliverGiftCardSchema),
  deliveryController.deliverGiftCard.bind(deliveryController)
);

// Send expiry reminder
router.post(
  '/reminder/:id',
  authorize('ADMIN', 'MERCHANT'),
  validate(sendReminderSchema),
  deliveryController.sendReminder.bind(deliveryController)
);

// Generate PDF (stream)
router.get(
  '/pdf/:id',
  deliveryController.generatePDF.bind(deliveryController)
);

// Generate and download PDF (save to file)
router.get(
  '/pdf/:id/download',
  deliveryController.downloadPDF.bind(deliveryController)
);

export default router;

