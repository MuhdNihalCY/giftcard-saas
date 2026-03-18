import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import payoutService from '../services/payout.service';
import { PayoutStatus } from '@prisma/client';
import { PayoutRepository } from '../modules/payouts/payout.repository';

const payoutRepository = new PayoutRepository();

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
      const { totalPayouts, totalAmount, byStatus, recentPayouts } =
        await payoutRepository.getPayoutStats();

      res.json({
        success: true,
        data: {
          totalPayouts,
          totalAmount: Number(totalAmount._sum.amount || 0),
          byStatus: (byStatus as any[]).map((s: any) => ({
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






