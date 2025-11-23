"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRCodeService = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const env_1 = require("../config/env");
class QRCodeService {
    /**
     * Generate QR code as data URL
     */
    async generateDataURL(data) {
        try {
            const qrCodeDataURL = await qrcode_1.default.toDataURL(data, {
                errorCorrectionLevel: 'M',
                type: 'image/png',
                width: 300,
                margin: 1,
            });
            return qrCodeDataURL;
        }
        catch (error) {
            throw new Error('Failed to generate QR code');
        }
    }
    /**
     * Generate QR code as buffer (for saving to file)
     */
    async generateBuffer(data) {
        try {
            const qrCodeBuffer = await qrcode_1.default.toBuffer(data, {
                errorCorrectionLevel: 'M',
                type: 'image/png',
                width: 300,
                margin: 1,
            });
            return qrCodeBuffer;
        }
        catch (error) {
            throw new Error('Failed to generate QR code buffer');
        }
    }
    /**
     * Generate QR code data for gift card redemption
     */
    generateGiftCardData(giftCardId, code) {
        return JSON.stringify({
            type: 'giftcard',
            id: giftCardId,
            code: code,
            url: `${env_1.env.FRONTEND_URL}/redeem/${code}`,
        });
    }
}
exports.QRCodeService = QRCodeService;
exports.default = new QRCodeService();
//# sourceMappingURL=qrcode.service.js.map