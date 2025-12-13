import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { UserRole, FeatureFlagTargetRole } from '@prisma/client';
import { FeatureFlagCategory } from '../constants/feature-flags';
import logger from '../utils/logger';

export interface CreateFeatureFlagData {
  featureKey: string;
  featureName: string;
  description?: string;
  category: FeatureFlagCategory;
  targetRole: FeatureFlagTargetRole;
  isEnabled?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateFeatureFlagData {
  featureName?: string;
  description?: string;
  category?: FeatureFlagCategory;
  targetRole?: FeatureFlagTargetRole;
  isEnabled?: boolean;
  metadata?: Record<string, any>;
}

export class FeatureFlagService {
  /**
   * Get all feature flags for a specific role
   */
  async getFeatureFlags(role: UserRole) {
    // Admins should see all flags, so just get all flags
    if (role === UserRole.ADMIN) {
      return await prisma.featureFlag.findMany({
        orderBy: [
          { category: 'asc' },
          { featureName: 'asc' },
        ],
      });
    }

    // Map UserRole to FeatureFlagTargetRole
    // UserRole: ADMIN, MERCHANT, CUSTOMER
    // FeatureFlagTargetRole: MERCHANT, CUSTOMER, ALL
    const targetRole =
      role === UserRole.MERCHANT
        ? FeatureFlagTargetRole.MERCHANT
        : role === UserRole.CUSTOMER
          ? FeatureFlagTargetRole.CUSTOMER
          : null;

    const flags = await prisma.featureFlag.findMany({
      where: {
        OR: [
          { targetRole: FeatureFlagTargetRole.ALL },
          ...(targetRole ? [{ targetRole }] : []),
        ],
      },
      orderBy: [
        { category: 'asc' },
        { featureName: 'asc' },
      ],
    });

    return flags;
  }

  /**
   * Check if a specific feature is enabled for a role
   */
  async isFeatureEnabled(featureKey: string, role: UserRole): Promise<boolean> {
    // Admins always have access
    if (role === UserRole.ADMIN) {
      return true;
    }

    const flag = await prisma.featureFlag.findUnique({
      where: { featureKey },
    });

    // If flag doesn't exist, default to enabled (backward compatibility)
    if (!flag) {
      logger.warn(`Feature flag not found: ${featureKey}, defaulting to enabled`);
      return true;
    }

    // Map UserRole to FeatureFlagTargetRole for comparison
    const targetRole =
      role === UserRole.MERCHANT
        ? FeatureFlagTargetRole.MERCHANT
        : role === UserRole.CUSTOMER
          ? FeatureFlagTargetRole.CUSTOMER
          : null;

    // Check if flag applies to this role
    if (flag.targetRole !== FeatureFlagTargetRole.ALL && flag.targetRole !== targetRole) {
      // Flag doesn't apply to this role, so it's effectively enabled
      return true;
    }

    return flag.isEnabled;
  }

  /**
   * Get all feature flags (admin only)
   */
  async getAllFeatureFlags() {
    const flags = await prisma.featureFlag.findMany({
      orderBy: [
        { category: 'asc' },
        { targetRole: 'asc' },
        { featureName: 'asc' },
      ],
    });

    return flags;
  }

  /**
   * Get feature flag by ID
   */
  async getFeatureFlagById(id: string) {
    const flag = await prisma.featureFlag.findUnique({
      where: { id },
    });

    if (!flag) {
      throw new NotFoundError('Feature flag not found');
    }

    return flag;
  }

  /**
   * Get feature flag by key
   */
  async getFeatureFlagByKey(featureKey: string) {
    const flag = await prisma.featureFlag.findUnique({
      where: { featureKey },
    });

    return flag;
  }

  /**
   * Create a new feature flag
   */
  async createFeatureFlag(data: CreateFeatureFlagData) {
    // Check if feature key already exists
    const existing = await this.getFeatureFlagByKey(data.featureKey);
    if (existing) {
      throw new ValidationError(`Feature flag with key "${data.featureKey}" already exists`);
    }

    const flag = await prisma.featureFlag.create({
      data: {
        featureKey: data.featureKey,
        featureName: data.featureName,
        description: data.description || null,
        category: data.category,
        targetRole: data.targetRole,
        isEnabled: data.isEnabled ?? true,
        metadata: data.metadata || {},
      },
    });

    logger.info('Feature flag created', {
      featureKey: flag.featureKey,
      targetRole: flag.targetRole,
      isEnabled: flag.isEnabled,
    });

    return flag;
  }

  /**
   * Update a feature flag
   */
  async updateFeatureFlag(id: string, data: UpdateFeatureFlagData) {
    const flag = await this.getFeatureFlagById(id);

    const updated = await prisma.featureFlag.update({
      where: { id },
      data: {
        featureName: data.featureName,
        description: data.description,
        category: data.category,
        targetRole: data.targetRole,
        isEnabled: data.isEnabled,
        metadata: data.metadata !== undefined ? data.metadata : flag.metadata,
      },
    });

    logger.info('Feature flag updated', {
      featureKey: updated.featureKey,
      targetRole: updated.targetRole,
      isEnabled: updated.isEnabled,
    });

    return updated;
  }

  /**
   * Delete a feature flag
   */
  async deleteFeatureFlag(id: string) {
    const flag = await this.getFeatureFlagById(id);

    await prisma.featureFlag.delete({
      where: { id },
    });

    logger.info('Feature flag deleted', {
      featureKey: flag.featureKey,
    });

    return { success: true };
  }

  /**
   * Toggle feature flag enabled status
   */
  async toggleFeatureFlag(id: string) {
    const flag = await this.getFeatureFlagById(id);

    const updated = await prisma.featureFlag.update({
      where: { id },
      data: {
        isEnabled: !flag.isEnabled,
      },
    });

    logger.info('Feature flag toggled', {
      featureKey: updated.featureKey,
      isEnabled: updated.isEnabled,
    });

    return updated;
  }

  /**
   * Batch update feature flags
   */
  async batchUpdateFeatureFlags(updates: Array<{ id: string; isEnabled: boolean }>) {
    const results = await Promise.all(
      updates.map((update) =>
        prisma.featureFlag.update({
          where: { id: update.id },
          data: { isEnabled: update.isEnabled },
        })
      )
    );

    logger.info('Feature flags batch updated', {
      count: results.length,
    });

    return results;
  }

  /**
   * Get feature flags statistics
   */
  async getFeatureFlagStatistics() {
    const [total, enabled, disabled, byCategory, byRole] = await Promise.all([
      prisma.featureFlag.count(),
      prisma.featureFlag.count({ where: { isEnabled: true } }),
      prisma.featureFlag.count({ where: { isEnabled: false } }),
      prisma.featureFlag.groupBy({
        by: ['category'],
        _count: true,
      }),
      prisma.featureFlag.groupBy({
        by: ['targetRole'],
        _count: true,
      }),
    ]);

    return {
      total,
      enabled,
      disabled,
      byCategory: byCategory.reduce(
        (acc, item) => ({ ...acc, [item.category]: item._count }),
        {} as Record<string, number>
      ),
      byRole: byRole.reduce(
        (acc, item) => ({ ...acc, [item.targetRole]: item._count }),
        {} as Record<string, number>
      ),
    };
  }
}

export default new FeatureFlagService();






