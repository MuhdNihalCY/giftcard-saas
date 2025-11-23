"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBalanceSchema = exports.redeemViaLinkSchema = exports.redeemViaQRSchema = exports.redeemGiftCardSchema = exports.validateGiftCardSchema = void 0;
const zod_1 = require("zod");
exports.validateGiftCardSchema = zod_1.z.object({
    code: zod_1.z.string().min(1, 'Gift card code is required'),
});
exports.redeemGiftCardSchema = zod_1.z.object({
    giftCardId: zod_1.z.string().uuid().optional(),
    code: zod_1.z.string().optional(),
    amount: zod_1.z.number().positive('Amount must be greater than 0'),
    redemptionMethod: zod_1.z.enum(['QR_CODE', 'CODE_ENTRY', 'LINK', 'API']),
    location: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
}).refine((data) => data.giftCardId || data.code, {
    message: 'Either giftCardId or code must be provided',
});
exports.redeemViaQRSchema = zod_1.z.object({
    qrData: zod_1.z.string().min(1, 'QR data is required'),
    amount: zod_1.z.number().positive('Amount must be greater than 0'),
    location: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.redeemViaLinkSchema = zod_1.z.object({
    amount: zod_1.z.number().positive('Amount must be greater than 0'),
    merchantId: zod_1.z.string().uuid('Merchant ID is required'),
    location: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.checkBalanceSchema = zod_1.z.object({
    code: zod_1.z.string().min(1, 'Gift card code is required'),
});
//# sourceMappingURL=redemption.validator.js.map