import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import paymentService from '../services/payment/payment.service';

export class PaymentController {
  async createPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user?.userId;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'];
      const result = await paymentService.createPayment({
        ...req.body,
        customerId,
        ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
        email: req.user?.email || req.body.email,
        userAgent: typeof userAgent === 'string' ? userAgent : undefined,
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
      const { giftCardId, customerId, status, paymentMethod, search, page, limit } = req.query;
      const result = await paymentService.list({
        giftCardId: giftCardId as string,
        customerId: customerId as string,
        status: status as any,
        paymentMethod: paymentMethod as any,
        search: search as string,
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

  async suggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      const suggestions = await paymentService.suggestions(q as string);
      res.json({ success: true, data: suggestions });
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
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'];
      const result = await paymentService.createPaymentFromProduct({
        ...req.body,
        customerId,
        ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
        email: req.user?.email || req.body.email,
        userAgent: typeof userAgent === 'string' ? userAgent : undefined,
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
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'];
      const result = await paymentService.bulkPurchase({
        ...req.body,
        customerId,
        ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
        email: req.user?.email || req.body.email,
        userAgent: typeof userAgent === 'string' ? userAgent : undefined,
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

