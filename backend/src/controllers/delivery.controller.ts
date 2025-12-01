import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import deliveryService from '../services/delivery/delivery.service';
import pdfService from '../services/pdf.service';
import giftCardService from '../services/giftcard.service';

export class DeliveryController {
  async deliverGiftCard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await deliveryService.deliverGiftCard(req.body);
      res.json({
        success: true,
        data: result,
        message: 'Gift card delivery initiated',
      });
    } catch (error) {
      next(error);
    }
  }

  async sendReminder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { daysBeforeExpiry } = req.body;
      const result = await deliveryService.sendExpiryReminder(
        id,
        daysBeforeExpiry || 7
      );
      res.json({
        success: true,
        data: result,
        message: 'Reminder sent successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async generatePDF(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const giftCard = await giftCardService.getById(id);

      const pdfBuffer = await pdfService.generateGiftCardPDF({
        code: giftCard.code,
        value: Number(giftCard.value),
        currency: giftCard.currency,
        qrCodeUrl: giftCard.qrCodeUrl || undefined,
        merchantName: giftCard.merchant.businessName || undefined,
        recipientName: giftCard.recipientName || undefined,
        customMessage: giftCard.customMessage || undefined,
        expiryDate: giftCard.expiryDate || undefined,
        template: giftCard.template || null,
      });

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="giftcard-${giftCard.code}.pdf"`
      );

      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  async downloadPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const giftCard = await giftCardService.getById(id);

      const pdfBuffer = await pdfService.generateGiftCardPDF({
        code: giftCard.code,
        value: Number(giftCard.value),
        currency: giftCard.currency,
        qrCodeUrl: giftCard.qrCodeUrl || undefined,
        merchantName: giftCard.merchant.businessName || undefined,
        recipientName: giftCard.recipientName || undefined,
        customMessage: giftCard.customMessage || undefined,
        expiryDate: giftCard.expiryDate || undefined,
        template: giftCard.template || null,
      });

      // Save to file and return URL
      const filename = `giftcard-${giftCard.code}-${Date.now()}.pdf`;
      const fileUrl = await pdfService.savePDFToFile(pdfBuffer, filename);

      res.json({
        success: true,
        data: {
          url: fileUrl,
          filename,
        },
        message: 'PDF generated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new DeliveryController();

