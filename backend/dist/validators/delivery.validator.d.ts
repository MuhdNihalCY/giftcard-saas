import { z } from 'zod';
export declare const deliverGiftCardSchema: z.ZodObject<{
    giftCardId: z.ZodString;
    deliveryMethod: z.ZodEnum<["email", "sms", "both"]>;
    recipientEmail: z.ZodOptional<z.ZodString>;
    recipientPhone: z.ZodOptional<z.ZodString>;
    recipientName: z.ZodOptional<z.ZodString>;
    scheduleFor: z.ZodEffects<z.ZodOptional<z.ZodString>, Date | undefined, string | undefined>;
}, "strip", z.ZodTypeAny, {
    giftCardId: string;
    deliveryMethod: "email" | "sms" | "both";
    recipientEmail?: string | undefined;
    recipientName?: string | undefined;
    recipientPhone?: string | undefined;
    scheduleFor?: Date | undefined;
}, {
    giftCardId: string;
    deliveryMethod: "email" | "sms" | "both";
    recipientEmail?: string | undefined;
    recipientName?: string | undefined;
    recipientPhone?: string | undefined;
    scheduleFor?: string | undefined;
}>;
export declare const sendReminderSchema: z.ZodObject<{
    daysBeforeExpiry: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    daysBeforeExpiry: number;
}, {
    daysBeforeExpiry?: number | undefined;
}>;
//# sourceMappingURL=delivery.validator.d.ts.map