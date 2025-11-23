export declare class QRCodeService {
    /**
     * Generate QR code as data URL
     */
    generateDataURL(data: string): Promise<string>;
    /**
     * Generate QR code as buffer (for saving to file)
     */
    generateBuffer(data: string): Promise<Buffer>;
    /**
     * Generate QR code data for gift card redemption
     */
    generateGiftCardData(giftCardId: string, code: string): string;
}
declare const _default: QRCodeService;
export default _default;
//# sourceMappingURL=qrcode.service.d.ts.map