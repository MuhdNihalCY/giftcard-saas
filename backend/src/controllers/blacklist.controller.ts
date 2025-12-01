import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import blacklistService from '../services/blacklist.service';

export class BlacklistController {
  async addToBlacklist(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: { message: 'Admin access required' },
        });
      }

      const entry = await blacklistService.addToBlacklist({
        ...req.body,
        createdBy: req.user.userId,
      });

      res.status(201).json({
        success: true,
        data: entry,
        message: 'Entry added to blacklist successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async removeFromBlacklist(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: { message: 'Admin access required' },
        });
      }

      const { id } = req.params;
      const entry = await blacklistService.removeFromBlacklist(id);

      res.json({
        success: true,
        data: entry,
        message: 'Entry removed from blacklist successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBlacklistEntry(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: { message: 'Admin access required' },
        });
      }

      const { id } = req.params;
      const entry = await blacklistService.updateBlacklistEntry(id, req.body);

      res.json({
        success: true,
        data: entry,
        message: 'Blacklist entry updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getBlacklistEntries(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: { message: 'Admin access required' },
        });
      }

      const { type, severity, activeOnly, page, limit } = req.query;

      const result = await blacklistService.getBlacklistEntries({
        type: type as any,
        severity: severity as any,
        activeOnly: activeOnly === 'true',
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json({
        success: true,
        data: result.entries,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async checkBlacklist(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, value } = req.query;

      if (!type || !value) {
        return res.status(400).json({
          success: false,
          error: { message: 'Type and value are required' },
        });
      }

      const result = await blacklistService.checkBlacklist(
        type as any,
        value as string
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new BlacklistController();




