import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import breakageService from '../services/breakage.service';

export class BreakageController {
  async getBreakageMetrics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.role === 'ADMIN' ? (req.query.merchantId as string) : req.user?.userId;
      
      if (!merchantId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: { message: 'Merchant ID required' },
        });
      }

      const metrics = await breakageService.getBreakageMetrics(merchantId!);
      
      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBreakageReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.role === 'ADMIN' ? (req.query.merchantId as string) : req.user?.userId;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const report = await breakageService.generateBreakageReport(merchantId, startDate, endDate);
      
      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  async getExpiredCardsReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.role === 'ADMIN' ? (req.query.merchantId as string) : req.user?.userId;
      const includeBreakage = req.query.includeBreakage === 'true';

      const report = await breakageService.getExpiredCardsReport(merchantId, includeBreakage);
      
      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new BreakageController();




