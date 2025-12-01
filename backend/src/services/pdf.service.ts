import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { ValidationError } from '../utils/errors';
import { mergeDesignWithDefaults, getBackgroundGradient } from '../utils/template-design.util';
import type { TemplateDesignData } from '../services/giftcard-template.service';

export interface GiftCardPDFData {
  code: string;
  value: number;
  currency: string;
  qrCodeUrl?: string;
  merchantName?: string;
  recipientName?: string;
  customMessage?: string;
  expiryDate?: Date;
  template?: {
    designData: TemplateDesignData | null;
  } | null;
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
      template,
    } = data;

    // Merge template design with defaults
    const design = mergeDesignWithDefaults(template?.designData);
    const primaryColor = design.colors.primary;
    const secondaryColor = design.colors.secondary;
    const backgroundColor = design.colors.background;
    const textColor = design.colors.text;
    const borderRadius = parseInt(design.borderRadius) || 8;

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

        // Background with template gradient or primary color
        if (design.layout === 'premium' || design.layout === 'modern') {
          // Use gradient for premium/modern layouts
          doc.rect(0, 0, 400, 600).fill(primaryColor);
        } else {
          doc.rect(0, 0, 400, 600).fill(primaryColor);
        }

        // White card area with template background color
        doc.roundedRect(25, 25, 350, 550, borderRadius)
          .fill(backgroundColor)
          .stroke(textColor);

        // Title with template colors
        const titleSize = parseInt(design.typography.headingSize) || 24;
        doc.fontSize(titleSize)
          .fillColor(primaryColor)
          .font('Helvetica-Bold')
          .text('🎁 Gift Card', 50, 60, { align: 'center', width: 300 });

        // Merchant name
        if (merchantName) {
          const bodySize = parseInt(design.typography.bodySize) || 16;
          doc.fontSize(bodySize)
            .fillColor(textColor)
            .font('Helvetica')
            .text(merchantName, 50, 120, { align: 'center', width: 300 });
        }

        // Value with template primary color
        const formattedValue = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency,
        }).format(value);

        doc.fontSize(32)
          .fillColor(primaryColor)
          .font('Helvetica-Bold')
          .text(formattedValue, 50, 180, { align: 'center', width: 300 });

        // Custom message
        if (customMessage) {
          doc.fontSize(12)
            .fillColor(textColor)
            .font('Helvetica')
            .text(`"${customMessage}"`, 50, 240, {
              align: 'center',
              width: 300,
            });
        }

        // QR Code placeholder
        if (qrCodeUrl) {
          doc.fontSize(10)
            .fillColor(textColor)
            .text('QR Code:', 50, 300, { align: 'center', width: 300 });
          doc.fontSize(8)
            .text('(QR code image would be embedded here)', 50, 320, {
              align: 'center',
              width: 300,
            });
        }

        // Gift card code with template accent color
        doc.fontSize(18)
          .fillColor(textColor)
          .font('Helvetica-Bold')
          .text('Gift Card Code:', 50, 400, { align: 'center', width: 300 });

        doc.fontSize(24)
          .fillColor(primaryColor)
          .text(code, 50, 430, {
            align: 'center',
            width: 300,
            characterSpacing: 2,
          });

        // Expiry date
        if (expiryDate) {
          doc.fontSize(10)
            .fillColor(textColor)
            .text(
              `Expires: ${new Date(expiryDate).toLocaleDateString()}`,
              50,
              480,
              { align: 'center', width: 300 }
            );
        }

        // Footer
        doc.fontSize(8)
          .fillColor(textColor)
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

