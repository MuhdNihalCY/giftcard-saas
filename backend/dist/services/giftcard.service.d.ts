import { Decimal } from '@prisma/client/runtime/library';
import { GiftCardStatus } from '@prisma/client';
export interface CreateGiftCardData {
    merchantId: string;
    value: number;
    currency?: string;
    expiryDate?: Date;
    templateId?: string;
    customMessage?: string;
    recipientEmail?: string;
    recipientName?: string;
    allowPartialRedemption?: boolean;
}
export interface UpdateGiftCardData {
    value?: number;
    expiryDate?: Date;
    customMessage?: string;
    recipientEmail?: string;
    recipientName?: string;
    allowPartialRedemption?: boolean;
    status?: GiftCardStatus;
}
export declare class GiftCardService {
    /**
     * Create a new gift card
     */
    create(data: CreateGiftCardData): Promise<{
        merchant: {
            email: string;
            businessName: string | null;
            id: string;
        };
        template: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            merchantId: string;
            description: string | null;
            designData: import("@prisma/client/runtime/library").JsonValue;
            isPublic: boolean;
        } | null;
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
    }>;
    /**
     * Get gift card by ID
     */
    getById(id: string, userId?: string): Promise<{}>;
    /**
     * Get gift card by code
     */
    getByCode(code: string): Promise<{}>;
    /**
     * List gift cards with filters
     */
    list(filters: {
        merchantId?: string;
        status?: GiftCardStatus;
        page?: number;
        limit?: number;
    }): Promise<{}>;
    /**
     * Update gift card
     */
    update(id: string, data: UpdateGiftCardData, userId: string): Promise<{
        merchant: {
            email: string;
            businessName: string | null;
            id: string;
        };
        template: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            merchantId: string;
            description: string | null;
            designData: import("@prisma/client/runtime/library").JsonValue;
            isPublic: boolean;
        } | null;
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
    }>;
    /**
     * Delete gift card
     */
    delete(id: string, userId: string): Promise<{
        message: string;
    }>;
    /**
     * Update gift card status
     */
    updateStatus(id: string, status: GiftCardStatus): Promise<{
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
    }>;
    /**
     * Bulk create gift cards
     */
    bulkCreate(data: {
        merchantId: string;
        count: number;
        value: number;
        currency?: string;
        expiryDate?: Date;
        templateId?: string;
    }): Promise<{
        count: number;
        message: string;
    }>;
}
declare const _default: GiftCardService;
export default _default;
//# sourceMappingURL=giftcard.service.d.ts.map