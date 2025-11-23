"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryService = void 0;
const database_1 = __importDefault(require("../../config/database"));
const email_service_1 = __importDefault(require("./email.service"));
const sms_service_1 = __importDefault(require("./sms.service"));
const giftcard_service_1 = __importDefault(require("../giftcard.service"));
const env_1 = require("../../config/env");
const errors_1 = require("../../utils/errors");
class DeliveryService {
    /**
     * Deliver gift card
     */
    async deliverGiftCard(options) {
        const { giftCardId, deliveryMethod, recipientEmail, recipientPhone, recipientName, scheduleFor, } = options;
        // Get gift card
        const giftCard = await giftcard_service_1.default.getById(giftCardId);
        if (giftCard.status !== 'ACTIVE') {
            throw new errors_1.ValidationError('Gift card is not active');
        }
        const redemptionUrl = `${env_1.env.FRONTEND_URL}/redeem/${giftCard.code}`;
        // If scheduled for future, queue it
        if (scheduleFor && new Date(scheduleFor) > new Date()) {
            // TODO: Implement job queue for scheduled delivery
            // For now, we'll just store the schedule info
            return {
                scheduled: true,
                scheduledFor: scheduleFor,
                message: 'Gift card delivery scheduled',
            };
        }
        // Deliver immediately
        const deliveryResults = [];
        if (deliveryMethod === 'email' || deliveryMethod === 'both') {
            if (!recipientEmail) {
                throw new errors_1.ValidationError('Recipient email is required for email delivery');
            }
            try {
                await email_service_1.default.sendGiftCardEmail({
                    to: recipientEmail,
                    recipientName,
                    giftCardCode: giftCard.code,
                    giftCardValue: Number(giftCard.value),
                    currency: giftCard.currency,
                    qrCodeUrl: giftCard.qrCodeUrl || undefined,
                    customMessage: giftCard.customMessage || undefined,
                    merchantName: giftCard.merchant.businessName || undefined,
                    expiryDate: giftCard.expiryDate || undefined,
                    redemptionUrl,
                });
                deliveryResults.push({
                    method: 'email',
                    status: 'success',
                    recipient: recipientEmail,
                });
            }
            catch (error) {
                deliveryResults.push({
                    method: 'email',
                    status: 'failed',
                    recipient: recipientEmail,
                    error: error.message,
                });
            }
        }
        if (deliveryMethod === 'sms' || deliveryMethod === 'both') {
            if (!recipientPhone) {
                throw new errors_1.ValidationError('Recipient phone is required for SMS delivery');
            }
            try {
                await sms_service_1.default.sendGiftCardSMS({
                    to: recipientPhone,
                    giftCardCode: giftCard.code,
                    giftCardValue: Number(giftCard.value),
                    currency: giftCard.currency,
                    redemptionUrl,
                    merchantName: giftCard.merchant.businessName || undefined,
                    expiryDate: giftCard.expiryDate || undefined,
                });
                deliveryResults.push({
                    method: 'sms',
                    status: 'success',
                    recipient: recipientPhone,
                });
            }
            catch (error) {
                deliveryResults.push({
                    method: 'sms',
                    status: 'failed',
                    recipient: recipientPhone,
                    error: error.message,
                });
            }
        }
        // Update gift card with recipient info if provided
        if (recipientEmail || recipientName) {
            await database_1.default.giftCard.update({
                where: { id: giftCardId },
                data: {
                    recipientEmail: recipientEmail || giftCard.recipientEmail,
                    recipientName: recipientName || giftCard.recipientName,
                },
            });
        }
        return {
            delivered: true,
            results: deliveryResults,
            message: 'Gift card delivered successfully',
        };
    }
    /**
     * Send expiry reminder
     */
    async sendExpiryReminder(giftCardId, daysBeforeExpiry = 7) {
        const giftCard = await giftcard_service_1.default.getById(giftCardId);
        if (giftCard.status !== 'ACTIVE' || !giftCard.expiryDate) {
            return { message: 'Gift card does not need reminder' };
        }
        const expiryDate = new Date(giftCard.expiryDate);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry > daysBeforeExpiry || daysUntilExpiry <= 0) {
            return { message: 'Not time for reminder yet' };
        }
        const redemptionUrl = `${env_1.env.FRONTEND_URL}/redeem/${giftCard.code}`;
        const results = [];
        // Send email reminder if email exists
        if (giftCard.recipientEmail) {
            try {
                await email_service_1.default.sendReminderEmail({
                    to: giftCard.recipientEmail,
                    recipientName: giftCard.recipientName || undefined,
                    giftCardCode: giftCard.code,
                    giftCardValue: Number(giftCard.value),
                    currency: giftCard.currency,
                    daysUntilExpiry,
                    redemptionUrl,
                });
                results.push({ method: 'email', status: 'success' });
            }
            catch (error) {
                results.push({ method: 'email', status: 'failed', error: error.message });
            }
        }
        // TODO: Add SMS reminder if phone number is stored
        return {
            sent: true,
            results,
            daysUntilExpiry,
        };
    }
}
exports.DeliveryService = DeliveryService;
exports.default = new DeliveryService();
//# sourceMappingURL=delivery.service.js.map