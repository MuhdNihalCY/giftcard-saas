"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processExpiryReminder = processExpiryReminder;
const database_1 = __importDefault(require("../config/database"));
const logger_1 = __importDefault(require("../utils/logger"));
const email_service_1 = __importDefault(require("../services/delivery/email.service"));
const env_1 = require("../config/env");
/**
 * Process expiry reminder
 */
async function processExpiryReminder(job) {
    const { giftCardId, daysUntilExpiry } = job.data;
    try {
        const giftCard = await database_1.default.giftCard.findUnique({
            where: { id: giftCardId },
            include: {
                merchant: {
                    select: {
                        businessName: true,
                    },
                },
            },
        });
        if (!giftCard) {
            logger_1.default.warn('Gift card not found for reminder', { giftCardId });
            return;
        }
        // Check if already expired or redeemed
        if (giftCard.status !== 'ACTIVE') {
            return;
        }
        // Check if still expiring soon
        if (!giftCard.expiryDate || giftCard.expiryDate > new Date()) {
            const redemptionUrl = `${env_1.env.FRONTEND_URL}/redeem/${giftCard.code}`;
            // Send email reminder if recipient email exists
            if (giftCard.recipientEmail) {
                try {
                    await email_service_1.default.sendReminderEmail({
                        to: giftCard.recipientEmail,
                        recipientName: giftCard.recipientName || 'Friend',
                        giftCardCode: giftCard.code,
                        giftCardValue: Number(giftCard.value),
                        currency: giftCard.currency,
                        daysUntilExpiry,
                        redemptionUrl,
                    });
                    logger_1.default.info('Expiry reminder email sent', { giftCardId, email: giftCard.recipientEmail });
                }
                catch (error) {
                    logger_1.default.error('Failed to send expiry reminder email', { giftCardId, error: error.message });
                }
            }
            // Note: SMS reminders would require recipient phone number in the schema
            // For now, we'll skip SMS reminders
        }
    }
    catch (error) {
        logger_1.default.error('Error processing expiry reminder', { giftCardId, error: error.message });
        throw error;
    }
}
//# sourceMappingURL=expiryReminders.job.js.map