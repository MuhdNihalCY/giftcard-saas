import { Decimal } from '@prisma/client/runtime/library';
export interface AnalyticsFilters {
    merchantId?: string;
    startDate?: Date;
    endDate?: Date;
    groupBy?: 'day' | 'week' | 'month' | 'year';
}
export declare class AnalyticsService {
    /**
     * Get sales analytics
     */
    getSalesAnalytics(filters: AnalyticsFilters): Promise<{
        totalRevenue: number;
        totalTransactions: number;
        averageTransactionValue: number;
        revenueByMethod: Record<string, number>;
        revenueByCurrency: Record<string, number>;
        payments: ({
            giftCard: {
                id: string;
                code: string;
                merchantId: string;
            };
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
    }>;
    /**
     * Get redemption analytics
     */
    getRedemptionAnalytics(filters: AnalyticsFilters): Promise<{
        totalRedeemed: number;
        totalRedemptions: number;
        averageRedemptionValue: number;
        redemptionByMethod: Record<string, number>;
        redemptions: ({
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
    }>;
    /**
     * Get customer analytics
     */
    getCustomerAnalytics(filters: AnalyticsFilters): Promise<{
        totalCustomers: number;
        totalTransactions: number;
        averageSpendingPerCustomer: number;
        topCustomers: {
            customerId: string;
            customer: {
                email: string;
                firstName: string | null;
                lastName: string | null;
                id: string;
            } | null | undefined;
            totalSpent: number;
            transactionCount: number;
        }[];
    }>;
    /**
     * Get gift card statistics
     */
    getGiftCardStats(filters: AnalyticsFilters): Promise<{
        total: number;
        active: number;
        redeemed: number;
        expired: number;
        cancelled: number;
        totalValue: number;
        totalOutstanding: number;
        totalRedeemed: number;
        redemptionRate: number;
    }>;
}
declare const _default: AnalyticsService;
export default _default;
//# sourceMappingURL=analytics.service.d.ts.map