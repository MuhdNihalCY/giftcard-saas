import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import featureFlagService from '../services/feature-flag.service';
import { UserRole } from '@prisma/client';

export class FeatureFlagController {
  /**
   * Get all feature flags (admin only)
   */
  async getAllFeatureFlags(req: Request, res: Response, next: NextFunction) {
    try {
      const flags = await featureFlagService.getAllFeatureFlags();
      res.json({
        success: true,
        data: flags,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get feature flags for current user's role
   */
  async getFeatureFlags(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const role = req.user?.role as UserRole;
      if (!role) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const flags = await featureFlagService.getFeatureFlags(role);
      res.json({
        success: true,
        data: flags,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get feature flag by ID
   */
  async getFeatureFlag(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const flag = await featureFlagService.getFeatureFlagById(id);
      res.json({
        success: true,
        data: flag,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if a feature is enabled for a role
   */
  async checkFeatureFlag(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { featureKey } = req.params;
      const role = (req.query.role as UserRole) || req.user?.role;

      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Role is required',
        });
      }

      const isEnabled = await featureFlagService.isFeatureEnabled(featureKey, role);
      res.json({
        success: true,
        data: {
          featureKey,
          role,
          isEnabled,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new feature flag (admin only)
   */
  async createFeatureFlag(req: Request, res: Response, next: NextFunction) {
    try {
      const flag = await featureFlagService.createFeatureFlag(req.body);
      res.status(201).json({
        success: true,
        data: flag,
        message: 'Feature flag created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a feature flag (admin only)
   */
  async updateFeatureFlag(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const flag = await featureFlagService.updateFeatureFlag(id, req.body);
      res.json({
        success: true,
        data: flag,
        message: 'Feature flag updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle feature flag enabled status (admin only)
   */
  async toggleFeatureFlag(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const flag = await featureFlagService.toggleFeatureFlag(id);
      res.json({
        success: true,
        data: flag,
        message: `Feature flag ${flag.isEnabled ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a feature flag (admin only)
   */
  async deleteFeatureFlag(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await featureFlagService.deleteFeatureFlag(id);
      res.json({
        success: true,
        message: 'Feature flag deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Batch update feature flags (admin only)
   */
  async batchUpdateFeatureFlags(req: Request, res: Response, next: NextFunction) {
    try {
      const { updates } = req.body; // Array of { id, isEnabled }
      if (!Array.isArray(updates)) {
        return res.status(400).json({
          success: false,
          message: 'Updates must be an array',
        });
      }

      const flags = await featureFlagService.batchUpdateFeatureFlags(updates);
      res.json({
        success: true,
        data: flags,
        message: 'Feature flags updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get feature flag statistics (admin only)
   */
  async getFeatureFlagStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await featureFlagService.getFeatureFlagStatistics();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new FeatureFlagController();






