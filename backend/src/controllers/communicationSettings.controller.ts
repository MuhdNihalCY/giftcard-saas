import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import communicationSettingsService from '../services/communicationSettings.service';
import { UnauthorizedError } from '../utils/errors';

export class CommunicationSettingsController {
  /**
   * Get communication settings (Admin only)
   */
  async getSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Check if user is admin
      if (req.user?.role !== 'ADMIN') {
        throw new UnauthorizedError('Only administrators can view communication settings');
      }

      const settings = await communicationSettingsService.getSettings();
      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update communication settings (Admin only)
   */
  async updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Check if user is admin
      if (req.user?.role !== 'ADMIN') {
        throw new UnauthorizedError('Only administrators can update communication settings');
      }

      const settings = await communicationSettingsService.updateSettings(
        req.body,
        req.user.userId
      );

      res.json({
        success: true,
        data: settings,
        message: 'Communication settings updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CommunicationSettingsController();

