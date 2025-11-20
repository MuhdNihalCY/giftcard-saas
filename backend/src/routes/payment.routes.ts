import { Router } from 'express';
import paymentController from '../controllers/payment.controller';
import webhookController from '../controllers/webhook.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createPaymentSchema,
  confirmPaymentSchema,
  refundPaymentSchema,
} from '../validators/payment.validator';
import { env } from '../config/env';
import express from 'express';

const router = Router();

// Payment routes (require authentication)
router.post(
  '/create-intent',
  authenticate,
  validate(createPaymentSchema),
  paymentController.createPayment.bind(paymentController)
);

router.post(
  '/confirm',
  validate(confirmPaymentSchema),
  paymentController.confirmPayment.bind(paymentController)
);

router.get(
  '/',
  authenticate,
  paymentController.listPayments.bind(paymentController)
);

router.get(
  '/:id',
  authenticate,
  paymentController.getPayment.bind(paymentController)
);

router.post(
  '/:id/refund',
  authenticate,
  authorize('ADMIN', 'MERCHANT'),
  validate(refundPaymentSchema),
  paymentController.refundPayment.bind(paymentController)
);

// Webhook routes (no authentication, signature verification instead)
router.post(
  '/webhook/stripe',
  express.raw({ type: 'application/json' }),
  webhookController.stripeWebhook.bind(webhookController)
);

router.post(
  '/webhook/razorpay',
  express.json(),
  webhookController.razorpayWebhook.bind(webhookController)
);

export default router;

