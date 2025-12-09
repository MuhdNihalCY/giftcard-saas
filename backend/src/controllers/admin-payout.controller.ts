import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import payoutService from '../services/payout.service';
import prisma from '../config/database';
import { PayoutStatus } from '@prisma/client';

export class AdminPayoutController {
  /**
   * List all payouts (admin only)
   */
  async listAllPayouts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { merchantId, status, page, limit } = req.query;

      const result = await payoutService.getAllPayouts({
        merchantId: merchantId as string,
        status: status as PayoutStatus,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json({
        success: true,
        data: result.payouts,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payout statistics (admin only)
   */
  async getPayoutStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const [totalPayouts, totalAmount, byStatus, recentPayouts] = await Promise.all([
        prisma.payout.count(),
        prisma.payout.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            status: PayoutStatus.COMPLETED,
          },
        }),
        prisma.payout.groupBy({
          by: ['status'],
          _count: {
            id: true,
          },
          _sum: {
            amount: true,
          },
        }),
        prisma.payout.findMany({
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            merchant: {
              select: {
                id: true,
                email: true,
                businessName: true,
              },
            },
          },
        }),
      ]);

      res.json({
        success: true,
        data: {
          totalPayouts,
          totalAmount: Number(totalAmount._sum.amount || 0),
          byStatus: byStatus.map((s) => ({
            status: s.status,
            count: s._count.id,
            amount: Number(s._sum.amount || 0),
          })),
          recentPayouts,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process payout manually (admin only)
   */
  async processPayout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const payout = await payoutService.processPayout({ payoutId: id });

      res.json({
        success: true,
        data: payout,
        message: 'Payout processed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retry failed payout (admin only)
   */
  async retryPayout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const payout = await payoutService.retryFailedPayout(id);

      res.json({
        success: true,
        data: payout,
        message: 'Payout retry initiated',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminPayoutController();

