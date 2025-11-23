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
export declare class PDFService {
    /**
     * Generate gift card PDF
     */
    generateGiftCardPDF(data: GiftCardPDFData): Promise<Buffer>;
    /**
     * Save PDF to file
     */
    savePDFToFile(pdfBuffer: Buffer, filename: string): Promise<string>;
}
declare const _default: PDFService;
export default _default;
//# sourceMappingURL=pdf.service.d.ts.map