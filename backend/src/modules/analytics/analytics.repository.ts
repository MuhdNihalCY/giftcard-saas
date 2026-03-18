import prisma from '../../infrastructure/database';

export class AnalyticsRepository {
  async getPayments(where: any) {
    return prisma.payment.findMany({
      where,
      include: {
        giftCard: {
          select: { id: true, code: true, merchantId: true },
        },
      },
    });
  }

  async getRedemptions(where: any, skip: number, take: number) {
    return prisma.redemption.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        giftCard: {
          select: { id: true, code: true, merchantId: true, currency: true },
        },
      },
    });
  }

  async countRedemptions(where: any) {
    return prisma.redemption.count({ where });
  }

  async getGiftCards(where: any) {
    return prisma.giftCard.findMany({
      where,
      select: {
        id: true,
        value: true,
        balance: true,
        status: true,
        currency: true,
        createdAt: true,
        expiryDate: true,
      },
    });
  }

  async countGiftCards(where: any) {
    return prisma.giftCard.count({ where });
  }

  async getBreakageGiftCards(where: any) {
    return prisma.giftCard.findMany({
      where,
      select: {
        id: true,
        code: true,
        value: true,
        balance: true,
        expiryDate: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async getCustomerPayments(where: any) {
    return prisma.payment.findMany({
      where,
      include: {
        customer: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async getGiftCardsValueSelect(where: any) {
    return prisma.giftCard.findMany({
      where,
      select: {
        value: true,
        balance: true,
        currency: true,
        status: true,
      },
    });
  }

  async getExpiredCardsReport(where: any) {
    return prisma.giftCard.findMany({
      where,
      select: {
        id: true,
        code: true,
        value: true,
        balance: true,
        expiryDate: true,
        createdAt: true,
        merchant: {
          select: { id: true, businessName: true },
        },
      },
      orderBy: { expiryDate: 'desc' },
    });
  }

  async getBreakageMetricCards(where: any) {
    return prisma.giftCard.findMany({
      where,
      select: {
        value: true,
        balance: true,
        status: true,
        expiryDate: true,
      },
    });
  }
}
