import { Decimal } from '@prisma/client/runtime/library';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
export interface CreatePaymentData {
    giftCardId: string;
    customerId?: string;
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    returnUrl?: string;
    cancelUrl?: string;
}
export interface ConfirmPaymentData {
    paymentId: string;
    paymentMethod: PaymentMethod;
    paymentIntentId?: string;
    orderId?: string;
    paymentMethodId?: string;
    signature?: string;
}
export interface RefundPaymentData {
    paymentId: string;
    amount?: number;
    reason?: string;
}
export declare class PaymentService {
    /**
     * Create payment
     */
    createPayment(data: CreatePaymentData): Promise<{
        payment: {
            giftCard: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                value: Decimal;
                code: string;
                status: import(".prisma/client").$Enums.GiftCardStatus;
                currency: string;
                merchantId: string;
                expiryDate: Date | null;
                templateId: string | null;
                customMessage: string | null;
                recipientEmail: string | null;
                recipientName: string | null;
                allowPartialRedemption: boolean;
                qrCodeUrl: string | null;
                balance: Decimal;
            };
            customer: {
                email: string;
                id: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            currency: string;
            amount: Decimal;
            giftCardId: string;
            customerId: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            paymentIntentId: string;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            transactionId: string | null;
        };
        clientSecret: string | undefined;
        orderId: string | undefined;
        paymentIntentId: string | undefined;
    }>;
    /**
     * Confirm payment
     */
    confirmPayment(data: ConfirmPaymentData): Promise<{
        giftCard: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            value: Decimal;
            code: string;
            status: import(".prisma/client").$Enums.GiftCardStatus;
            currency: string;
            merchantId: string;
            expiryDate: Date | null;
            templateId: string | null;
            customMessage: string | null;
            recipientEmail: string | null;
            recipientName: string | null;
            allowPartialRedemption: boolean;
            qrCodeUrl: string | null;
            balance: Decimal;
        };
        customer: {
            email: string;
            firstName: string | null;
            lastName: string | null;
            businessName: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            passwordHash: string;
            businessLogo: string | null;
            isEmailVerified: boolean;
            isActive: boolean;
            merchantBalance: Decimal;
            failedLoginAttempts: number;
            lockedUntil: Date | null;
            twoFactorEnabled: boolean;
            twoFactorSecret: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        currency: string;
        amount: Decimal;
        giftCardId: string;
        customerId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        paymentIntentId: string;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        transactionId: string | null;
    }>;
    /**
     * Get payment by ID
     */
    getById(id: string): Promise<{
        giftCard: {
            merchant: {
                email: string;
                businessName: string | null;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            value: Decimal;
            code: string;
            status: import(".prisma/client").$Enums.GiftCardStatus;
            currency: string;
            merchantId: string;
            expiryDate: Date | null;
            templateId: string | null;
            customMessage: string | null;
            recipientEmail: string | null;
            recipientName: string | null;
            allowPartialRedemption: boolean;
            qrCodeUrl: string | null;
            balance: Decimal;
        };
        customer: {
            email: string;
            firstName: string | null;
            lastName: string | null;
            id: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        currency: string;
        amount: Decimal;
        giftCardId: string;
        customerId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        paymentIntentId: string;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        transactionId: string | null;
    }>;
    /**
     * List payments
     */
    list(filters: {
        giftCardId?: string;
        customerId?: string;
        status?: PaymentStatus;
        paymentMethod?: PaymentMethod;
        page?: number;
        limit?: number;
    }): Promise<{
        payments: ({
            giftCard: {
                id: string;
                value: Decimal;
                code: string;
            };
            customer: {
                email: string;
                id: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            currency: string;
            amount: Decimal;
            giftCardId: string;
            customerId: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            paymentIntentId: string;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            transactionId: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    /**
     * Process refund
     */
    refundPayment(data: RefundPaymentData): Promise<{
        refundId: any;
        amount: number;
        status: any;
    }>;
}
declare const _default: PaymentService;
export default _default;
//# sourceMappingURL=payment.service.d.ts.map