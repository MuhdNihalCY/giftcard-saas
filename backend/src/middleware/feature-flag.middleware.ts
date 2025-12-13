import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import featureFlagService from '../services/feature-flag.service';
import { ForbiddenError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * Middleware to check if a feature is enabled for the user's role
 * Returns 403 if feature is disabled
 */
export const checkFeatureFlag = (featureKey: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Admins always have access
      if (req.user?.role === 'ADMIN') {
        return next();
      }

      // If no user, allow (public features)
      if (!req.user) {
        return next();
      }

      const role = req.user.role as 'ADMIN' | 'MERCHANT' | 'CUSTOMER';
      const isEnabled = await featureFlagService.isFeatureEnabled(featureKey, role);

      if (!isEnabled) {
        logger.warn('Feature flag check failed', {
          featureKey,
          userId: req.user.userId,
          role: req.user.role,
        });

        return res.status(403).json({
          success: false,
          error: {
            code: 'FEATURE_DISABLED',
            message: `Feature "${featureKey}" is currently disabled`,
          },
        });
      }

      next();
    } catch (error) {
      logger.error('Feature flag check error', {
        featureKey,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // On error, allow access (fail open for backward compatibility)
      next();
    }
  };
};

/**
 * Middleware factory for multiple feature checks (all must pass)
 */
export const checkMultipleFeatureFlags = (...featureKeys: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Admins always have access
      if (req.user?.role === 'ADMIN') {
        return next();
      }

      // If no user, allow (public features)
      if (!req.user) {
        return next();
      }

      const role = req.user.role as 'ADMIN' | 'MERCHANT' | 'CUSTOMER';

      // Check all features
      const checks = await Promise.all(
        featureKeys.map((key) => featureFlagService.isFeatureEnabled(key, role))
      );

      const allEnabled = checks.every((enabled) => enabled);

      if (!allEnabled) {
        const disabledFeatures = featureKeys.filter(
          (_, index) => !checks[index]
        );

        logger.warn('Multiple feature flag check failed', {
          featureKeys,
          disabledFeatures,
          userId: req.user.userId,
          role: req.user.role,
        });

        return res.status(403).json({
          success: false,
          error: {
            code: 'FEATURES_DISABLED',
            message: `One or more features are currently disabled: ${disabledFeatures.join(', ')}`,
            disabledFeatures,
          },
        });
      }

      next();
    } catch (error) {
      logger.error('Multiple feature flag check error', {
        featureKeys,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // On error, allow access (fail open for backward compatibility)
      next();
    }
  };
};

/**
 * Helper function to check feature flag in route handlers
 */
export async function requireFeatureFlag(
  featureKey: string,
  role: 'ADMIN' | 'MERCHANT' | 'CUSTOMER'
): Promise<boolean> {
  // Admins always have access
  if (role === 'ADMIN') {
    return true;
  }

  return await featureFlagService.isFeatureEnabled(featureKey, role);
}






