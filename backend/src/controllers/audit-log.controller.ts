/**
 * Audit Log Controller
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import auditLogService from '../services/audit-log.service';
import { ValidationError, NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

export class AuditLogController {
  /**
   * List audit logs with filters and pagination
   * GET /admin/audit-logs
   */
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {
        page = '1',
        limit = '50',
        userId,
        userEmail,
        action,
        resourceType,
        startDate,
        endDate,
        ipAddress,
      } = req.query;

      const filters: {
        userId?: string;
        userEmail?: string;
        action?: string;
        resourceType?: string;
        startDate?: Date;
        endDate?: Date;
        ipAddress?: string;
        page: number;
        limit: number;
      } = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      };

      if (userId) filters.userId = userId as string;
      if (userEmail) filters.userEmail = userEmail as string;
      if (action) filters.action = action as string;
      if (resourceType) filters.resourceType = resourceType as string;
      if (ipAddress) filters.ipAddress = ipAddress as string;
      if (startDate) {
        const date = new Date(startDate as string);
        if (isNaN(date.getTime())) {
          throw new ValidationError('Invalid startDate format');
        }
        filters.startDate = date;
      }
      if (endDate) {
        const date = new Date(endDate as string);
        if (isNaN(date.getTime())) {
          throw new ValidationError('Invalid endDate format');
        }
        filters.endDate = date;
      }

      const result = await auditLogService.list(filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific audit log
   * GET /admin/audit-logs/:id
   */
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const log = await auditLogService.getById(id);

      if (!log) {
        throw new NotFoundError('Audit log not found');
      }

      res.json({
        success: true,
        data: log,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get audit log statistics
   * GET /admin/audit-logs/statistics
   */
  async getStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;

      const filters: {
        startDate?: Date;
        endDate?: Date;
      } = {};

      if (startDate) {
        const date = new Date(startDate as string);
        if (isNaN(date.getTime())) {
          throw new ValidationError('Invalid startDate format');
        }
        filters.startDate = date;
      }
      if (endDate) {
        const date = new Date(endDate as string);
        if (isNaN(date.getTime())) {
          throw new ValidationError('Invalid endDate format');
        }
        filters.endDate = date;
      }

      const statistics = await auditLogService.getStatistics(filters);

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export audit logs
   * GET /admin/audit-logs/export
   */
  async export(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {
        format = 'csv',
        userId,
        userEmail,
        action,
        resourceType,
        startDate,
        endDate,
        ipAddress,
      } = req.query;

      if (format !== 'csv' && format !== 'json') {
        throw new ValidationError('Format must be csv or json');
      }

      const filters: {
        userId?: string;
        userEmail?: string;
        action?: string;
        resourceType?: string;
        startDate?: Date;
        endDate?: Date;
        ipAddress?: string;
        format: 'csv' | 'json';
      } = {
        format: format as 'csv' | 'json',
      };

      if (userId) filters.userId = userId as string;
      if (userEmail) filters.userEmail = userEmail as string;
      if (action) filters.action = action as string;
      if (resourceType) filters.resourceType = resourceType as string;
      if (ipAddress) filters.ipAddress = ipAddress as string;
      if (startDate) {
        const date = new Date(startDate as string);
        if (isNaN(date.getTime())) {
          throw new ValidationError('Invalid startDate format');
        }
        filters.startDate = date;
      }
      if (endDate) {
        const date = new Date(endDate as string);
        if (isNaN(date.getTime())) {
          throw new ValidationError('Invalid endDate format');
        }
        filters.endDate = date;
      }

      const exportData = await auditLogService.export(filters);

      res.setHeader('Content-Type', exportData.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${exportData.filename}"`);
      res.send(exportData.content);

      logger.info('Audit logs exported', { format, userId: req.user?.userId });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuditLogController();

