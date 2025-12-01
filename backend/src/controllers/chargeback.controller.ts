import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import chargebackService from '../services/chargeback.service';

export class ChargebackController {
  async handleChargeback(req: Request, res: Response, next: NextFunction) {
    try {
      // This endpoint is typically called by payment gateway webhooks
      const chargeback = await chargebackService.handleChargeback(req.body);
      
      res.json({
        success: true,
        data: chargeback,
        message: 'Chargeback processed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateChargebackStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, evidence } = req.body;

      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: { message: 'Admin access required' },
        });
      }

      const chargeback = await chargebackService.updateChargebackStatus(
        id,
        status,
        evidence
      );
      
      res.json({
        success: true,
        data: chargeback,
        message: 'Chargeback status updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async submitEvidence(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { evidence } = req.body;

      // Only merchant who owns the chargeback or admin can submit evidence
      const chargeback = await chargebackService.getChargebacks({
        paymentId: undefined,
        merchantId: req.user?.role === 'ADMIN' ? undefined : req.user?.userId,
        status: 'PENDING',
        page: 1,
        limit: 1,
      });

      const chargebackRecord = chargeback.chargebacks.find((cb) => cb.id === id);
      if (!chargebackRecord && req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: { message: 'Access denied' },
        });
      }

      const updated = await chargebackService.submitEvidence(id, evidence);
      
      res.json({
        success: true,
        data: updated,
        message: 'Evidence submitted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getChargebacks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.role === 'ADMIN' ? (req.query.merchantId as string) : req.user?.userId;
      const { paymentId, status, page, limit } = req.query;

      const result = await chargebackService.getChargebacks({
        merchantId,
        paymentId: paymentId as string,
        status: status as any,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      
      res.json({
        success: true,
        data: result.chargebacks,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getChargebackStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.role === 'ADMIN' ? (req.query.merchantId as string) : req.user?.userId;

      const statistics = await chargebackService.getChargebackStatistics(merchantId);
      
      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ChargebackController();




