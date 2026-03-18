import prisma from '../../infrastructure/database';
import { Decimal } from '@prisma/client/runtime/library';

export class PayoutRepository {
  async createPayout(data: any) {
    return prisma.payout.create({ data });
  }

  async findPayoutByTransactionId(transactionId: string, payoutMethod: string) {
    return prisma.payout.findFirst({
      where: { transactionId, payoutMethod: payoutMethod as any },
    });
  }

  async findPayoutsByTransactionId(transactionId: string, payoutMethod: string) {
    return prisma.payout.findMany({
      where: { transactionId, payoutMethod: payoutMethod as any },
    });
  }

  async getPayoutStats() {
    const [totalPayouts, totalAmount, byStatus, recentPayouts] = await Promise.all([
      prisma.payout.count(),
      prisma.payout.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' as any },
      }),
      prisma.payout.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { amount: true },
      }),
      prisma.payout.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          merchant: { select: { id: true, email: true, businessName: true } },
        },
      }),
    ]);
    return { totalPayouts, totalAmount, byStatus, recentPayouts };
  }

  async findPayoutById(id: string) {
    return prisma.payout.findUnique({
      where: { id },
      include: {
        merchant: {
          select: { id: true, email: true, businessName: true },
        },
      },
    });
  }

  async updatePayout(id: string, data: any) {
    return prisma.payout.update({ where: { id }, data });
  }

  async findPayouts(where: any, skip: number, take: number) {
    return prisma.payout.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        merchant: {
          select: { id: true, email: true, businessName: true },
        },
      },
    });
  }

  async countPayouts(where: any) {
    return prisma.payout.count({ where });
  }

  async findScheduledPayouts() {
    return prisma.payout.findMany({
      where: { status: 'PENDING', scheduledFor: { lte: new Date() } } as any,
    });
  }

  async findFailedPayouts(maxRetries: number) {
    return prisma.payout.findMany({
      where: { status: 'FAILED', retryCount: { lt: maxRetries } },
      select: { id: true, merchantId: true, retryCount: true },
    });
  }

  async findPayoutSettings(merchantId: string) {
    return prisma.payoutSettings.findFirst({ where: { merchantId } });
  }

  async upsertPayoutSettings(merchantId: string, data: any) {
    const existing = await prisma.payoutSettings.findFirst({ where: { merchantId } });
    if (existing) {
      return prisma.payoutSettings.update({ where: { id: existing.id }, data });
    }
    return prisma.payoutSettings.create({ data: { merchantId, ...data } });
  }

  async getMerchantBalance(merchantId: string) {
    return prisma.user.findUnique({
      where: { id: merchantId },
      select: { merchantBalance: true },
    });
  }

  async updateMerchantBalance(merchantId: string, balance: Decimal) {
    return prisma.user.update({
      where: { id: merchantId },
      data: { merchantBalance: balance },
    });
  }

  async getCompletedRedemptionsAmount(merchantId: string) {
    const result = await prisma.redemption.aggregate({
      where: { merchantId },
      _sum: { amount: true },
    });
    return Number(result._sum.amount || 0);
  }

  async getCompletedPayoutsAmount(merchantId: string) {
    const result = await prisma.payout.aggregate({
      where: { merchantId, status: 'COMPLETED' },
      _sum: { amount: true },
    });
    return Number(result._sum.amount || 0);
  }

  async getMerchant(merchantId: string) {
    return prisma.user.findUnique({
      where: { id: merchantId },
      select: { id: true, role: true, merchantBalance: true },
    });
  }

  async aggregatePendingPayouts(merchantId: string) {
    return prisma.payout.aggregate({
      where: {
        merchantId,
        status: { in: ['PENDING', 'PROCESSING'] as any },
      },
      _sum: { amount: true },
    });
  }

  async findPayoutWithMerchantEmail(id: string) {
    return prisma.payout.findUnique({
      where: { id },
      include: {
        merchant: { select: { id: true, email: true } },
      },
    });
  }

  async createPayoutWithMerchant(data: any) {
    return prisma.payout.create({
      data,
      include: {
        merchant: { select: { id: true, email: true, businessName: true } },
      },
    });
  }
}
