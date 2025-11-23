"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiftCardService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const library_1 = require("@prisma/client/runtime/library");
const database_1 = __importDefault(require("../config/database"));
const errors_1 = require("../utils/errors");
const helpers_1 = require("../utils/helpers");
const qrcode_service_1 = __importDefault(require("./qrcode.service"));
const cache_service_1 = __importStar(require("./cache.service"));
class GiftCardService {
    /**
     * Create a new gift card
     */
    async create(data) {
        const { merchantId, value, currency = 'USD', expiryDate, templateId, customMessage, recipientEmail, recipientName, allowPartialRedemption = true, } = data;
        // Validate value
        if (value <= 0) {
            throw new errors_1.ValidationError('Gift card value must be greater than 0');
        }
        // Generate unique code
        let code = (0, helpers_1.generateGiftCardCode)();
        let codeExists = true;
        let attempts = 0;
        const maxAttempts = 10;
        // Ensure code is unique
        while (codeExists && attempts < maxAttempts) {
            const existing = await database_1.default.giftCard.findUnique({
                where: { code },
            });
            if (!existing) {
                codeExists = false;
            }
            else {
                code = (0, helpers_1.generateGiftCardCode)();
                attempts++;
            }
        }
        if (codeExists) {
            throw new Error('Failed to generate unique gift card code');
        }
        // Generate QR code
        const giftCardId = crypto_1.default.randomUUID();
        const qrCodeData = qrcode_service_1.default.generateGiftCardData(giftCardId, code);
        const qrCodeDataURL = await qrcode_service_1.default.generateDataURL(qrCodeData);
        // Create gift card
        const giftCard = await database_1.default.giftCard.create({
            data: {
                id: giftCardId,
                merchantId,
                code,
                qrCodeUrl: qrCodeDataURL,
                value: new library_1.Decimal(value),
                currency,
                balance: new library_1.Decimal(value),
                expiryDate,
                templateId,
                customMessage,
                recipientEmail,
                recipientName,
                allowPartialRedemption,
                status: 'ACTIVE',
            },
            include: {
                merchant: {
                    select: {
                        id: true,
                        email: true,
                        businessName: true,
                    },
                },
                template: true,
            },
        });
        // Invalidate merchant gift cards cache
        await cache_service_1.default.invalidate(`giftcards:merchant:${merchantId}:*`);
        return giftCard;
    }
    /**
     * Get gift card by ID
     */
    async getById(id, userId) {
        const cacheKey = cache_service_1.CacheKeys.giftCard(id);
        // Try to get from cache
        const cached = await cache_service_1.default.get(cacheKey);
        if (cached) {
            return cached;
        }
        const giftCard = await database_1.default.giftCard.findUnique({
            where: { id },
            include: {
                merchant: {
                    select: {
                        id: true,
                        email: true,
                        businessName: true,
                        businessLogo: true,
                    },
                },
                template: true,
            },
        });
        if (!giftCard) {
            throw new errors_1.NotFoundError('Gift card not found');
        }
        // Check if expired
        if (giftCard.status === 'ACTIVE' && (0, helpers_1.isExpired)(giftCard.expiryDate)) {
            await this.updateStatus(id, 'EXPIRED');
            giftCard.status = 'EXPIRED';
        }
        // Cache for 5 minutes
        await cache_service_1.default.set(cacheKey, giftCard, 300);
        return giftCard;
    }
    /**
     * Get gift card by code
     */
    async getByCode(code) {
        const cacheKey = cache_service_1.CacheKeys.giftCardByCode(code);
        // Try to get from cache
        const cached = await cache_service_1.default.get(cacheKey);
        if (cached) {
            return cached;
        }
        const giftCard = await database_1.default.giftCard.findUnique({
            where: { code },
            include: {
                merchant: {
                    select: {
                        id: true,
                        email: true,
                        businessName: true,
                        businessLogo: true,
                    },
                },
                template: true,
            },
        });
        if (!giftCard) {
            throw new errors_1.NotFoundError('Gift card not found');
        }
        // Check if expired
        if (giftCard.status === 'ACTIVE' && (0, helpers_1.isExpired)(giftCard.expiryDate)) {
            await this.updateStatus(giftCard.id, 'EXPIRED');
            giftCard.status = 'EXPIRED';
        }
        // Cache for 5 minutes
        await cache_service_1.default.set(cacheKey, giftCard, 300);
        // Also cache by ID
        await cache_service_1.default.set(cache_service_1.CacheKeys.giftCard(giftCard.id), giftCard, 300);
        return giftCard;
    }
    /**
     * List gift cards with filters
     */
    async list(filters) {
        const { merchantId, status, page = 1, limit = 20 } = filters;
        // Build cache key
        let cacheKey;
        if (merchantId) {
            cacheKey = cache_service_1.CacheKeys.merchantGiftCards(merchantId, page, limit);
        }
        else {
            cacheKey = `giftcards:all:page:${page}:limit:${limit}:status:${status || 'all'}`;
        }
        // Try to get from cache
        const cached = await cache_service_1.default.get(cacheKey);
        if (cached) {
            return cached;
        }
        const skip = (page - 1) * limit;
        const where = {};
        if (merchantId)
            where.merchantId = merchantId;
        if (status)
            where.status = status;
        const [giftCards, total] = await Promise.all([
            database_1.default.giftCard.findMany({
                where,
                skip,
                take: limit,
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
            }),
            database_1.default.giftCard.count({ where }),
        ]);
        const result = {
            giftCards,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
        // Cache for 2 minutes
        await cache_service_1.default.set(cacheKey, result, 120);
        return result;
    }
    /**
     * Update gift card
     */
    async update(id, data, userId) {
        const giftCard = await this.getById(id);
        // Check if user is the merchant
        if (giftCard.merchantId !== userId) {
            throw new errors_1.ValidationError('You can only update your own gift cards');
        }
        // Validate value if provided
        if (data.value !== undefined && data.value <= 0) {
            throw new errors_1.ValidationError('Gift card value must be greater than 0');
        }
        const updateData = {};
        if (data.value !== undefined) {
            updateData.value = new library_1.Decimal(data.value);
            // If balance is still full, update balance too
            if (giftCard.balance.equals(giftCard.value)) {
                updateData.balance = new library_1.Decimal(data.value);
            }
        }
        if (data.expiryDate !== undefined)
            updateData.expiryDate = data.expiryDate;
        if (data.customMessage !== undefined)
            updateData.customMessage = data.customMessage;
        if (data.recipientEmail !== undefined)
            updateData.recipientEmail = data.recipientEmail;
        if (data.recipientName !== undefined)
            updateData.recipientName = data.recipientName;
        if (data.allowPartialRedemption !== undefined)
            updateData.allowPartialRedemption = data.allowPartialRedemption;
        if (data.status !== undefined)
            updateData.status = data.status;
        const updated = await database_1.default.giftCard.update({
            where: { id },
            data: updateData,
            include: {
                merchant: {
                    select: {
                        id: true,
                        email: true,
                        businessName: true,
                    },
                },
                template: true,
            },
        });
        // Invalidate cache
        await cache_service_1.default.delete(cache_service_1.CacheKeys.giftCard(id));
        await cache_service_1.default.delete(cache_service_1.CacheKeys.giftCardByCode(updated.code));
        await cache_service_1.default.invalidate(`giftcards:merchant:${updated.merchantId}:*`);
        return updated;
    }
    /**
     * Delete gift card
     */
    async delete(id, userId) {
        const giftCard = await this.getById(id);
        // Check if user is the merchant
        if (giftCard.merchantId !== userId) {
            throw new errors_1.ValidationError('You can only delete your own gift cards');
        }
        // Only allow deletion if not redeemed
        if (giftCard.status === 'REDEEMED') {
            throw new errors_1.ValidationError('Cannot delete a redeemed gift card');
        }
        await database_1.default.giftCard.delete({
            where: { id },
        });
        // Invalidate cache
        await cache_service_1.default.delete(cache_service_1.CacheKeys.giftCard(id));
        await cache_service_1.default.delete(cache_service_1.CacheKeys.giftCardByCode(giftCard.code));
        await cache_service_1.default.invalidate(`giftcards:merchant:${giftCard.merchantId}:*`);
        return { message: 'Gift card deleted successfully' };
    }
    /**
     * Update gift card status
     */
    async updateStatus(id, status) {
        return database_1.default.giftCard.update({
            where: { id },
            data: { status },
        });
    }
    /**
     * Bulk create gift cards
     */
    async bulkCreate(data) {
        const { merchantId, count, value, currency = 'USD', expiryDate, templateId } = data;
        if (count <= 0 || count > 1000) {
            throw new errors_1.ValidationError('Count must be between 1 and 1000');
        }
        if (value <= 0) {
            throw new errors_1.ValidationError('Gift card value must be greater than 0');
        }
        const giftCards = [];
        for (let i = 0; i < count; i++) {
            let code = (0, helpers_1.generateGiftCardCode)();
            let codeExists = true;
            let attempts = 0;
            while (codeExists && attempts < 10) {
                const existing = await database_1.default.giftCard.findUnique({
                    where: { code },
                });
                if (!existing) {
                    codeExists = false;
                }
                else {
                    code = (0, helpers_1.generateGiftCardCode)();
                    attempts++;
                }
            }
            if (codeExists) {
                throw new Error(`Failed to generate unique code for gift card ${i + 1}`);
            }
            const giftCardId = crypto_1.default.randomUUID();
            const qrCodeData = qrcode_service_1.default.generateGiftCardData(giftCardId, code);
            const qrCodeDataURL = await qrcode_service_1.default.generateDataURL(qrCodeData);
            giftCards.push({
                id: giftCardId,
                merchantId,
                code,
                qrCodeUrl: qrCodeDataURL,
                value: new library_1.Decimal(value),
                currency,
                balance: new library_1.Decimal(value),
                expiryDate,
                templateId,
                allowPartialRedemption: true,
                status: 'ACTIVE',
            });
        }
        // Use createMany for better performance
        const result = await database_1.default.giftCard.createMany({
            data: giftCards,
        });
        return {
            count: result.count,
            message: `Successfully created ${result.count} gift cards`,
        };
    }
}
exports.GiftCardService = GiftCardService;
exports.default = new GiftCardService();
//# sourceMappingURL=giftcard.service.js.map