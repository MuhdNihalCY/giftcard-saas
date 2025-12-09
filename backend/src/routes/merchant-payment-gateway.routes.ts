import { Router } from 'express';
import merchantPaymentGatewayController from '../controllers/merchant-payment-gateway.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// All routes require authentication and merchant/admin role
router.use(authenticate);
router.use(authorize('ADMIN', 'MERCHANT'));

// Create gateway configuration schema
const createGatewaySchema = z.object({
  body: z.object({
    gatewayType: z.enum(['STRIPE', 'PAYPAL', 'RAZORPAY', 'UPI']),
    credentials: z.object({
      apiKey: z.string().optional(),
      secretKey: z.string().optional(),
      publishableKey: z.string().optional(),
      clientId: z.string().optional(),
      clientSecret: z.string().optional(),
      keyId: z.string().optional(),
      keySecret: z.string().optional(),
      mode: z.enum(['live', 'sandbox']).optional(),
    }).optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

// Update gateway configuration schema
const updateGatewaySchema = z.object({
  body: z.object({
    credentials: z.object({
      apiKey: z.string().optional(),
      secretKey: z.string().optional(),
      publishableKey: z.string().optional(),
      clientId: z.string().optional(),
      clientSecret: z.string().optional(),
      keyId: z.string().optional(),
      keySecret: z.string().optional(),
      mode: z.enum(['live', 'sandbox']).optional(),
    }).optional(),
    isActive: z.boolean().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

// Connect Stripe Connect account
router.post(
  '/stripe/connect',
  merchantPaymentGatewayController.createStripeConnectAccount.bind(merchantPaymentGatewayController)
);

// Get Stripe Connect account link
router.get(
  '/stripe/connect-link',
  merchantPaymentGatewayController.getStripeConnectLink.bind(merchantPaymentGatewayController)
);

// Connect PayPal account
router.post(
  '/paypal/connect',
  validate(createGatewaySchema),
  merchantPaymentGatewayController.createPayPalAccount.bind(merchantPaymentGatewayController)
);

// List merchant payment gateways
router.get(
  '/',
  merchantPaymentGatewayController.listGateways.bind(merchantPaymentGatewayController)
);

// Get gateway by ID
router.get(
  '/:id',
  merchantPaymentGatewayController.getGateway.bind(merchantPaymentGatewayController)
);

// Update gateway configuration
router.put(
  '/:id',
  validate(updateGatewaySchema),
  merchantPaymentGatewayController.updateGateway.bind(merchantPaymentGatewayController)
);

// Verify gateway
router.post(
  '/:id/verify',
  merchantPaymentGatewayController.verifyGateway.bind(merchantPaymentGatewayController)
);

// Deactivate gateway
router.post(
  '/:id/deactivate',
  merchantPaymentGatewayController.deactivateGateway.bind(merchantPaymentGatewayController)
);

// Delete gateway
router.delete(
  '/:id',
  merchantPaymentGatewayController.deleteGateway.bind(merchantPaymentGatewayController)
);

export default router;

