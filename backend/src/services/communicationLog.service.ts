import prisma from '../config/database';
import logger from '../utils/logger';

export type CommunicationChannel = 'EMAIL' | 'SMS' | 'OTP' | 'PUSH';
export type CommunicationStatus = 'SENT' | 'FAILED' | 'PENDING' | 'BLOCKED';

export interface LogCommunicationOptions {
  channel: CommunicationChannel;
  recipient: string;
  subject?: string;
  message?: string;
  status: CommunicationStatus;
  errorMessage?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export class CommunicationLogService {
  /**
   * Log a communication attempt
   */
  async log(options: LogCommunicationOptions) {
    try {
      await prisma.communicationLog.create({
        data: {
          channel: options.channel,
          recipient: options.recipient,
          subject: options.subject,
          message: options.message,
          status: options.status,
          errorMessage: options.errorMessage,
          userId: options.userId,
          metadata: options.metadata || {},
        },
      });
    } catch (error: any) {
      // Don't throw error if logging fails, just log it
      logger.error('Failed to log communication', { error: error.message, options });
    }
  }

  /**
   * Get communication logs with filters
   */
  async getLogs(filters: {
    channel?: CommunicationChannel;
    status?: CommunicationStatus;
    recipient?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const {
      channel,
      status,
      recipient,
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (channel) where.channel = channel;
    if (status) where.status = status;
    if (recipient) where.recipient = { contains: recipient, mode: 'insensitive' };
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.communicationLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.communicationLog.count({ where }),
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
   * Get communication statistics
   */
  async getStatistics(filters: {
    channel?: CommunicationChannel;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { channel, startDate, endDate } = filters;

    const where: any = {};
    if (channel) where.channel = channel;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [total, sent, failed, blocked] = await Promise.all([
      prisma.communicationLog.count({ where }),
      prisma.communicationLog.count({ where: { ...where, status: 'SENT' } }),
      prisma.communicationLog.count({ where: { ...where, status: 'FAILED' } }),
      prisma.communicationLog.count({ where: { ...where, status: 'BLOCKED' } }),
    ]);

    return {
      total,
      sent,
      failed,
      blocked,
      successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : '0.00',
    };
  }

  /**
   * Get channel-specific statistics
   */
  async getChannelStatistics(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const channels = ['EMAIL', 'SMS', 'OTP', 'PUSH'] as CommunicationChannel[];

    const stats = await Promise.all(
      channels.map(async (channel) => {
        const channelWhere = { ...where, channel };
        const [total, sent, failed] = await Promise.all([
          prisma.communicationLog.count({ where: channelWhere }),
          prisma.communicationLog.count({ where: { ...channelWhere, status: 'SENT' } }),
          prisma.communicationLog.count({ where: { ...channelWhere, status: 'FAILED' } }),
        ]);

        return {
          channel,
          total,
          sent,
          failed,
          successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : '0.00',
        };
      })
    );

    return stats;
  }
}

export default new CommunicationLogService();


