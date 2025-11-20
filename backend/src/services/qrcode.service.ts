import QRCode from 'qrcode';
import { env } from '../config/env';

export class QRCodeService {
  /**
   * Generate QR code as data URL
   */
  async generateDataURL(data: string): Promise<string> {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 300,
        margin: 1,
      });
      return qrCodeDataURL;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate QR code as buffer (for saving to file)
   */
  async generateBuffer(data: string): Promise<Buffer> {
    try {
      const qrCodeBuffer = await QRCode.toBuffer(data, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 300,
        margin: 1,
      });
      return qrCodeBuffer;
    } catch (error) {
      throw new Error('Failed to generate QR code buffer');
    }
  }

  /**
   * Generate QR code data for gift card redemption
   */
  generateGiftCardData(giftCardId: string, code: string): string {
    return JSON.stringify({
      type: 'giftcard',
      id: giftCardId,
      code: code,
      url: `${env.FRONTEND_URL}/redeem/${code}`,
    });
  }
}

export default new QRCodeService();

