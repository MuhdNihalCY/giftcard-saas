import { z } from 'zod';
export declare const createPaymentSchema: z.ZodObject<{
    giftCardId: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    paymentMethod: z.ZodEnum<["STRIPE", "PAYPAL", "RAZORPAY", "UPI"]>;
    returnUrl: z.ZodOptional<z.ZodString>;
    cancelUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    amount: number;
    giftCardId: string;
    paymentMethod: "STRIPE" | "PAYPAL" | "RAZORPAY" | "UPI";
    returnUrl?: string | undefined;
    cancelUrl?: string | undefined;
}, {
    amount: number;
    giftCardId: string;
    paymentMethod: "STRIPE" | "PAYPAL" | "RAZORPAY" | "UPI";
    currency?: string | undefined;
    returnUrl?: string | undefined;
    cancelUrl?: string | undefined;
}>;
export declare const confirmPaymentSchema: z.ZodObject<{
    paymentId: z.ZodString;
    paymentMethod: z.ZodEnum<["STRIPE", "PAYPAL", "RAZORPAY", "UPI"]>;
    paymentIntentId: z.ZodOptional<z.ZodString>;
    orderId: z.ZodOptional<z.ZodString>;
    paymentMethodId: z.ZodOptional<z.ZodString>;
    signature: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    paymentId: string;
    paymentMethod: "STRIPE" | "PAYPAL" | "RAZORPAY" | "UPI";
    paymentIntentId?: string | undefined;
    paymentMethodId?: string | undefined;
    orderId?: string | undefined;
    signature?: string | undefined;
}, {
    paymentId: string;
    paymentMethod: "STRIPE" | "PAYPAL" | "RAZORPAY" | "UPI";
    paymentIntentId?: string | undefined;
    paymentMethodId?: string | undefined;
    orderId?: string | undefined;
    signature?: string | undefined;
}>;
export declare const refundPaymentSchema: z.ZodObject<{
    amount: z.ZodOptional<z.ZodNumber>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    amount?: number | undefined;
    reason?: string | undefined;
}, {
    amount?: number | undefined;
    reason?: string | undefined;
}>;
//# sourceMappingURL=payment.validator.d.ts.map