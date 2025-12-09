import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export class ApiDocsController {
  /**
   * Get API documentation
   */
  async getApiDocs(req: Request, res: Response, next: NextFunction) {
    try {
      const baseUrl = `${req.protocol}://${req.get('host')}/api/${env.API_VERSION}`;

      const docs = {
        version: env.API_VERSION || '1.0.0',
        baseUrl,
        endpoints: {
          authentication: {
            'POST /auth/register': 'Register a new user',
            'POST /auth/login': 'Login user',
            'POST /auth/refresh': 'Refresh access token',
            'POST /auth/logout': 'Logout user',
            'POST /auth/verify-email': 'Verify email address',
            'POST /auth/resend-verification': 'Resend verification email',
          },
          giftCards: {
            'GET /gift-cards': 'List gift cards',
            'POST /gift-cards': 'Create gift card',
            'GET /gift-cards/:id': 'Get gift card details',
            'PUT /gift-cards/:id': 'Update gift card',
            'DELETE /gift-cards/:id': 'Delete gift card',
            'POST /gift-cards/bulk': 'Bulk create gift cards',
            'GET /gift-cards/:id/qr': 'Get QR code',
          },
          payments: {
            'POST /payments/create-intent': 'Create payment intent',
            'POST /payments/confirm': 'Confirm payment',
            'POST /payments/from-product': 'Purchase from product',
            'POST /payments/bulk-purchase': 'Bulk purchase',
            'POST /payments/:id/refund': 'Process refund',
            'GET /payments': 'List payments',
          },
          redemptions: {
            'POST /redemptions/validate': 'Validate gift card (public)',
            'POST /redemptions/check-balance': 'Check balance (public)',
            'POST /redemptions/redeem': 'Redeem gift card',
            'POST /redemptions/redeem/qr': 'Redeem via QR code',
            'POST /redemptions/redeem/:code': 'Redeem via link (public)',
            'GET /redemptions': 'List redemptions',
          },
          analytics: {
            'GET /analytics/sales': 'Get sales analytics',
            'GET /analytics/redemptions': 'Get redemption analytics',
            'GET /analytics/customers': 'Get customer analytics',
            'GET /analytics/gift-cards': 'Get gift card analytics',
            'GET /analytics/breakage': 'Get breakage analytics',
          },
          admin: {
            'GET /admin/blacklist': 'List blacklist entries',
            'POST /admin/blacklist': 'Add blacklist entry',
            'PUT /admin/blacklist/:id': 'Update blacklist entry',
            'DELETE /admin/blacklist/:id': 'Remove blacklist entry',
            'GET /admin/audit-logs': 'List audit logs',
            'GET /admin/communication-settings': 'Get communication settings',
            'PUT /admin/communication-settings': 'Update communication settings',
          },
          health: {
            'GET /health': 'Basic health check',
            'GET /health/detailed': 'Detailed health check',
            'GET /health/metrics': 'System metrics',
            'GET /health/status': 'System status',
          },
        },
        authentication: {
          type: 'Bearer Token (JWT)',
          header: 'Authorization: Bearer <token>',
        },
        rateLimiting: {
          default: '100 requests per 15 minutes',
          authenticated: '1000 requests per 15 minutes',
        },
        documentation: {
          swagger: `${baseUrl}/docs`,
          postman: `${baseUrl}/postman-collection.json`,
        },
      };

      res.json({
        success: true,
        data: docs,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ApiDocsController();






