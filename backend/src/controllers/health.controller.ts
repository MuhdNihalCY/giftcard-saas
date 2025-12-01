import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { env } from '../config/env';
import logger from '../utils/logger';

export class HealthController {
  /**
   * Basic health check endpoint
   */
  async healthCheck(_req: Request, res: Response) {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
    });
  }

  /**
   * Detailed health check with database and services
   */
  async detailedHealthCheck(req: Request, res: Response, next: NextFunction) {
    try {
      const checks: Record<string, any> = {
        api: { status: 'healthy', timestamp: new Date().toISOString() },
        database: { status: 'unknown' },
        redis: { status: 'unknown' },
      };

      // Check database
      try {
        await prisma.$queryRaw`SELECT 1`;
        checks.database = {
          status: 'healthy',
          responseTime: Date.now(),
        };
      } catch (error: any) {
        checks.database = {
          status: 'unhealthy',
          error: error.message,
        };
      }

      // Check Redis (if configured)
      try {
        // Redis check would go here if Redis is used
        checks.redis = {
          status: 'not_configured',
          message: 'Redis not configured',
        };
      } catch (error: any) {
        checks.redis = {
          status: 'unhealthy',
          error: error.message,
        };
      }

      const overallStatus = Object.values(checks).every(
        (check) => check.status === 'healthy' || check.status === 'not_configured'
      )
        ? 'healthy'
        : 'degraded';

      res.status(overallStatus === 'healthy' ? 200 : 503).json({
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: env.NODE_ENV,
        version: env.API_VERSION || '1.0.0',
        checks,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * System metrics endpoint
   */
  async getMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const [
        totalUsers,
        totalMerchants,
        totalGiftCards,
        totalPayments,
        totalRedemptions,
        activeGiftCards,
        expiredGiftCards,
        totalRevenue,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'MERCHANT' } }),
        prisma.giftCard.count(),
        prisma.payment.count(),
        prisma.redemption.count(),
        prisma.giftCard.count({ where: { status: 'ACTIVE' } }),
        prisma.giftCard.count({ where: { status: 'EXPIRED' } }),
        prisma.payment.aggregate({
          _sum: { amount: true },
          where: { status: 'COMPLETED' },
        }),
      ]);

      res.json({
        success: true,
        data: {
          users: {
            total: totalUsers,
            merchants: totalMerchants,
            customers: totalUsers - totalMerchants,
          },
          giftCards: {
            total: totalGiftCards,
            active: activeGiftCards,
            expired: expiredGiftCards,
            redeemed: totalGiftCards - activeGiftCards - expiredGiftCards,
          },
          transactions: {
            payments: totalPayments,
            redemptions: totalRedemptions,
          },
          revenue: {
            total: Number(totalRevenue._sum.amount || 0),
            currency: 'USD',
          },
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * System status endpoint
   */
  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = {
        api: {
          status: 'operational',
          version: env.API_VERSION || '1.0.0',
          uptime: process.uptime(),
        },
        database: {
          status: 'unknown' as string,
        },
        services: {
          email: env.EMAIL_SERVICE ? 'configured' : 'not_configured',
          sms: env.SMS_SERVICE ? 'configured' : 'not_configured',
          stripe: env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured',
          paypal: env.PAYPAL_CLIENT_ID ? 'configured' : 'not_configured',
          razorpay: env.RAZORPAY_KEY_ID ? 'configured' : 'not_configured',
        },
        timestamp: new Date().toISOString(),
      };

      // Check database
      try {
        await prisma.$queryRaw`SELECT 1`;
        status.database.status = 'operational';
      } catch (error) {
        status.database.status = 'degraded';
      }

      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new HealthController();

