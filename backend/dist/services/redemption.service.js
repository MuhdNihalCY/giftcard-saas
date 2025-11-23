"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedemptionService = void 0;
const library_1 = require("@prisma/client/runtime/library");
const database_1 = __importDefault(require("../config/database"));
const errors_1 = require("../utils/errors");
const giftcard_service_1 = __importDefault(require("./giftcard.service"));
const helpers_1 = require("../utils/helpers");
class RedemptionService {
    /**
     * Validate gift card code
     */
    async validateGiftCard(data) {
        const { code } = data;
        const giftCard = await giftcard_service_1.default.getByCode(code);
        // Check if expired
        if (giftCard.status === 'ACTIVE' && (0, helpers_1.isExpired)(giftCard.expiryDate)) {
            await giftcard_service_1.default.updateStatus(giftCard.id, 'EXPIRED');
            throw new errors_1.ValidationError('Gift card has expired');
        }
        if (giftCard.status !== 'ACTIVE') {
            throw new errors_1.ValidationError(`Gift card is ${giftCard.status.toLowerCase()}`);
        }
        return {
            valid: true,
            giftCard: {
                id: giftCard.id,
                code: giftCard.code,
                balance: Number(giftCard.balance),
                value: Number(giftCard.value),
                currency: giftCard.currency,
                allowPartialRedemption: giftCard.allowPartialRedemption,
                expiryDate: giftCard.expiryDate,
                status: giftCard.status,
            },
        };
    }
    /**
     * Redeem gift card
     */
    async redeemGiftCard(data) {
        const { giftCardId, code, amount, merchantId, redemptionMethod, location, notes, } = data;
        // Get gift card
        let giftCard;
        if (giftCardId) {
            giftCard = await giftcard_service_1.default.getById(giftCardId);
        }
        else if (code) {
            giftCard = await giftcard_service_1.default.getByCode(code);
        }
        else {
            throw new errors_1.ValidationError('Either giftCardId or code must be provided');
        }
        // Validate gift card status
        if (giftCard.status === 'ACTIVE' && (0, helpers_1.isExpired)(giftCard.expiryDate)) {
            await giftcard_service_1.default.updateStatus(giftCard.id, 'EXPIRED');
            throw new errors_1.ValidationError('Gift card has expired');
        }
        if (giftCard.status !== 'ACTIVE') {
            throw new errors_1.ValidationError(`Gift card is ${giftCard.status.toLowerCase()}`);
        }
        // Validate amount
        const currentBalance = Number(giftCard.balance);
        if (amount <= 0) {
            throw new errors_1.ValidationError('Redemption amount must be greater than 0');
        }
        if (amount > currentBalance) {
            throw new errors_1.ValidationError(`Redemption amount (${amount}) exceeds available balance (${currentBalance})`);
        }
        // Check if partial redemption is allowed
        if (amount < currentBalance && !giftCard.allowPartialRedemption) {
            throw new errors_1.ValidationError('Partial redemption is not allowed for this gift card');
        }
        // Calculate new balance
        const newBalance = currentBalance - amount;
        const balanceBefore = new library_1.Decimal(currentBalance);
        const balanceAfter = new library_1.Decimal(newBalance);
        // Update gift card balance
        const updatedGiftCard = await database_1.default.giftCard.update({
            where: { id: giftCard.id },
            data: {
                balance: balanceAfter,
                status: newBalance <= 0 ? 'REDEEMED' : 'ACTIVE',
            },
        });
        // Create redemption record
        const redemption = await database_1.default.redemption.create({
            data: {
                giftCardId: giftCard.id,
                merchantId,
                amount: new library_1.Decimal(amount),
                balanceBefore,
                balanceAfter,
                redemptionMethod,
                location,
                notes,
            },
            include: {
                giftCard: {
                    select: {
                        id: true,
                        code: true,
                        value: true,
                        currency: true,
                    },
                },
                merchant: {
                    select: {
                        id: true,
                        email: true,
                        businessName: true,
                    },
                },
            },
        });
        // Create transaction record
        await database_1.default.transaction.create({
            data: {
                giftCardId: giftCard.id,
                type: 'REDEMPTION',
                amount: new library_1.Decimal(amount),
                balanceBefore,
                balanceAfter,
                userId: merchantId,
                metadata: {
                    redemptionId: redemption.id,
                    redemptionMethod,
                    location,
                },
            },
        });
        return {
            redemption,
            remainingBalance: newBalance,
            isFullyRedeemed: newBalance <= 0,
        };
    }
    /**
     * Get redemption by ID
     */
    async getById(id) {
        const redemption = await database_1.default.redemption.findUnique({
            where: { id },
            include: {
                giftCard: {
                    include: {
                        merchant: {
                            select: {
                                id: true,
                                email: true,
                                businessName: true,
                            },
                        },
                    },
                },
                merchant: {
                    select: {
                        id: true,
                        email: true,
                        businessName: true,
                    },
                },
            },
        });
        if (!redemption) {
            throw new errors_1.NotFoundError('Redemption not found');
        }
        return redemption;
    }
    /**
     * List redemptions
     */
    async list(filters) {
        const { giftCardId, merchantId, redemptionMethod, page = 1, limit = 20, } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (giftCardId)
            where.giftCardId = giftCardId;
        if (merchantId)
            where.merchantId = merchantId;
        if (redemptionMethod)
            where.redemptionMethod = redemptionMethod;
        const [redemptions, total] = await Promise.all([
            database_1.default.redemption.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    giftCard: {
                        select: {
                            id: true,
                            code: true,
                            value: true,
                            currency: true,
                        },
                    },
                    merchant: {
                        select: {
                            id: true,
                            email: true,
                            businessName: true,
                        },
                    },
                },
            }),
            database_1.default.redemption.count({ where }),
        ]);
        return {
            redemptions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Get redemption history for a gift card
     */
    async getGiftCardHistory(giftCardId) {
        const giftCard = await giftcard_service_1.default.getById(giftCardId);
        const redemptions = await database_1.default.redemption.findMany({
            where: { giftCardId },
            orderBy: { createdAt: 'desc' },
            include: {
                merchant: {
                    select: {
                        id: true,
                        email: true,
                        businessName: true,
                    },
                },
            },
        });
        return {
            giftCard: {
                id: giftCard.id,
                code: giftCard.code,
                value: Number(giftCard.value),
                balance: Number(giftCard.balance),
                currency: giftCard.currency,
                status: giftCard.status,
            },
            redemptions,
            totalRedeemed: Number(giftCard.value) - Number(giftCard.balance),
        };
    }
    /**
     * Check gift card balance
     */
    async checkBalance(code) {
        const giftCard = await giftcard_service_1.default.getByCode(code);
        // Check if expired
        if (giftCard.status === 'ACTIVE' && (0, helpers_1.isExpired)(giftCard.expiryDate)) {
            await giftcard_service_1.default.updateStatus(giftCard.id, 'EXPIRED');
            return {
                code: giftCard.code,
                balance: Number(giftCard.balance),
                value: Number(giftCard.value),
                currency: giftCard.currency,
                status: 'EXPIRED',
                expiryDate: giftCard.expiryDate,
            };
        }
        return {
            code: giftCard.code,
            balance: Number(giftCard.balance),
            value: Number(giftCard.value),
            currency: giftCard.currency,
            status: giftCard.status,
            expiryDate: giftCard.expiryDate,
            allowPartialRedemption: giftCard.allowPartialRedemption,
        };
    }
    /**
     * Get transaction history
     */
    async getTransactionHistory(giftCardId) {
        const giftCard = await giftcard_service_1.default.getById(giftCardId);
        const transactions = await database_1.default.transaction.findMany({
            where: { giftCardId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        return {
            giftCard: {
                id: giftCard.id,
                code: giftCard.code,
                value: Number(giftCard.value),
                balance: Number(giftCard.balance),
                currency: giftCard.currency,
            },
            transactions,
        };
    }
}
exports.RedemptionService = RedemptionService;
exports.default = new RedemptionService();
//# sourceMappingURL=redemption.service.js.map