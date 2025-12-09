import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';

export type BlacklistType = 'EMAIL' | 'IP' | 'PHONE' | 'PAYMENT_METHOD' | 'USER_ID';
export type BlacklistSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CreateBlacklistEntryData {
  type: BlacklistType;
  value: string;
  reason?: string;
  severity?: BlacklistSeverity;
  autoBlock?: boolean;
  expiresAt?: Date;
  createdBy?: string;
  metadata?: Record<string, unknown>;
}

export interface BlacklistCheckResult {
  isBlacklisted: boolean;
  entry?: {
    id: string;
    type: BlacklistType;
    value: string;
    reason?: string;
    severity: BlacklistSeverity;
    autoBlock: boolean;
    expiresAt?: Date;
  };
}

export class BlacklistService {
  /**
   * Check if a value is blacklisted
   */
  async checkBlacklist(
    type: BlacklistType,
    value: string
  ): Promise<BlacklistCheckResult> {
    const normalizedValue = this.normalizeValue(type, value);

    const entry = await prisma.fraudBlacklist.findFirst({
      where: {
        type,
        value: normalizedValue,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!entry) {
      return { isBlacklisted: false };
    }

    return {
      isBlacklisted: true,
      entry: {
        id: entry.id,
        type: entry.type as BlacklistType,
        value: entry.value,
        reason: entry.reason || undefined,
        severity: entry.severity as BlacklistSeverity,
        autoBlock: entry.autoBlock,
        expiresAt: entry.expiresAt || undefined,
      },
    };
  }

  /**
   * Check multiple values at once
   */
  async checkMultiple(
    checks: Array<{ type: BlacklistType; value: string }>
  ): Promise<BlacklistCheckResult> {
    for (const check of checks) {
      const result = await this.checkBlacklist(check.type, check.value);
      if (result.isBlacklisted) {
        return result;
      }
    }
    return { isBlacklisted: false };
  }

  /**
   * Add entry to blacklist
   */
  async addToBlacklist(data: CreateBlacklistEntryData) {
    const normalizedValue = this.normalizeValue(data.type, data.value);

    // Check if already exists
    const existing = await prisma.fraudBlacklist.findUnique({
      where: { value: normalizedValue },
    });

    if (existing) {
      throw new ValidationError('Entry already exists in blacklist');
    }

    const entry = await prisma.fraudBlacklist.create({
      data: {
        type: data.type,
        value: normalizedValue,
        reason: data.reason,
        severity: data.severity || 'HIGH',
        autoBlock: data.autoBlock !== false,
        expiresAt: data.expiresAt,
        createdBy: data.createdBy,
        metadata: data.metadata || {},
      },
    });

    logger.info('Entry added to blacklist', {
      id: entry.id,
      type: entry.type,
      value: entry.value,
      severity: entry.severity,
    });

    return entry;
  }

  /**
   * Remove entry from blacklist
   */
  async removeFromBlacklist(id: string) {
    const entry = await prisma.fraudBlacklist.findUnique({
      where: { id },
    });

    if (!entry) {
      throw new NotFoundError('Blacklist entry not found');
    }

    await prisma.fraudBlacklist.delete({
      where: { id },
    });

    logger.info('Entry removed from blacklist', { id, type: entry.type, value: entry.value });

    return entry;
  }

  /**
   * Update blacklist entry
   */
  async updateBlacklistEntry(
    id: string,
    data: Partial<CreateBlacklistEntryData>
  ) {
    const entry = await prisma.fraudBlacklist.findUnique({
      where: { id },
    });

    if (!entry) {
      throw new NotFoundError('Blacklist entry not found');
    }

    const updateData: any = {};
    if (data.reason !== undefined) updateData.reason = data.reason;
    if (data.severity !== undefined) updateData.severity = data.severity;
    if (data.autoBlock !== undefined) updateData.autoBlock = data.autoBlock;
    if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;

    return prisma.fraudBlacklist.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Get all blacklist entries
   */
  async getBlacklistEntries(filters: {
    type?: BlacklistType;
    severity?: BlacklistSeverity;
    activeOnly?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { type, severity, activeOnly = false, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) where.type = type;
    if (severity) where.severity = severity;
    if (activeOnly) {
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ];
    }

    const [entries, total] = await Promise.all([
      prisma.fraudBlacklist.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.fraudBlacklist.count({ where }),
    ]);

    return {
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Normalize value based on type
   */
  private normalizeValue(type: BlacklistType, value: string): string {
    switch (type) {
      case 'EMAIL':
        return value.toLowerCase().trim();
      case 'IP':
        return value.trim();
      case 'PHONE':
        return value.replace(/\s/g, '').replace(/[^\d+]/g, '');
      case 'PAYMENT_METHOD':
      case 'USER_ID':
        return value.trim();
      default:
        return value.trim();
    }
  }

  /**
   * Auto-add to blacklist based on fraud detection
   */
  async autoBlacklist(
    type: BlacklistType,
    value: string,
    reason: string,
    severity: BlacklistSeverity = 'HIGH'
  ) {
    try {
      const normalizedValue = this.normalizeValue(type, value);

      // Check if already exists
      const existing = await prisma.fraudBlacklist.findUnique({
        where: { value: normalizedValue },
      });

      if (existing) {
        // Update severity if new one is higher
        const severityLevels = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
        const currentLevel = severityLevels[existing.severity as BlacklistSeverity];
        const newLevel = severityLevels[severity];

        if (newLevel > currentLevel) {
          await prisma.fraudBlacklist.update({
            where: { id: existing.id },
            data: {
              severity,
              reason: `${existing.reason || ''}\n${reason}`.trim(),
            },
          });
        }
        return existing;
      }

      return await this.addToBlacklist({
        type,
        value: normalizedValue,
        reason,
        severity,
        autoBlock: true,
      });
    } catch (error: any) {
      logger.error('Failed to auto-blacklist', { type, value, error: error.message });
      throw error;
    }
  }
}

export default new BlacklistService();








