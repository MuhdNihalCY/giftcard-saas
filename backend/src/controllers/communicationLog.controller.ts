import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import communicationLogService from '../services/communicationLog.service';
import { UnauthorizedError } from '../utils/errors';

export class CommunicationLogController {
  /**
   * Get communication logs
   * - Admins can view all logs
   * - Merchants can only view their own logs
   */
  async getLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const {
        channel,
        status,
        recipient,
        userId,
        merchantId,
        startDate,
        endDate,
        page,
        limit,
      } = req.query;

      // If user is a merchant, restrict to their own logs
      let filteredUserId: string | undefined = userId as string | undefined;
      if (req.user.role === 'MERCHANT') {
        // Merchants can only see logs for their own user ID
        // If merchantId is provided, ensure it matches the logged-in merchant
        const merchantUserId = req.user.userId;
        if (merchantId && merchantId !== merchantUserId) {
          throw new UnauthorizedError('You can only view your own communication logs');
        }
        // Force userId to be the merchant's ID
        filteredUserId = merchantUserId;
      } else if (req.user.role !== 'ADMIN') {
        // Only ADMIN and MERCHANT roles are allowed
        throw new UnauthorizedError('Insufficient permissions');
      }

      const result = await communicationLogService.getLogs({
        channel: channel as any,
        status: status as any,
        recipient: recipient as string,
        userId: filteredUserId,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get communication statistics (Admin only)
   */
  async getStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Check if user is admin
      if (req.user?.role !== 'ADMIN') {
        throw new UnauthorizedError('Only administrators can view communication statistics');
      }

      const { channel, startDate, endDate } = req.query;

      const stats = await communicationLogService.getStatistics({
        channel: channel as any,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get channel-specific statistics (Admin only)
   */
  async getChannelStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Check if user is admin
      if (req.user?.role !== 'ADMIN') {
        throw new UnauthorizedError('Only administrators can view communication statistics');
      }

      const { startDate, endDate } = req.query;

      const stats = await communicationLogService.getChannelStatistics(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CommunicationLogController();


