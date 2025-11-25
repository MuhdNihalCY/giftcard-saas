import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import paymentService from '../services/payment/payment.service';

export class PaymentController {
  async createPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.userId;
      const result = await paymentService.createPayment({
        ...req.body,
        customerId,
      });
      res.status(201).json({
        success: true,
        data: result,
        message: 'Payment created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async confirmPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await paymentService.confirmPayment(req.body);
      res.json({
        success: true,
        data: payment,
        message: 'Payment confirmed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const payment = await paymentService.getById(id);
      res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async listPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const { giftCardId, customerId, status, paymentMethod, page, limit } = req.query;
      const result = await paymentService.list({
        giftCardId: giftCardId as string,
        customerId: customerId as string,
        status: status as any,
        paymentMethod: paymentMethod as any,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json({
        success: true,
        data: result.payments,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async refundPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await paymentService.refundPayment({
        paymentId: id,
        ...req.body,
      });
      res.json({
        success: true,
        data: result,
        message: 'Refund processed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async createPaymentFromProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.userId;
      const result = await paymentService.createPaymentFromProduct({
        ...req.body,
        customerId,
      });
      res.status(201).json({
        success: true,
        data: result,
        message: 'Payment created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async bulkPurchase(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.userId;
      const result = await paymentService.bulkPurchase({
        ...req.body,
        customerId,
      });
      res.status(201).json({
        success: true,
        data: result,
        message: 'Bulk purchase created successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PaymentController();

