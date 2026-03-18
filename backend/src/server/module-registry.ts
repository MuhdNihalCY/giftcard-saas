import { Express, Request, Response } from 'express';
import { env } from '../infrastructure/env';

const V = `/api/${env.API_VERSION}`;

// Route imports
import healthRoutes from '../routes/health.routes';
import authRoutes from '../routes/auth.routes';
import twoFactorRoutes from '../routes/two-factor.routes';
import deviceRoutes from '../routes/device.routes';
import giftCardRoutes from '../routes/giftcard.routes';
import giftCardShareRoutes from '../routes/giftcard-share.routes';
import giftCardProductRoutes from '../routes/giftcard-product.routes';
import uploadRoutes from '../routes/upload.routes';
import paymentRoutes from '../routes/payment.routes';
import deliveryRoutes from '../routes/delivery.routes';
import redemptionRoutes from '../routes/redemption.routes';
import analyticsRoutes from '../routes/analytics.routes';
import emailVerificationRoutes from '../routes/emailVerification.routes';
import passwordResetRoutes from '../routes/passwordReset.routes';
import communicationSettingsRoutes from '../routes/communicationSettings.routes';
import otpRoutes from '../routes/otp.routes';
import communicationLogRoutes from '../routes/communicationLog.routes';
import auditLogRoutes from '../routes/audit-log.routes';
import breakageRoutes from '../routes/breakage.routes';
import chargebackRoutes from '../routes/chargeback.routes';
import blacklistRoutes from '../routes/blacklist.routes';
import merchantPaymentGatewayRoutes from '../routes/merchant-payment-gateway.routes';
import payoutRoutes from '../routes/payout.routes';
import adminPayoutRoutes from '../routes/admin-payout.routes';
import featureFlagRoutes from '../routes/feature-flag.routes';
import adminUsersRoutes from '../routes/admin-users.routes';

const MODULE_ROUTES = [
  // Health
  { path: '/health', router: healthRoutes },
  { path: `${V}/health`, router: healthRoutes },

  // Auth
  { path: `${V}/auth`, router: authRoutes },
  { path: `${V}/auth/2fa`, router: twoFactorRoutes },
  { path: `${V}/auth/devices`, router: deviceRoutes },

  // Gift Cards
  { path: `${V}/gift-cards`, router: giftCardRoutes },
  { path: `${V}/gift-card-share`, router: giftCardShareRoutes },
  { path: `${V}/gift-card-products`, router: giftCardProductRoutes },

  // Payments
  { path: `${V}/payments`, router: paymentRoutes },
  { path: `${V}/merchant/payment-gateways`, router: merchantPaymentGatewayRoutes },

  // Delivery
  { path: `${V}/delivery`, router: deliveryRoutes },

  // Redemptions
  { path: `${V}/redemptions`, router: redemptionRoutes },

  // Analytics
  { path: `${V}/analytics`, router: analyticsRoutes },
  { path: `${V}/breakage`, router: breakageRoutes },
  { path: `${V}/chargebacks`, router: chargebackRoutes },

  // Notifications
  { path: `${V}/email-verification`, router: emailVerificationRoutes },
  { path: `${V}/password-reset`, router: passwordResetRoutes },
  { path: `${V}/otp`, router: otpRoutes },

  // Admin
  { path: `${V}/admin/communication-settings`, router: communicationSettingsRoutes },
  { path: `${V}/admin/communication-logs`, router: communicationLogRoutes },
  { path: `${V}/admin/audit-logs`, router: auditLogRoutes },
  { path: `${V}/admin/blacklist`, router: blacklistRoutes },
  { path: `${V}/admin/users`, router: adminUsersRoutes },
  { path: `${V}/feature-flags`, router: featureFlagRoutes },

  // Payouts
  { path: `${V}/payouts`, router: payoutRoutes },
  { path: `${V}/admin/payouts`, router: adminPayoutRoutes },

  // Upload
  { path: `${V}/upload`, router: uploadRoutes },
];

export function registerModules(app: Express): void {
  // API version root
  app.get(V, (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Gift Card SaaS API',
      version: env.API_VERSION,
    });
  });

  for (const { path, router } of MODULE_ROUTES) {
    app.use(path, router);
  }

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Route not found' },
    });
  });
}
