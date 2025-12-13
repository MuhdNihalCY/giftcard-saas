import { Router } from 'express';
import featureFlagController from '../controllers/feature-flag.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';
import { FeatureFlagCategory, FeatureFlagTargetRole } from '../constants/feature-flags';

const router = Router();

// Create feature flag schema
const createFeatureFlagSchema = z.object({
  body: z.object({
    featureKey: z.string().min(1, 'Feature key is required'),
    featureName: z.string().min(1, 'Feature name is required'),
    description: z.string().optional(),
    category: z.nativeEnum(FeatureFlagCategory),
    targetRole: z.nativeEnum(FeatureFlagTargetRole),
    isEnabled: z.boolean().optional().default(true),
    metadata: z.record(z.any()).optional(),
  }),
});

// Update feature flag schema
const updateFeatureFlagSchema = z.object({
  body: z.object({
    featureName: z.string().min(1).optional(),
    description: z.string().optional(),
    category: z.nativeEnum(FeatureFlagCategory).optional(),
    targetRole: z.nativeEnum(FeatureFlagTargetRole).optional(),
    isEnabled: z.boolean().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

// Batch update schema
const batchUpdateSchema = z.object({
  body: z.object({
    updates: z.array(
      z.object({
        id: z.string().uuid(),
        isEnabled: z.boolean(),
      })
    ),
  }),
});

// Public route - get feature flags for current user's role
router.get(
  '/',
  authenticate,
  featureFlagController.getFeatureFlags.bind(featureFlagController)
);

// Public route - check if specific feature is enabled
router.get(
  '/check/:featureKey',
  authenticate,
  featureFlagController.checkFeatureFlag.bind(featureFlagController)
);

// Admin routes
router.use(authenticate);
router.use(authorize('ADMIN'));

// Get all feature flags (admin only)
router.get(
  '/admin/all',
  featureFlagController.getAllFeatureFlags.bind(featureFlagController)
);

// Get feature flag by ID
router.get(
  '/admin/:id',
  featureFlagController.getFeatureFlag.bind(featureFlagController)
);

// Create feature flag
router.post(
  '/admin',
  validate(createFeatureFlagSchema),
  featureFlagController.createFeatureFlag.bind(featureFlagController)
);

// Update feature flag
router.put(
  '/admin/:id',
  validate(updateFeatureFlagSchema),
  featureFlagController.updateFeatureFlag.bind(featureFlagController)
);

// Toggle feature flag
router.post(
  '/admin/:id/toggle',
  featureFlagController.toggleFeatureFlag.bind(featureFlagController)
);

// Delete feature flag
router.delete(
  '/admin/:id',
  featureFlagController.deleteFeatureFlag.bind(featureFlagController)
);

// Batch update feature flags
router.post(
  '/admin/batch-update',
  validate(batchUpdateSchema),
  featureFlagController.batchUpdateFeatureFlags.bind(featureFlagController)
);

// Get statistics
router.get(
  '/admin/statistics',
  featureFlagController.getFeatureFlagStatistics.bind(featureFlagController)
);

export default router;






