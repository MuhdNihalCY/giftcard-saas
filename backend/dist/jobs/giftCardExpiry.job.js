"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processGiftCardExpiry = processGiftCardExpiry;
const database_1 = __importDefault(require("../config/database"));
const logger_1 = __importDefault(require("../utils/logger"));
const client_1 = require("@prisma/client");
/**
 * Process gift card expiry check
 */
async function processGiftCardExpiry(job) {
    const { giftCardId } = job.data;
    try {
        const giftCard = await database_1.default.giftCard.findUnique({
            where: { id: giftCardId },
        });
        if (!giftCard) {
            logger_1.default.warn('Gift card not found for expiry check', { giftCardId });
            return;
        }
        // Check if already expired or redeemed
        if (giftCard.status !== client_1.GiftCardStatus.ACTIVE) {
            return;
        }
        // Check if expired
        if (giftCard.expiryDate && giftCard.expiryDate < new Date()) {
            await database_1.default.giftCard.update({
                where: { id: giftCardId },
                data: { status: client_1.GiftCardStatus.EXPIRED },
            });
            logger_1.default.info('Gift card expired', { giftCardId, code: giftCard.code });
        }
    }
    catch (error) {
        logger_1.default.error('Error processing gift card expiry', { giftCardId, error: error.message });
        throw error;
    }
}
//# sourceMappingURL=giftCardExpiry.job.js.map