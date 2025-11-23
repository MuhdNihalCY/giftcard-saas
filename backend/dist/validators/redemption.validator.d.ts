import { z } from 'zod';
export declare const validateGiftCardSchema: z.ZodObject<{
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
}, {
    code: string;
}>;
export declare const redeemGiftCardSchema: z.ZodEffects<z.ZodObject<{
    giftCardId: z.ZodOptional<z.ZodString>;
    code: z.ZodOptional<z.ZodString>;
    amount: z.ZodNumber;
    redemptionMethod: z.ZodEnum<["QR_CODE", "CODE_ENTRY", "LINK", "API"]>;
    location: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    amount: number;
    redemptionMethod: "LINK" | "QR_CODE" | "CODE_ENTRY" | "API";
    code?: string | undefined;
    giftCardId?: string | undefined;
    notes?: string | undefined;
    location?: string | undefined;
}, {
    amount: number;
    redemptionMethod: "LINK" | "QR_CODE" | "CODE_ENTRY" | "API";
    code?: string | undefined;
    giftCardId?: string | undefined;
    notes?: string | undefined;
    location?: string | undefined;
}>, {
    amount: number;
    redemptionMethod: "LINK" | "QR_CODE" | "CODE_ENTRY" | "API";
    code?: string | undefined;
    giftCardId?: string | undefined;
    notes?: string | undefined;
    location?: string | undefined;
}, {
    amount: number;
    redemptionMethod: "LINK" | "QR_CODE" | "CODE_ENTRY" | "API";
    code?: string | undefined;
    giftCardId?: string | undefined;
    notes?: string | undefined;
    location?: string | undefined;
}>;
export declare const redeemViaQRSchema: z.ZodObject<{
    qrData: z.ZodString;
    amount: z.ZodNumber;
    location: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    amount: number;
    qrData: string;
    notes?: string | undefined;
    location?: string | undefined;
}, {
    amount: number;
    qrData: string;
    notes?: string | undefined;
    location?: string | undefined;
}>;
export declare const redeemViaLinkSchema: z.ZodObject<{
    amount: z.ZodNumber;
    merchantId: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    merchantId: string;
    amount: number;
    notes?: string | undefined;
    location?: string | undefined;
}, {
    merchantId: string;
    amount: number;
    notes?: string | undefined;
    location?: string | undefined;
}>;
export declare const checkBalanceSchema: z.ZodObject<{
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
}, {
    code: string;
}>;
//# sourceMappingURL=redemption.validator.d.ts.map