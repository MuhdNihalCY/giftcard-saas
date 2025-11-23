"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundPaymentSchema = exports.confirmPaymentSchema = exports.createPaymentSchema = void 0;
const zod_1 = require("zod");
exports.createPaymentSchema = zod_1.z.object({
    giftCardId: zod_1.z.string().uuid('Invalid gift card ID'),
    amount: zod_1.z.number().positive('Amount must be greater than 0'),
    currency: zod_1.z.string().min(3).max(3).default('USD'),
    paymentMethod: zod_1.z.enum(['STRIPE', 'PAYPAL', 'RAZORPAY', 'UPI']),
    returnUrl: zod_1.z.string().url().optional(),
    cancelUrl: zod_1.z.string().url().optional(),
});
exports.confirmPaymentSchema = zod_1.z.object({
    paymentId: zod_1.z.string().uuid('Invalid payment ID'),
    paymentMethod: zod_1.z.enum(['STRIPE', 'PAYPAL', 'RAZORPAY', 'UPI']),
    paymentIntentId: zod_1.z.string().optional(),
    orderId: zod_1.z.string().optional(),
    paymentMethodId: zod_1.z.string().optional(),
    signature: zod_1.z.string().optional(),
});
exports.refundPaymentSchema = zod_1.z.object({
    amount: zod_1.z.number().positive().optional(),
    reason: zod_1.z.string().optional(),
});
//# sourceMappingURL=payment.validator.js.map