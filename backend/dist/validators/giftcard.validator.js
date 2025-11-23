"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTemplateSchema = exports.createTemplateSchema = exports.bulkCreateGiftCardSchema = exports.updateGiftCardSchema = exports.createGiftCardSchema = void 0;
const zod_1 = require("zod");
exports.createGiftCardSchema = zod_1.z.object({
    value: zod_1.z.number().positive('Value must be greater than 0'),
    currency: zod_1.z.string().optional().default('USD'),
    expiryDate: zod_1.z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
    templateId: zod_1.z.string().uuid().optional(),
    customMessage: zod_1.z.string().optional(),
    recipientEmail: zod_1.z.string().email().optional(),
    recipientName: zod_1.z.string().optional(),
    allowPartialRedemption: zod_1.z.boolean().optional().default(true),
});
exports.updateGiftCardSchema = zod_1.z.object({
    value: zod_1.z.number().positive().optional(),
    expiryDate: zod_1.z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
    customMessage: zod_1.z.string().optional(),
    recipientEmail: zod_1.z.string().email().optional(),
    recipientName: zod_1.z.string().optional(),
    allowPartialRedemption: zod_1.z.boolean().optional(),
    status: zod_1.z.enum(['ACTIVE', 'REDEEMED', 'EXPIRED', 'CANCELLED']).optional(),
});
exports.bulkCreateGiftCardSchema = zod_1.z.object({
    count: zod_1.z.number().int().min(1).max(1000),
    value: zod_1.z.number().positive('Value must be greater than 0'),
    currency: zod_1.z.string().optional().default('USD'),
    expiryDate: zod_1.z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
    templateId: zod_1.z.string().uuid().optional(),
});
exports.createTemplateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    description: zod_1.z.string().optional(),
    designData: zod_1.z.object({
        colors: zod_1.z.object({
            primary: zod_1.z.string().optional(),
            secondary: zod_1.z.string().optional(),
            background: zod_1.z.string().optional(),
            text: zod_1.z.string().optional(),
        }).optional(),
        images: zod_1.z.object({
            logo: zod_1.z.string().optional(),
            background: zod_1.z.string().optional(),
        }).optional(),
        layout: zod_1.z.string().optional(),
    }),
    isPublic: zod_1.z.boolean().optional().default(false),
});
exports.updateTemplateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    designData: zod_1.z.object({
        colors: zod_1.z.object({
            primary: zod_1.z.string().optional(),
            secondary: zod_1.z.string().optional(),
            background: zod_1.z.string().optional(),
            text: zod_1.z.string().optional(),
        }).optional(),
        images: zod_1.z.object({
            logo: zod_1.z.string().optional(),
            background: zod_1.z.string().optional(),
        }).optional(),
        layout: zod_1.z.string().optional(),
    }).optional(),
    isPublic: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=giftcard.validator.js.map