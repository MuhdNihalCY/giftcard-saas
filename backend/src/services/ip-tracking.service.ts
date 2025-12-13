import prisma from '../config/database';
import logger from '../utils/logger';

export type TrackingAction = 'PAYMENT' | 'GIFT_CARD_CREATION' | 'REDEMPTION' | 'LOGIN';

export interface TrackIPData {
  ipAddress: string;
  userId?: string;
  action: TrackingAction;
  resourceId?: string;
  userAgent?: string;
  deviceFingerprint?: string;
}

export interface IPActivityStats {
  ipAddress: string;
  totalActions: number;
  uniqueUsers: number;
  actionsByType: Record<string, number>;
  firstSeen: Date;
  lastSeen: Date;
  suspiciousScore: number; // 0-100
}

export class IPTrackingService {
  /**
   * Track IP address activity
   */
  async trackIP(data: TrackIPData) {
    try {
      await prisma.iPTracking.create({
        data: {
          ipAddress: data.ipAddress,
          userId: data.userId,
          action: data.action,
          resourceId: data.resourceId,
          userAgent: data.userAgent,
          deviceFingerprint: data.deviceFingerprint,
        },
      });
    } catch (error: any) {
      // Don't fail the main operation if tracking fails
      logger.error('Failed to track IP address', { error: error.message, data });
    }
  }

  /**
   * Get IP activity statistics
   */
  async getIPStats(
    ipAddress: string,
    hours: number = 24
  ): Promise<IPActivityStats> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const activities = await prisma.iPTracking.findMany({
      where: {
        ipAddress,
        createdAt: {
          gte: since,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (activities.length === 0) {
      return {
        ipAddress,
        totalActions: 0,
        uniqueUsers: 0,
        actionsByType: {},
        firstSeen: new Date(),
        lastSeen: new Date(),
        suspiciousScore: 0,
      };
    }

    const uniqueUsers = new Set(activities.map((a) => a.userId).filter(Boolean)).size;
    const actionsByType: Record<string, number> = {};

    activities.forEach((activity) => {
      actionsByType[activity.action] = (actionsByType[activity.action] || 0) + 1;
    });

    // Calculate suspicious score
    let suspiciousScore = 0;

    // Multiple users from same IP
    if (uniqueUsers > 3) {
      suspiciousScore += 30;
    }

    // High activity
    if (activities.length > 50) {
      suspiciousScore += 40;
    }

    // Multiple payment actions
    if (actionsByType.PAYMENT > 10) {
      suspiciousScore += 30;
    }

    // Multiple gift card creations
    if (actionsByType.GIFT_CARD_CREATION > 20) {
      suspiciousScore += 20;
    }

    return {
      ipAddress,
      totalActions: activities.length,
      uniqueUsers,
      actionsByType,
      firstSeen: activities[0].createdAt,
      lastSeen: activities[activities.length - 1].createdAt,
      suspiciousScore: Math.min(suspiciousScore, 100),
    };
  }

  /**
   * Get count of actions from IP in time period
   */
  async getIPActionCount(
    ipAddress: string,
    action: TrackingAction,
    hours: number = 24
  ): Promise<number> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    return prisma.iPTracking.count({
      where: {
        ipAddress,
        action,
        createdAt: {
          gte: since,
        },
      },
    });
  }

  /**
   * Get all IPs for a user
   */
  async getUserIPs(userId: string, limit: number = 10) {
    const ips = await prisma.iPTracking.findMany({
      where: { userId },
      select: {
        ipAddress: true,
        createdAt: true,
        action: true,
      },
      distinct: ['ipAddress'],
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return ips.map((ip) => ip.ipAddress);
  }

  /**
   * Get all users for an IP
   */
  async getIPUsers(ipAddress: string) {
    const users = await prisma.iPTracking.findMany({
      where: { ipAddress },
      select: {
        userId: true,
      },
      distinct: ['userId'],
    });

    return users.map((u) => u.userId).filter(Boolean) as string[];
  }

  /**
   * Clean old tracking records (older than specified days)
   */
  async cleanOldRecords(days: number = 90) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const result = await prisma.iPTracking.deleteMany({
      where: {
        createdAt: {
          lt: cutoff,
        },
      },
    });

    logger.info('Cleaned old IP tracking records', {
      deleted: result.count,
      cutoff: cutoff.toISOString(),
    });

    return result.count;
  }
}

export default new IPTrackingService();













