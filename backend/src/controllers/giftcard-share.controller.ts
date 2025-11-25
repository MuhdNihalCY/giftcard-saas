import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import giftCardShareService from '../services/giftcard-share.service';

export class GiftCardShareController {
  /**
   * Generate share token for a gift card
   */
  async generateShareToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { giftCardId } = req.params;
      const userId = req.user!.userId;
      const userEmail = req.user!.email;
      const { expiryHours } = req.body;

      const shareData = await giftCardShareService.generateShareToken(
        giftCardId,
        userId,
        userEmail,
        expiryHours || 24
      );

      res.json({
        success: true,
        data: shareData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get gift card by share token (public endpoint)
   */
  async getGiftCardByToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const giftCard = await giftCardShareService.getGiftCardByToken(token);

      res.json({
        success: true,
        data: {
          giftCard: {
            id: giftCard.id,
            code: giftCard.code,
            value: giftCard.value,
            balance: giftCard.balance,
            currency: giftCard.currency,
            status: giftCard.status,
            expiryDate: giftCard.expiryDate,
            merchant: giftCard.merchant,
            template: giftCard.template,
            product: giftCard.product,
            allowPartialRedemption: giftCard.allowPartialRedemption,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Revoke share token
   */
  async revokeShareToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { giftCardId } = req.params;
      const userId = req.user!.userId;
      const userEmail = req.user!.email;

      const result = await giftCardShareService.revokeShareToken(giftCardId, userId, userEmail);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get NFC data for gift card
   */
  async getNFCData(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { giftCardId } = req.params;
      const userId = req.user!.userId;
      const userEmail = req.user!.email;

      const nfcData = await giftCardShareService.getNFCData(giftCardId, userId, userEmail);

      res.json({
        success: true,
        data: nfcData,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new GiftCardShareController();

