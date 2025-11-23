import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import communicationLogService from '../services/communicationLog.service';
import { UnauthorizedError } from '../utils/errors';

export class CommunicationLogController {
  /**
   * Get communication logs (Admin only)
   */
  async getLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Check if user is admin
      if (req.user?.role !== 'ADMIN') {
        throw new UnauthorizedError('Only administrators can view communication logs');
      }

      const {
        channel,
        status,
        recipient,
        userId,
        startDate,
        endDate,
        page,
        limit,
      } = req.query;

      const result = await communicationLogService.getLogs({
        channel: channel as any,
        status: status as any,
        recipient: recipient as string,
        userId: userId as string,
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

