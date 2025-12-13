import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import payoutService from '../services/payout.service';
import payoutSettingsService from '../services/payout-settings.service';

export class PayoutController {
  /**
   * Get available balance for payout
   */
  async getAvailableBalance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.userId;
      if (!merchantId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const availableBalance = await payoutService.calculateAvailableBalance(merchantId);

      res.json({
        success: true,
        data: {
          availableBalance,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payout settings
   */
  async getPayoutSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.userId;
      if (!merchantId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const settings = await payoutSettingsService.getPayoutSettings(merchantId);

      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update payout settings
   */
  async updatePayoutSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.userId;
      if (!merchantId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const settings = await payoutSettingsService.updatePayoutSettings(
        merchantId,
        req.body
      );

      res.json({
        success: true,
        data: settings,
        message: 'Payout settings updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request payout
   */
  async requestPayout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.userId;
      if (!merchantId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { amount, method } = req.body;

      const payout = await payoutService.requestPayout({
        merchantId,
        amount,
        method,
      });

      res.status(201).json({
        success: true,
        data: payout,
        message: 'Payout requested successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List payouts
   */
  async listPayouts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.userId;
      if (!merchantId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { status, page, limit } = req.query;

      const result = await payoutService.getPayoutHistory(merchantId, {
        status: status as any,
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
   * Get payout by ID
   */
  async getPayout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.userId;
      if (!merchantId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const payout = await payoutService.getById(id);

      // Verify merchant owns this payout (unless admin)
      if (req.user?.role !== 'ADMIN' && payout.merchantId !== merchantId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Payout does not belong to merchant',
        });
      }

      res.json({
        success: true,
        data: payout,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PayoutController();






