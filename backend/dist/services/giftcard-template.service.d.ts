export interface CreateTemplateData {
    merchantId: string;
    name: string;
    description?: string;
    designData: {
        colors?: {
            primary?: string;
            secondary?: string;
            background?: string;
            text?: string;
        };
        images?: {
            logo?: string;
            background?: string;
        };
        layout?: string;
    };
    isPublic?: boolean;
}
export interface UpdateTemplateData {
    name?: string;
    description?: string;
    designData?: {
        colors?: {
            primary?: string;
            secondary?: string;
            background?: string;
            text?: string;
        };
        images?: {
            logo?: string;
            background?: string;
        };
        layout?: string;
    };
    isPublic?: boolean;
}
export declare class GiftCardTemplateService {
    /**
     * Create a new template
     */
    create(data: CreateTemplateData): Promise<{
        merchant: {
            email: string;
            businessName: string | null;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        merchantId: string;
        description: string | null;
        designData: import("@prisma/client/runtime/library").JsonValue;
        isPublic: boolean;
    }>;
    /**
     * Get template by ID
     */
    getById(id: string): Promise<{
        merchant: {
            email: string;
            businessName: string | null;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        merchantId: string;
        description: string | null;
        designData: import("@prisma/client/runtime/library").JsonValue;
        isPublic: boolean;
    }>;
    /**
     * List templates
     */
    list(filters: {
        merchantId?: string;
        isPublic?: boolean;
        page?: number;
        limit?: number;
    }): Promise<{
        templates: ({
            merchant: {
                email: string;
                businessName: string | null;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            merchantId: string;
            description: string | null;
            designData: import("@prisma/client/runtime/library").JsonValue;
            isPublic: boolean;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    /**
     * Update template
     */
    update(id: string, data: UpdateTemplateData, userId: string): Promise<{
        merchant: {
            email: string;
            businessName: string | null;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        merchantId: string;
        description: string | null;
        designData: import("@prisma/client/runtime/library").JsonValue;
        isPublic: boolean;
    }>;
    /**
     * Delete template
     */
    delete(id: string, userId: string): Promise<{
        message: string;
    }>;
}
declare const _default: GiftCardTemplateService;
export default _default;
//# sourceMappingURL=giftcard-template.service.d.ts.map