import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../../infrastructure/database';

export class RedemptionRepository {
  async createRedemption(data: {
    giftCardId: string;
    merchantId: string;
    amount: Decimal;
    balanceBefore: Decimal;
    balanceAfter: Decimal;
    redemptionMethod: string;
    location?: string;
    notes?: string;
  }) {
    return prisma.redemption.create({
      data: data as any,
      include: {
        giftCard: {
          select: { id: true, code: true, value: true, currency: true },
        },
        merchant: {
          select: { id: true, email: true, businessName: true },
        },
      },
    });
  }

  async createTransaction(data: {
    giftCardId: string;
    type: string;
    amount: Decimal;
    balanceBefore: Decimal;
    balanceAfter: Decimal;
    userId: string;
    metadata?: any;
  }) {
    return prisma.transaction.create({ data: data as any });
  }

  async findById(id: string) {
    return prisma.redemption.findUnique({
      where: { id },
      include: {
        giftCard: {
          include: {
            merchant: {
              select: { id: true, email: true, businessName: true },
            },
          },
        },
        merchant: {
          select: { id: true, email: true, businessName: true },
        },
      },
    });
  }

  async findMany(where: any, skip: number, take: number) {
    return prisma.redemption.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        giftCard: {
          select: { id: true, code: true, value: true, currency: true },
        },
        merchant: {
          select: { id: true, email: true, businessName: true },
        },
      },
    });
  }

  async count(where: any) {
    return prisma.redemption.count({ where });
  }

  async findByGiftCard(giftCardId: string) {
    return prisma.redemption.findMany({
      where: { giftCardId },
      orderBy: { createdAt: 'desc' },
      include: {
        merchant: {
          select: { id: true, email: true, businessName: true },
        },
      },
    });
  }

  async getMerchantBalance(merchantId: string) {
    return prisma.user.findUnique({
      where: { id: merchantId },
      select: { merchantBalance: true },
    });
  }

  async updateMerchantBalance(merchantId: string, newBalance: Decimal) {
    return prisma.user.update({
      where: { id: merchantId },
      data: { merchantBalance: newBalance },
    });
  }

  async getTransactions(giftCardId: string) {
    return prisma.transaction.findMany({
      where: { giftCardId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async findForSearch(where: any) {
    return prisma.redemption.findMany({
      where,
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        giftCard: { select: { code: true } },
      },
    });
  }

  async updateGiftCardBalance(giftCardId: string, balance: Decimal, status: string) {
    return prisma.giftCard.update({
      where: { id: giftCardId },
      data: { balance, status: status as any },
    });
  }
}
