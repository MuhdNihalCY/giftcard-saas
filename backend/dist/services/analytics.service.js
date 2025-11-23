"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const database_1 = __importDefault(require("../config/database"));
class AnalyticsService {
    /**
     * Get sales analytics
     */
    async getSalesAnalytics(filters) {
        const { merchantId, startDate, endDate } = filters;
        const where = {
            status: 'COMPLETED',
        };
        if (merchantId) {
            where.giftCard = { merchantId };
        }
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        const payments = await database_1.default.payment.findMany({
            where,
            include: {
                giftCard: {
                    select: {
                        id: true,
                        code: true,
                        merchantId: true,
                    },
                },
            },
        });
        const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const revenueByMethod = payments.reduce((acc, p) => {
            acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + Number(p.amount);
            return acc;
        }, {});
        const revenueByCurrency = payments.reduce((acc, p) => {
            acc[p.currency] = (acc[p.currency] || 0) + Number(p.amount);
            return acc;
        }, {});
        const totalTransactions = payments.length;
        return {
            totalRevenue,
            totalTransactions,
            averageTransactionValue: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
            revenueByMethod,
            revenueByCurrency,
            payments: payments.slice(0, 10), // Latest 10
        };
    }
    /**
     * Get redemption analytics
     */
    async getRedemptionAnalytics(filters) {
        const { merchantId, startDate, endDate } = filters;
        const where = {};
        if (merchantId) {
            where.merchantId = merchantId;
        }
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        const redemptions = await database_1.default.redemption.findMany({
            where,
            include: {
                giftCard: {
                    select: {
                        id: true,
                        code: true,
                        value: true,
                        currency: true,
                    },
                },
            },
        });
        const totalRedeemed = redemptions.reduce((sum, r) => sum + Number(r.amount), 0);
        const redemptionByMethod = redemptions.reduce((acc, r) => {
            acc[r.redemptionMethod] = (acc[r.redemptionMethod] || 0) + Number(r.amount);
            return acc;
        }, {});
        const totalRedemptions = redemptions.length;
        const averageRedemptionValue = totalRedemptions > 0 ? totalRedeemed / totalRedemptions : 0;
        return {
            totalRedeemed,
            totalRedemptions,
            averageRedemptionValue,
            redemptionByMethod,
            redemptions: redemptions.slice(0, 10), // Latest 10
        };
    }
    /**
     * Get customer analytics
     */
    async getCustomerAnalytics(filters) {
        const { merchantId, startDate, endDate } = filters;
        const where = {};
        if (merchantId) {
            where.giftCard = { merchantId };
        }
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        const payments = await database_1.default.payment.findMany({
            where: {
                ...where,
                status: 'COMPLETED',
                customerId: { not: null },
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        const uniqueCustomers = new Set(payments.map((p) => p.customerId).filter(Boolean));
        const customerCount = uniqueCustomers.size;
        const customerSpending = payments.reduce((acc, p) => {
            if (p.customerId) {
                acc[p.customerId] = (acc[p.customerId] || 0) + Number(p.amount);
            }
            return acc;
        }, {});
        const topCustomers = Object.entries(customerSpending)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([customerId, total]) => {
            const payment = payments.find((p) => p.customerId === customerId);
            return {
                customerId,
                customer: payment?.customer,
                totalSpent: total,
                transactionCount: payments.filter((p) => p.customerId === customerId).length,
            };
        });
        return {
            totalCustomers: customerCount,
            totalTransactions: payments.length,
            averageSpendingPerCustomer: customerCount > 0
                ? payments.reduce((sum, p) => sum + Number(p.amount), 0) / customerCount
                : 0,
            topCustomers,
        };
    }
    /**
     * Get gift card statistics
     */
    async getGiftCardStats(filters) {
        const { merchantId } = filters;
        const where = {};
        if (merchantId)
            where.merchantId = merchantId;
        const [total, active, redeemed, expired, cancelled] = await Promise.all([
            database_1.default.giftCard.count({ where }),
            database_1.default.giftCard.count({ where: { ...where, status: 'ACTIVE' } }),
            database_1.default.giftCard.count({ where: { ...where, status: 'REDEEMED' } }),
            database_1.default.giftCard.count({ where: { ...where, status: 'EXPIRED' } }),
            database_1.default.giftCard.count({ where: { ...where, status: 'CANCELLED' } }),
        ]);
        const giftCards = await database_1.default.giftCard.findMany({
            where,
            select: {
                value: true,
                balance: true,
                currency: true,
                status: true,
            },
        });
        const totalValue = giftCards.reduce((sum, gc) => sum + Number(gc.value), 0);
        const totalOutstanding = giftCards.reduce((sum, gc) => sum + Number(gc.balance), 0);
        const totalRedeemed = totalValue - totalOutstanding;
        return {
            total,
            active,
            redeemed,
            expired,
            cancelled,
            totalValue,
            totalOutstanding,
            totalRedeemed,
            redemptionRate: total > 0 ? (redeemed / total) * 100 : 0,
        };
    }
}
exports.AnalyticsService = AnalyticsService;
exports.default = new AnalyticsService();
//# sourceMappingURL=analytics.service.js.map