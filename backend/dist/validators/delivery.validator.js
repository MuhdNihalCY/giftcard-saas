"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendReminderSchema = exports.deliverGiftCardSchema = void 0;
const zod_1 = require("zod");
exports.deliverGiftCardSchema = zod_1.z.object({
    giftCardId: zod_1.z.string().uuid('Invalid gift card ID'),
    deliveryMethod: zod_1.z.enum(['email', 'sms', 'both']),
    recipientEmail: zod_1.z.string().email().optional(),
    recipientPhone: zod_1.z.string().optional(),
    recipientName: zod_1.z.string().optional(),
    scheduleFor: zod_1.z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
});
exports.sendReminderSchema = zod_1.z.object({
    daysBeforeExpiry: zod_1.z.number().int().min(1).max(30).optional().default(7),
});
//# sourceMappingURL=delivery.validator.js.map