import { Decimal } from '@prisma/client/runtime/library';
import { RedemptionMethod } from '@prisma/client';
export interface RedeemGiftCardData {
    giftCardId?: string;
    code?: string;
    amount: number;
    merchantId: string;
    redemptionMethod: RedemptionMethod;
    location?: string;
    notes?: string;
}
export interface ValidateGiftCardData {
    code: string;
}
export declare class RedemptionService {
    /**
     * Validate gift card code
     */
    validateGiftCard(data: ValidateGiftCardData): Promise<{
        valid: boolean;
        giftCard: {
            id: any;
            code: any;
            balance: number;
            value: number;
            currency: any;
            allowPartialRedemption: any;
            expiryDate: any;
            status: any;
        };
    }>;
    /**
     * Redeem gift card
     */
    redeemGiftCard(data: RedeemGiftCardData): Promise<{
        redemption: {
            merchant: {
                email: string;
                businessName: string | null;
                id: string;
            };
            giftCard: {
                id: string;
                value: Decimal;
                code: string;
                currency: string;
            };
        } & {
            id: string;
            createdAt: Date;
            merchantId: string;
            amount: Decimal;
            giftCardId: string;
            notes: string | null;
            balanceBefore: Decimal;
            balanceAfter: Decimal;
            redemptionMethod: import(".prisma/client").$Enums.RedemptionMethod;
            location: string | null;
        };
        remainingBalance: number;
        isFullyRedeemed: boolean;
    }>;
    /**
     * Get redemption by ID
     */
    getById(id: string): Promise<{
        merchant: {
            email: string;
            businessName: string | null;
            id: string;
        };
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
    } & {
        id: string;
        createdAt: Date;
        merchantId: string;
        amount: Decimal;
        giftCardId: string;
        notes: string | null;
        balanceBefore: Decimal;
        balanceAfter: Decimal;
        redemptionMethod: import(".prisma/client").$Enums.RedemptionMethod;
        location: string | null;
    }>;
    /**
     * List redemptions
     */
    list(filters: {
        giftCardId?: string;
        merchantId?: string;
        redemptionMethod?: RedemptionMethod;
        page?: number;
        limit?: number;
    }): Promise<{
        redemptions: ({
            merchant: {
                email: string;
                businessName: string | null;
                id: string;
            };
            giftCard: {
                id: string;
                value: Decimal;
                code: string;
                currency: string;
            };
        } & {
            id: string;
            createdAt: Date;
            merchantId: string;
            amount: Decimal;
            giftCardId: string;
            notes: string | null;
            balanceBefore: Decimal;
            balanceAfter: Decimal;
            redemptionMethod: import(".prisma/client").$Enums.RedemptionMethod;
            location: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    /**
     * Get redemption history for a gift card
     */
    getGiftCardHistory(giftCardId: string): Promise<{
        giftCard: {
            id: any;
            code: any;
            value: number;
            balance: number;
            currency: any;
            status: any;
        };
        redemptions: ({
            merchant: {
                email: string;
                businessName: string | null;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            merchantId: string;
            amount: Decimal;
            giftCardId: string;
            notes: string | null;
            balanceBefore: Decimal;
            balanceAfter: Decimal;
            redemptionMethod: import(".prisma/client").$Enums.RedemptionMethod;
            location: string | null;
        })[];
        totalRedeemed: number;
    }>;
    /**
     * Check gift card balance
     */
    checkBalance(code: string): Promise<{
        code: any;
        balance: number;
        value: number;
        currency: any;
        status: string;
        expiryDate: any;
        allowPartialRedemption?: undefined;
    } | {
        code: any;
        balance: number;
        value: number;
        currency: any;
        status: any;
        expiryDate: any;
        allowPartialRedemption: any;
    }>;
    /**
     * Get transaction history
     */
    getTransactionHistory(giftCardId: string): Promise<{
        giftCard: {
            id: any;
            code: any;
            value: number;
            balance: number;
            currency: any;
        };
        transactions: ({
            user: {
                email: string;
                firstName: string | null;
                lastName: string | null;
                id: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.TransactionType;
            userId: string | null;
            amount: Decimal;
            giftCardId: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            balanceBefore: Decimal;
            balanceAfter: Decimal;
        })[];
    }>;
}
declare const _default: RedemptionService;
export default _default;
//# sourceMappingURL=redemption.service.d.ts.map