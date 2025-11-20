import { Request, Response, NextFunction } from 'express';
import analyticsService from '../services/analytics.service';

export class AnalyticsController {
  async getSalesAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { merchantId, startDate, endDate } = req.query;
      const result = await analyticsService.getSalesAnalytics({
        merchantId: merchantId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRedemptionAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { merchantId, startDate, endDate } = req.query;
      const result = await analyticsService.getRedemptionAnalytics({
        merchantId: merchantId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { merchantId, startDate, endDate } = req.query;
      const result = await analyticsService.getCustomerAnalytics({
        merchantId: merchantId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getGiftCardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { merchantId } = req.query;
      const result = await analyticsService.getGiftCardStats({
        merchantId: merchantId as string,
      });
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AnalyticsController();

