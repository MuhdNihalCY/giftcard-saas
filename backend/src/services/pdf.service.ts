import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { ValidationError } from '../utils/errors';

export interface GiftCardPDFData {
  code: string;
  value: number;
  currency: string;
  qrCodeUrl?: string;
  merchantName?: string;
  recipientName?: string;
  customMessage?: string;
  expiryDate?: Date;
}

export class PDFService {
  /**
   * Generate gift card PDF
   */
  async generateGiftCardPDF(data: GiftCardPDFData): Promise<Buffer> {
    const {
      code,
      value,
      currency,
      qrCodeUrl,
      merchantName,
      recipientName: _recipientName,
      customMessage,
      expiryDate,
    } = data;

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: [400, 600],
          margin: 50,
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // Background
        doc.rect(0, 0, 400, 600).fill('#667eea');

        // White card area
        doc.rect(25, 25, 350, 550).fill('#ffffff').stroke('#e0e0e0');

        // Title
        doc.fontSize(24)
          .fillColor('#667eea')
          .text('🎁 Gift Card', 50, 60, { align: 'center', width: 300 });

        // Merchant name
        if (merchantName) {
          doc.fontSize(16)
            .fillColor('#333')
            .text(merchantName, 50, 120, { align: 'center', width: 300 });
        }

        // Value
        const formattedValue = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency,
        }).format(value);

        doc.fontSize(32)
          .fillColor('#667eea')
          .font('Helvetica-Bold')
          .text(formattedValue, 50, 180, { align: 'center', width: 300 });

        // Custom message
        if (customMessage) {
          doc.fontSize(12)
            .fillColor('#666')
            .font('Helvetica')
            .text(`"${customMessage}"`, 50, 240, {
              align: 'center',
              width: 300,
            });
        }

        // QR Code placeholder (would need to embed actual image)
        if (qrCodeUrl) {
          doc.fontSize(10)
            .fillColor('#999')
            .text('QR Code:', 50, 300, { align: 'center', width: 300 });
          doc.fontSize(8)
            .text('(QR code image would be embedded here)', 50, 320, {
              align: 'center',
              width: 300,
            });
        }

        // Gift card code
        doc.fontSize(18)
          .fillColor('#333')
          .font('Helvetica-Bold')
          .text('Gift Card Code:', 50, 400, { align: 'center', width: 300 });

        doc.fontSize(24)
          .fillColor('#667eea')
          .text(code, 50, 430, {
            align: 'center',
            width: 300,
            characterSpacing: 2,
          });

        // Expiry date
        if (expiryDate) {
          doc.fontSize(10)
            .fillColor('#999')
            .text(
              `Expires: ${new Date(expiryDate).toLocaleDateString()}`,
              50,
              480,
              { align: 'center', width: 300 }
            );
        }

        // Footer
        doc.fontSize(8)
          .fillColor('#999')
          .text(
            'Present this card at checkout or use the code online',
            50,
            530,
            { align: 'center', width: 300 }
          );

        doc.end();
      } catch (error: any) {
        reject(new ValidationError(`PDF generation failed: ${error.message}`));
      }
    });
  }

  /**
   * Save PDF to file
   */
  async savePDFToFile(pdfBuffer: Buffer, filename: string): Promise<string> {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'pdfs');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, pdfBuffer);

    return `${env.BACKEND_URL}/uploads/pdfs/${filename}`;
  }
}

export default new PDFService();

