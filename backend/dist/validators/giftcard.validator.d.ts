import { z } from 'zod';
export declare const createGiftCardSchema: z.ZodObject<{
    value: z.ZodNumber;
    currency: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    expiryDate: z.ZodEffects<z.ZodOptional<z.ZodString>, Date | undefined, string | undefined>;
    templateId: z.ZodOptional<z.ZodString>;
    customMessage: z.ZodOptional<z.ZodString>;
    recipientEmail: z.ZodOptional<z.ZodString>;
    recipientName: z.ZodOptional<z.ZodString>;
    allowPartialRedemption: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    value: number;
    currency: string;
    allowPartialRedemption: boolean;
    expiryDate?: Date | undefined;
    templateId?: string | undefined;
    customMessage?: string | undefined;
    recipientEmail?: string | undefined;
    recipientName?: string | undefined;
}, {
    value: number;
    currency?: string | undefined;
    expiryDate?: string | undefined;
    templateId?: string | undefined;
    customMessage?: string | undefined;
    recipientEmail?: string | undefined;
    recipientName?: string | undefined;
    allowPartialRedemption?: boolean | undefined;
}>;
export declare const updateGiftCardSchema: z.ZodObject<{
    value: z.ZodOptional<z.ZodNumber>;
    expiryDate: z.ZodEffects<z.ZodOptional<z.ZodString>, Date | undefined, string | undefined>;
    customMessage: z.ZodOptional<z.ZodString>;
    recipientEmail: z.ZodOptional<z.ZodString>;
    recipientName: z.ZodOptional<z.ZodString>;
    allowPartialRedemption: z.ZodOptional<z.ZodBoolean>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "REDEEMED", "EXPIRED", "CANCELLED"]>>;
}, "strip", z.ZodTypeAny, {
    value?: number | undefined;
    status?: "ACTIVE" | "REDEEMED" | "EXPIRED" | "CANCELLED" | undefined;
    expiryDate?: Date | undefined;
    customMessage?: string | undefined;
    recipientEmail?: string | undefined;
    recipientName?: string | undefined;
    allowPartialRedemption?: boolean | undefined;
}, {
    value?: number | undefined;
    status?: "ACTIVE" | "REDEEMED" | "EXPIRED" | "CANCELLED" | undefined;
    expiryDate?: string | undefined;
    customMessage?: string | undefined;
    recipientEmail?: string | undefined;
    recipientName?: string | undefined;
    allowPartialRedemption?: boolean | undefined;
}>;
export declare const bulkCreateGiftCardSchema: z.ZodObject<{
    count: z.ZodNumber;
    value: z.ZodNumber;
    currency: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    expiryDate: z.ZodEffects<z.ZodOptional<z.ZodString>, Date | undefined, string | undefined>;
    templateId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    value: number;
    currency: string;
    count: number;
    expiryDate?: Date | undefined;
    templateId?: string | undefined;
}, {
    value: number;
    count: number;
    currency?: string | undefined;
    expiryDate?: string | undefined;
    templateId?: string | undefined;
}>;
export declare const createTemplateSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    designData: z.ZodObject<{
        colors: z.ZodOptional<z.ZodObject<{
            primary: z.ZodOptional<z.ZodString>;
            secondary: z.ZodOptional<z.ZodString>;
            background: z.ZodOptional<z.ZodString>;
            text: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            primary?: string | undefined;
            secondary?: string | undefined;
            background?: string | undefined;
            text?: string | undefined;
        }, {
            primary?: string | undefined;
            secondary?: string | undefined;
            background?: string | undefined;
            text?: string | undefined;
        }>>;
        images: z.ZodOptional<z.ZodObject<{
            logo: z.ZodOptional<z.ZodString>;
            background: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            background?: string | undefined;
            logo?: string | undefined;
        }, {
            background?: string | undefined;
            logo?: string | undefined;
        }>>;
        layout: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        colors?: {
            primary?: string | undefined;
            secondary?: string | undefined;
            background?: string | undefined;
            text?: string | undefined;
        } | undefined;
        images?: {
            background?: string | undefined;
            logo?: string | undefined;
        } | undefined;
        layout?: string | undefined;
    }, {
        colors?: {
            primary?: string | undefined;
            secondary?: string | undefined;
            background?: string | undefined;
            text?: string | undefined;
        } | undefined;
        images?: {
            background?: string | undefined;
            logo?: string | undefined;
        } | undefined;
        layout?: string | undefined;
    }>;
    isPublic: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    designData: {
        colors?: {
            primary?: string | undefined;
            secondary?: string | undefined;
            background?: string | undefined;
            text?: string | undefined;
        } | undefined;
        images?: {
            background?: string | undefined;
            logo?: string | undefined;
        } | undefined;
        layout?: string | undefined;
    };
    isPublic: boolean;
    description?: string | undefined;
}, {
    name: string;
    designData: {
        colors?: {
            primary?: string | undefined;
            secondary?: string | undefined;
            background?: string | undefined;
            text?: string | undefined;
        } | undefined;
        images?: {
            background?: string | undefined;
            logo?: string | undefined;
        } | undefined;
        layout?: string | undefined;
    };
    description?: string | undefined;
    isPublic?: boolean | undefined;
}>;
export declare const updateTemplateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    designData: z.ZodOptional<z.ZodObject<{
        colors: z.ZodOptional<z.ZodObject<{
            primary: z.ZodOptional<z.ZodString>;
            secondary: z.ZodOptional<z.ZodString>;
            background: z.ZodOptional<z.ZodString>;
            text: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            primary?: string | undefined;
            secondary?: string | undefined;
            background?: string | undefined;
            text?: string | undefined;
        }, {
            primary?: string | undefined;
            secondary?: string | undefined;
            background?: string | undefined;
            text?: string | undefined;
        }>>;
        images: z.ZodOptional<z.ZodObject<{
            logo: z.ZodOptional<z.ZodString>;
            background: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            background?: string | undefined;
            logo?: string | undefined;
        }, {
            background?: string | undefined;
            logo?: string | undefined;
        }>>;
        layout: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        colors?: {
            primary?: string | undefined;
            secondary?: string | undefined;
            background?: string | undefined;
            text?: string | undefined;
        } | undefined;
        images?: {
            background?: string | undefined;
            logo?: string | undefined;
        } | undefined;
        layout?: string | undefined;
    }, {
        colors?: {
            primary?: string | undefined;
            secondary?: string | undefined;
            background?: string | undefined;
            text?: string | undefined;
        } | undefined;
        images?: {
            background?: string | undefined;
            logo?: string | undefined;
        } | undefined;
        layout?: string | undefined;
    }>>;
    isPublic: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    designData?: {
        colors?: {
            primary?: string | undefined;
            secondary?: string | undefined;
            background?: string | undefined;
            text?: string | undefined;
        } | undefined;
        images?: {
            background?: string | undefined;
            logo?: string | undefined;
        } | undefined;
        layout?: string | undefined;
    } | undefined;
    isPublic?: boolean | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    designData?: {
        colors?: {
            primary?: string | undefined;
            secondary?: string | undefined;
            background?: string | undefined;
            text?: string | undefined;
        } | undefined;
        images?: {
            background?: string | undefined;
            logo?: string | undefined;
        } | undefined;
        layout?: string | undefined;
    } | undefined;
    isPublic?: boolean | undefined;
}>;
//# sourceMappingURL=giftcard.validator.d.ts.map