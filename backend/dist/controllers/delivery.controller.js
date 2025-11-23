"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryController = void 0;
const delivery_service_1 = __importDefault(require("../services/delivery/delivery.service"));
const pdf_service_1 = __importDefault(require("../services/pdf.service"));
const giftcard_service_1 = __importDefault(require("../services/giftcard.service"));
class DeliveryController {
    async deliverGiftCard(req, res, next) {
        try {
            const result = await delivery_service_1.default.deliverGiftCard(req.body);
            res.json({
                success: true,
                data: result,
                message: 'Gift card delivery initiated',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async sendReminder(req, res, next) {
        try {
            const { id } = req.params;
            const { daysBeforeExpiry } = req.body;
            const result = await delivery_service_1.default.sendExpiryReminder(id, daysBeforeExpiry || 7);
            res.json({
                success: true,
                data: result,
                message: 'Reminder sent successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async generatePDF(req, res, next) {
        try {
            const { id } = req.params;
            const giftCard = await giftcard_service_1.default.getById(id);
            const pdfBuffer = await pdf_service_1.default.generateGiftCardPDF({
                code: giftCard.code,
                value: Number(giftCard.value),
                currency: giftCard.currency,
                qrCodeUrl: giftCard.qrCodeUrl || undefined,
                merchantName: giftCard.merchant.businessName || undefined,
                recipientName: giftCard.recipientName || undefined,
                customMessage: giftCard.customMessage || undefined,
                expiryDate: giftCard.expiryDate || undefined,
            });
            // Set response headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="giftcard-${giftCard.code}.pdf"`);
            res.send(pdfBuffer);
        }
        catch (error) {
            next(error);
        }
    }
    async downloadPDF(req, res, next) {
        try {
            const { id } = req.params;
            const giftCard = await giftcard_service_1.default.getById(id);
            const pdfBuffer = await pdf_service_1.default.generateGiftCardPDF({
                code: giftCard.code,
                value: Number(giftCard.value),
                currency: giftCard.currency,
                qrCodeUrl: giftCard.qrCodeUrl || undefined,
                merchantName: giftCard.merchant.businessName || undefined,
                recipientName: giftCard.recipientName || undefined,
                customMessage: giftCard.customMessage || undefined,
                expiryDate: giftCard.expiryDate || undefined,
            });
            // Save to file and return URL
            const filename = `giftcard-${giftCard.code}-${Date.now()}.pdf`;
            const fileUrl = await pdf_service_1.default.savePDFToFile(pdfBuffer, filename);
            res.json({
                success: true,
                data: {
                    url: fileUrl,
                    filename,
                },
                message: 'PDF generated successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DeliveryController = DeliveryController;
exports.default = new DeliveryController();
//# sourceMappingURL=delivery.controller.js.map