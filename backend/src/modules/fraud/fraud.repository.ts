import prisma from '../../infrastructure/database';

export class FraudRepository {
  // Fraud blacklist operations
  async findBlacklistEntry(where: any) {
    return prisma.fraudBlacklist.findFirst({ where });
  }

  async createBlacklistEntry(data: any) {
    return prisma.fraudBlacklist.create({ data });
  }

  async updateBlacklistEntry(id: string, data: any) {
    return prisma.fraudBlacklist.update({ where: { id }, data });
  }

  async findBlacklistEntries(where: any, skip: number, take: number) {
    return prisma.fraudBlacklist.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async countBlacklistEntries(where: any) {
    return prisma.fraudBlacklist.count({ where });
  }

  async deleteBlacklistEntry(id: string) {
    return prisma.fraudBlacklist.delete({ where: { id } });
  }

  // Redemption pattern checks
  async getRedemptionsByGiftCard(giftCardId: string, since: Date) {
    return prisma.redemption.findMany({
      where: { giftCardId, createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRedemptionsByMerchant(merchantId: string, since: Date) {
    return prisma.redemption.findMany({
      where: { merchantId, createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
