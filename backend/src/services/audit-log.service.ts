/**
 * Audit Log Service
 * Tracks all sensitive operations for security and compliance
 */

import { AdminRepository } from '../modules/admin/admin.repository';
import logger from '../utils/logger';
import type { Prisma } from '@prisma/client';

export interface AuditLogData {
  userId?: string;
  userEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export class AuditLogService {
  private readonly repository = new AdminRepository();

  /**
   * Create an audit log entry
   */
  async log(data: AuditLogData): Promise<void> {
    try {
      await this.repository.createAuditLog({
        userId: data.userId,
        userEmail: data.userEmail,
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: data.metadata || {},
      });
    } catch (error: unknown) {
      // Don't throw - audit logging should never break the main flow
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to create audit log', { error: errorMessage, data });
    }
  }

  /**
   * Log authentication events
   */
  async logAuth(action: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'TOKEN_REFRESH', data: {
    userId?: string;
    userEmail?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await this.log({
      ...data,
      action,
      resourceType: 'Auth',
    });
  }

  /**
   * Log payment events
   */
  async logPayment(action: 'PAYMENT_CREATED' | 'PAYMENT_COMPLETED' | 'PAYMENT_FAILED' | 'PAYMENT_REFUNDED', data: {
    userId?: string;
    userEmail?: string;
    resourceId: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await this.log({
      ...data,
      action,
      resourceType: 'Payment',
    });
  }

  /**
   * Log gift card events
   */
  async logGiftCard(action: 'GIFT_CARD_CREATED' | 'GIFT_CARD_UPDATED' | 'GIFT_CARD_DELETED' | 'GIFT_CARD_REDEEMED', data: {
    userId?: string;
    userEmail?: string;
    resourceId: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await this.log({
      ...data,
      action,
      resourceType: 'GiftCard',
    });
  }

  /**
   * Log user management events
   */
  async logUser(action: 'USER_CREATED' | 'USER_UPDATED' | 'USER_DELETED' | 'USER_DEACTIVATED' | 'USER_ACTIVATED', data: {
    userId?: string;
    userEmail?: string;
    resourceId: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await this.log({
      ...data,
      action,
      resourceType: 'User',
    });
  }

  /**
   * Log admin actions
   */
  async logAdmin(action: string, data: {
    userId: string;
    userEmail?: string;
    resourceType: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await this.log({
      ...data,
      action: `ADMIN_${action}`,
    });
  }

  /**
   * Query audit logs with filters
   */
  async query(filters: {
    userId?: string;
    action?: string;
    resourceType?: string;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const {
      userId,
      action,
      resourceType,
      resourceId,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = filters;

    const skip = (page - 1) * limit;

    const where: {
      userId?: string;
      action?: string;
      resourceType?: string;
      resourceId?: string;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (resourceType) where.resourceType = resourceType;
    if (resourceId) where.resourceId = resourceId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      this.repository.getAuditLogs(where, skip, limit),
      this.repository.countAuditLogs(where),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * List audit logs with filters and pagination
   */
  async list(filters: {
    userId?: string;
    userEmail?: string;
    action?: string;
    resourceType?: string;
    startDate?: Date;
    endDate?: Date;
    ipAddress?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      userId,
      userEmail,
      action,
      resourceType,
      startDate,
      endDate,
      ipAddress,
      page = 1,
      limit = 50,
    } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (userId) where.userId = userId;
    if (userEmail) where.userEmail = { contains: userEmail, mode: 'insensitive' };
    if (action) where.action = action;
    if (resourceType) where.resourceType = resourceType;
    if (ipAddress) where.ipAddress = { contains: ipAddress };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      this.repository.getAuditLogs(where, skip, limit),
      this.repository.countAuditLogs(where),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get audit log statistics
   */
  async getStatistics(filters?: {
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: Prisma.AuditLogWhereInput = {};
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const [
      total,
      byAction,
      byResourceType,
      recentActivity,
    ] = await Promise.all([
      this.repository.countAuditLogs(where),
      this.repository.groupByAuditLogs(['action'], where, {
        take: 10,
        orderBy: { _count: { action: 'desc' } },
      }),
      this.repository.groupByAuditLogs(['resourceType'], where, {
        orderBy: { _count: { resourceType: 'desc' } },
      }),
      this.repository.getAuditLogs({ ...where }, 0, 20),
    ]);

    return {
      total,
      byAction: byAction.map((item: any) => ({
        action: item.action,
        count: item._count,
      })),
      byResourceType: byResourceType.map((item: any) => ({
        resourceType: item.resourceType,
        count: item._count,
      })),
      recentActivity: recentActivity.map((log) => ({
        id: log.id,
        action: log.action,
        resourceType: log.resourceType,
        userEmail: log.userEmail,
        createdAt: log.createdAt,
      })),
    };
  }

  /**
   * Export audit logs
   */
  async export(filters: {
    userId?: string;
    userEmail?: string;
    action?: string;
    resourceType?: string;
    startDate?: Date;
    endDate?: Date;
    ipAddress?: string;
    format: 'csv' | 'json';
  }) {
    const where: Prisma.AuditLogWhereInput = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.userEmail) where.userEmail = { contains: filters.userEmail, mode: 'insensitive' };
    if (filters.action) where.action = filters.action;
    if (filters.resourceType) where.resourceType = filters.resourceType;
    if (filters.ipAddress) where.ipAddress = { contains: filters.ipAddress };
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    // Fetch all matching logs (large take to export all; no repository unbounded method exists)
    const logs = await this.repository.getAuditLogs(where, 0, 100000);

    if (filters.format === 'csv') {
      const headers = ['Timestamp', 'User Email', 'Action', 'Resource Type', 'Resource ID', 'IP Address', 'User Agent', 'Metadata'];
      const rows = logs.map((log) => [
        log.createdAt.toISOString(),
        log.userEmail || '',
        log.action,
        log.resourceType,
        log.resourceId || '',
        log.ipAddress || '',
        log.userAgent || '',
        JSON.stringify(log.metadata || {}),
      ]);

      return {
        content: [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n'),
        mimeType: 'text/csv',
        filename: `audit-logs-${Date.now()}.csv`,
      };
    } else {
      return {
        content: JSON.stringify(logs, null, 2),
        mimeType: 'application/json',
        filename: `audit-logs-${Date.now()}.json`,
      };
    }
  }

  /**
   * Get a specific audit log by ID
   */
  async getById(id: string) {
    const logs = await this.repository.getAuditLogs({ id }, 0, 1);
    return logs[0] ?? null;
  }
}

export default new AuditLogService();
