import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../config/database';
import logger from '../utils/logger';

export interface BreakageCalculation {
  totalIssued: number;
  totalRedeemed: number;
  totalUnredeemed: number;
  totalExpired: number;
  totalExpiredUnredeemed: number;
  breakageAmount: number; // Unredeemed after expiry + grace period
  breakagePercentage: number; // Breakage / total issued
  gracePeriodDays: number;
}

export interface BreakageReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  merchantId?: string;
  calculations: BreakageCalculation;
  expiredCards: Array<{
    id: string;
    code: string;
    value: number;
    balance: number;
    expiryDate: Date;
    expiredDate: Date;
    gracePeriodEndDate: Date;
  }>;
}

// Grace period: 30 days after expiry (as per SRS Section 3.3.2)
const GRACE_PERIOD_DAYS = 30;

export class BreakageService {
  /**
   * Calculate breakage for a merchant or all merchants
   */
  async calculateBreakage(
    merchantId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<BreakageCalculation> {
    const now = new Date();
    const gracePeriodEndDate = new Date(now.getTime() - GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);

    const where: any = {};
    if (merchantId) {
      where.merchantId = merchantId;
    }

    // Get all gift cards
    const allGiftCards = await prisma.giftCard.findMany({
      where,
      select: {
        id: true,
        value: true,
        balance: true,
        status: true,
        expiryDate: true,
        createdAt: true,
      },
    });

    let totalIssued = 0;
    let totalRedeemed = 0;
    let totalUnredeemed = 0;
    let totalExpired = 0;
    let totalExpiredUnredeemed = 0;
    let breakageAmount = 0;

    for (const card of allGiftCards) {
      const value = Number(card.value);
      const balance = Number(card.balance);

      totalIssued += value;

      if (card.status === 'REDEEMED') {
        totalRedeemed += value;
      } else {
        totalUnredeemed += balance;
      }

      if (card.status === 'EXPIRED' || (card.expiryDate && card.expiryDate < now)) {
        totalExpired += value;

        // Check if expired and past grace period
        if (card.expiryDate && card.expiryDate < gracePeriodEndDate) {
          // This is breakage - expired and past grace period
          totalExpiredUnredeemed += balance;
          breakageAmount += balance;
        }
      }
    }

    const breakagePercentage = totalIssued > 0 ? (breakageAmount / totalIssued) * 100 : 0;

    return {
      totalIssued,
      totalRedeemed,
      totalUnredeemed,
      totalExpired,
      totalExpiredUnredeemed,
      breakageAmount,
      breakagePercentage,
      gracePeriodDays: GRACE_PERIOD_DAYS,
    };
  }

  /**
   * Generate breakage report for a specific period
   */
  async generateBreakageReport(
    merchantId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<BreakageReport> {
    const now = new Date();
    const gracePeriodEndDate = new Date(now.getTime() - GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);

    // Default to last 30 days if no dates provided
    if (!startDate) {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    if (!endDate) {
      endDate = now;
    }

    const where: any = {
      expiryDate: {
        lte: gracePeriodEndDate, // Expired and past grace period
      },
      status: {
        in: ['EXPIRED', 'ACTIVE'], // Include expired and potentially expired active cards
      },
    };

    if (merchantId) {
      where.merchantId = merchantId;
    }

    // Get expired cards past grace period
    const expiredCards = await prisma.giftCard.findMany({
      where,
      select: {
        id: true,
        code: true,
        value: true,
        balance: true,
        expiryDate: true,
      },
    });

    const expiredCardsDetails = expiredCards.map((card) => {
      const expiryDate = card.expiryDate || new Date();
      const gracePeriodEnd = new Date(expiryDate.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);

      return {
        id: card.id,
        code: card.code,
        value: Number(card.value),
        balance: Number(card.balance),
        expiryDate,
        expiredDate: expiryDate,
        gracePeriodEndDate: gracePeriodEnd,
      };
    });

    const calculations = await this.calculateBreakage(merchantId, startDate, endDate);

    return {
      period: {
        startDate,
        endDate,
      },
      merchantId,
      calculations,
      expiredCards: expiredCardsDetails,
    };
  }

  /**
   * Get breakage metrics for merchant dashboard
   */
  async getBreakageMetrics(merchantId: string) {
    const calculations = await this.calculateBreakage(merchantId);

    // Get trends (compare with previous period)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Calculate breakage for previous 30 days
    const previousPeriodCards = await prisma.giftCard.findMany({
      where: {
        merchantId,
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
      },
      select: {
        value: true,
        balance: true,
        status: true,
        expiryDate: true,
      },
    });

    let previousBreakage = 0;
    let previousIssued = 0;
    const gracePeriodEndDate = new Date(now.getTime() - GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);

    for (const card of previousPeriodCards) {
      previousIssued += Number(card.value);
      if (
        card.status === 'EXPIRED' &&
        card.expiryDate &&
        card.expiryDate < gracePeriodEndDate
      ) {
        previousBreakage += Number(card.balance);
      }
    }

    const previousBreakagePercentage =
      previousIssued > 0 ? (previousBreakage / previousIssued) * 100 : 0;

    const breakageTrend =
      calculations.breakagePercentage - previousBreakagePercentage;

    return {
      current: {
        breakageAmount: calculations.breakageAmount,
        breakagePercentage: calculations.breakagePercentage,
        totalIssued: calculations.totalIssued,
        totalUnredeemed: calculations.totalUnredeemed,
      },
      previous: {
        breakageAmount: previousBreakage,
        breakagePercentage: previousBreakagePercentage,
        totalIssued: previousIssued,
      },
      trend: {
        breakageAmountChange: calculations.breakageAmount - previousBreakage,
        breakagePercentageChange: breakageTrend,
        trendDirection: breakageTrend > 0 ? 'increasing' : breakageTrend < 0 ? 'decreasing' : 'stable',
      },
    };
  }

  /**
   * Get expired gift cards report
   */
  async getExpiredCardsReport(merchantId?: string, includeBreakage: boolean = false) {
    const now = new Date();
    const where: any = {
      status: 'EXPIRED',
    };

    if (merchantId) {
      where.merchantId = merchantId;
    }

    if (includeBreakage) {
      // Only include cards past grace period
      const gracePeriodEndDate = new Date(now.getTime() - GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
      where.expiryDate = {
        lte: gracePeriodEndDate,
      };
    }

    const expiredCards = await prisma.giftCard.findMany({
      where,
      select: {
        id: true,
        code: true,
        value: true,
        balance: true,
        expiryDate: true,
        createdAt: true,
        merchant: {
          select: {
            id: true,
            businessName: true,
          },
        },
      },
      orderBy: {
        expiryDate: 'desc',
      },
    });

    return expiredCards.map((card) => ({
      id: card.id,
      code: card.code,
      value: Number(card.value),
      balance: Number(card.balance),
      expiryDate: card.expiryDate,
      createdAt: card.createdAt,
      merchant: card.merchant,
      gracePeriodEndDate: card.expiryDate
        ? new Date(card.expiryDate.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000)
        : null,
      isBreakage: card.expiryDate
        ? card.expiryDate < new Date(now.getTime() - GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000)
        : false,
    }));
  }
}

export default new BreakageService();




