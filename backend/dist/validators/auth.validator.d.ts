import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    businessName: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["ADMIN", "MERCHANT", "CUSTOMER"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
    businessName?: string | undefined;
    role?: "ADMIN" | "MERCHANT" | "CUSTOMER" | undefined;
}, {
    email: string;
    password: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
    businessName?: string | undefined;
    role?: "ADMIN" | "MERCHANT" | "CUSTOMER" | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
//# sourceMappingURL=auth.validator.d.ts.map