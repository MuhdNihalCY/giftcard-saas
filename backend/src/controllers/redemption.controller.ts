import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import redemptionService from '../services/redemption.service';

export class RedemptionController {
  async validateGiftCard(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await redemptionService.validateGiftCard(req.body);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async redeemGiftCard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user!.userId;
      const result = await redemptionService.redeemGiftCard({
        ...req.body,
        merchantId,
      });
      res.json({
        success: true,
        data: result,
        message: 'Gift card redeemed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getRedemption(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const redemption = await redemptionService.getById(id);
      res.json({
        success: true,
        data: redemption,
      });
    } catch (error) {
      next(error);
    }
  }

  async listRedemptions(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        giftCardId,
        merchantId,
        redemptionMethod,
        page,
        limit,
      } = req.query;
      const result = await redemptionService.list({
        giftCardId: giftCardId as string,
        merchantId: merchantId as string,
        redemptionMethod: redemptionMethod as any,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json({
        success: true,
        data: result.redemptions,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getGiftCardHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await redemptionService.getGiftCardHistory(id);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async checkBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.body;
      const result = await redemptionService.checkBalance(code);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactionHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await redemptionService.getTransactionHistory(id);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Redeem via QR code (from QR code data)
   */
  async redeemViaQR(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user!.userId;
      const { qrData, amount, location, notes } = req.body;

      // Parse QR code data
      let giftCardId: string | undefined;
      let code: string | undefined;

      try {
        const parsed = JSON.parse(qrData);
        giftCardId = parsed.id;
        code = parsed.code;
      } catch {
        // If not JSON, treat as code
        code = qrData;
      }

      const result = await redemptionService.redeemGiftCard({
        giftCardId,
        code,
        amount,
        merchantId,
        redemptionMethod: 'QR_CODE',
        location,
        notes,
      });

      res.json({
        success: true,
        data: result,
        message: 'Gift card redeemed successfully via QR code',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Redeem via link (public endpoint)
   */
  async redeemViaLink(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { code } = req.params;
      const { amount, merchantId, location, notes } = req.body;

      if (!merchantId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MERCHANT_ID_REQUIRED',
            message: 'Merchant ID is required for redemption',
          },
        });
      }

      const result = await redemptionService.redeemGiftCard({
        code,
        amount,
        merchantId,
        redemptionMethod: 'LINK',
        location,
        notes,
      });

      return res.json({
        success: true,
        data: result,
        message: 'Gift card redeemed successfully',
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default new RedemptionController();

