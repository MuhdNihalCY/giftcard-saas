import prisma from '../../infrastructure/database';

export class AdminRepository {
  // Audit log operations
  async createAuditLog(data: {
    userId?: string;
    userEmail?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
  }) {
    return prisma.auditLog.create({ data });
  }

  async getAuditLogs(where: any, skip: number, take: number) {
    return prisma.auditLog.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async countAuditLogs(where: any) {
    return prisma.auditLog.count({ where });
  }

  // Feature flag operations — uses featureKey as unique identifier
  async findFeatureFlag(featureKey: string) {
    return prisma.featureFlag.findUnique({ where: { featureKey } });
  }

  async findAllFeatureFlags() {
    return prisma.featureFlag.findMany({ orderBy: { featureName: 'asc' } });
  }

  async upsertFeatureFlag(featureKey: string, data: any) {
    return prisma.featureFlag.upsert({
      where: { featureKey },
      update: data,
      create: { featureKey, ...data },
    });
  }

  async deleteFeatureFlag(featureKey: string) {
    return prisma.featureFlag.delete({ where: { featureKey } });
  }

  // Blacklist operations — model is FraudBlacklist
  async createBlacklistEntry(data: any) {
    return prisma.fraudBlacklist.create({ data });
  }

  async findBlacklistEntry(where: any) {
    return prisma.fraudBlacklist.findFirst({ where });
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

  // Communication settings operations
  async getCommunicationSettings() {
    return prisma.communicationSettings.findFirst();
  }

  async upsertCommunicationSettings(data: any) {
    const existing = await prisma.communicationSettings.findFirst();
    if (existing) {
      return prisma.communicationSettings.update({ where: { id: existing.id }, data });
    }
    return prisma.communicationSettings.create({ data });
  }

  // Communication log operations
  async createCommunicationLog(data: any) {
    return prisma.communicationLog.create({ data });
  }

  async getCommunicationLogs(where: any, skip: number, take: number) {
    return prisma.communicationLog.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async countCommunicationLogs(where: any) {
    return prisma.communicationLog.count({ where });
  }

  // Blacklist update operations
  async updateBlacklistEntry(id: string, data: any) {
    return prisma.fraudBlacklist.update({ where: { id }, data });
  }

  // Feature flag statistics
  async countFeatureFlags(where?: any) {
    return prisma.featureFlag.count({ where });
  }

  async groupByFeatureFlags(by: string[]) {
    return (prisma.featureFlag.groupBy as any)({ by, _count: true });
  }

  // Audit log groupBy statistics
  async groupByAuditLogs(
    by: string[],
    where: any,
    options?: { take?: number; orderBy?: any }
  ) {
    return (prisma.auditLog.groupBy as any)({
      by,
      where,
      _count: true,
      ...(options?.take !== undefined ? { take: options.take } : {}),
      ...(options?.orderBy !== undefined ? { orderBy: options.orderBy } : {}),
    });
  }
}
