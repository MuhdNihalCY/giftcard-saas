import breakageService from './breakage.service';
import { AnalyticsRepository } from '../modules/analytics/analytics.repository';

export interface AnalyticsFilters {
  merchantId?: string;
  startDate?: Date;
  endDate?: Date;
  groupBy?: 'day' | 'week' | 'month' | 'year';
}

export class AnalyticsService {
  private readonly repository = new AnalyticsRepository();

  /**
   * Get sales analytics
   */
  async getSalesAnalytics(filters: AnalyticsFilters) {
    const { merchantId, startDate, endDate } = filters;

    const where: any = {
      status: 'COMPLETED',
    };

    if (merchantId) {
      where.giftCard = { merchantId };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const payments = await this.repository.getPayments(where);

    const totalRevenue = payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );

    const revenueByMethod = payments.reduce((acc, p) => {
      acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + Number(p.amount);
      return acc;
    }, {} as Record<string, number>);

    const revenueByCurrency = payments.reduce((acc, p) => {
      acc[p.currency] = (acc[p.currency] || 0) + Number(p.amount);
      return acc;
    }, {} as Record<string, number>);

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
  async getRedemptionAnalytics(filters: AnalyticsFilters) {
    const { merchantId, startDate, endDate } = filters;

    const where: any = {};

    if (merchantId) {
      where.merchantId = merchantId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const redemptions = await this.repository.getRedemptions(where, 0, 10000);

    const totalRedeemed = redemptions.reduce(
      (sum, r) => sum + Number(r.amount),
      0
    );

    const redemptionByMethod = redemptions.reduce((acc, r) => {
      acc[r.redemptionMethod] = (acc[r.redemptionMethod] || 0) + Number(r.amount);
      return acc;
    }, {} as Record<string, number>);

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
  async getCustomerAnalytics(filters: AnalyticsFilters) {
    const { merchantId, startDate, endDate } = filters;

    const where: any = {};

    if (merchantId) {
      where.giftCard = { merchantId };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const payments = await this.repository.getCustomerPayments({
      ...where,
      status: 'COMPLETED',
      customerId: { not: null },
    });

    const uniqueCustomers = new Set(payments.map((p) => p.customerId).filter(Boolean));
    const customerCount = uniqueCustomers.size;

    const customerSpending = payments.reduce((acc, p) => {
      if (p.customerId) {
        acc[p.customerId] = (acc[p.customerId] || 0) + Number(p.amount);
      }
      return acc;
    }, {} as Record<string, number>);

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
  async getGiftCardStats(filters: AnalyticsFilters) {
    const { merchantId } = filters;

    const where: any = {};
    if (merchantId) where.merchantId = merchantId;

    const [total, active, redeemed, expired, cancelled] = await Promise.all([
      this.repository.countGiftCards(where),
      this.repository.countGiftCards({ ...where, status: 'ACTIVE' }),
      this.repository.countGiftCards({ ...where, status: 'REDEEMED' }),
      this.repository.countGiftCards({ ...where, status: 'EXPIRED' }),
      this.repository.countGiftCards({ ...where, status: 'CANCELLED' }),
    ]);

    const giftCards = await this.repository.getGiftCardsValueSelect(where);

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

  /**
   * Get breakage analytics
   */
  async getBreakageAnalytics(filters: AnalyticsFilters) {
    const { merchantId, startDate, endDate } = filters;

    const calculations = await breakageService.calculateBreakage(merchantId, startDate, endDate);
    const metrics = merchantId ? await breakageService.getBreakageMetrics(merchantId) : null;

    return {
      calculations,
      metrics,
    };
  }
}

export default new AnalyticsService();
