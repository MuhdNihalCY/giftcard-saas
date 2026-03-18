import { AdminRepository } from '../modules/admin/admin.repository';
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
  private readonly repository = new AdminRepository();

  /**
   * Get all feature flags for a specific role
   */
  async getFeatureFlags(role: UserRole) {
    // Admins should see all flags, so just get all flags
    if (role === UserRole.ADMIN) {
      const flags = await this.repository.findAllFeatureFlags();
      // Sort by category then featureName (repository already orders by featureName; re-sort for dual key)
      return flags.sort((a, b) =>
        a.category.localeCompare(b.category) || a.featureName.localeCompare(b.featureName)
      );
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

    const allFlags = await this.repository.findAllFeatureFlags();
    const flags = allFlags.filter(
      (flag) =>
        flag.targetRole === FeatureFlagTargetRole.ALL ||
        (targetRole && flag.targetRole === targetRole)
    );

    return flags.sort((a, b) =>
      a.category.localeCompare(b.category) || a.featureName.localeCompare(b.featureName)
    );
  }

  /**
   * Check if a specific feature is enabled for a role
   */
  async isFeatureEnabled(featureKey: string, role: UserRole): Promise<boolean> {
    // Admins always have access
    if (role === UserRole.ADMIN) {
      return true;
    }

    const flag = await this.repository.findFeatureFlag(featureKey);

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
    const flags = await this.repository.findAllFeatureFlags();
    return flags.sort((a, b) =>
      a.category.localeCompare(b.category) ||
      a.targetRole.localeCompare(b.targetRole) ||
      a.featureName.localeCompare(b.featureName)
    );
  }

  /**
   * Get feature flag by ID
   */
  async getFeatureFlagById(id: string) {
    const allFlags = await this.repository.findAllFeatureFlags();
    const flag = allFlags.find((f) => f.id === id);

    if (!flag) {
      throw new NotFoundError('Feature flag not found');
    }

    return flag;
  }

  /**
   * Get feature flag by key
   */
  async getFeatureFlagByKey(featureKey: string) {
    return this.repository.findFeatureFlag(featureKey);
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

    const flag = await this.repository.upsertFeatureFlag(data.featureKey, {
      featureName: data.featureName,
      description: data.description || null,
      category: data.category,
      targetRole: data.targetRole,
      isEnabled: data.isEnabled ?? true,
      metadata: data.metadata || {},
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

    const updated = await this.repository.upsertFeatureFlag(flag.featureKey, {
      featureName: data.featureName ?? flag.featureName,
      description: data.description ?? flag.description,
      category: data.category ?? flag.category,
      targetRole: data.targetRole ?? flag.targetRole,
      isEnabled: data.isEnabled ?? flag.isEnabled,
      metadata: data.metadata !== undefined ? data.metadata : flag.metadata,
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

    await this.repository.deleteFeatureFlag(flag.featureKey);

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

    const updated = await this.repository.upsertFeatureFlag(flag.featureKey, {
      featureName: flag.featureName,
      description: flag.description,
      category: flag.category,
      targetRole: flag.targetRole,
      isEnabled: !flag.isEnabled,
      metadata: flag.metadata,
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
      updates.map(async (update) => {
        const flag = await this.getFeatureFlagById(update.id);
        return this.repository.upsertFeatureFlag(flag.featureKey, {
          featureName: flag.featureName,
          description: flag.description,
          category: flag.category,
          targetRole: flag.targetRole,
          isEnabled: update.isEnabled,
          metadata: flag.metadata,
        });
      })
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
      this.repository.countFeatureFlags(),
      this.repository.countFeatureFlags({ isEnabled: true }),
      this.repository.countFeatureFlags({ isEnabled: false }),
      this.repository.groupByFeatureFlags(['category']),
      this.repository.groupByFeatureFlags(['targetRole']),
    ]);

    return {
      total,
      enabled,
      disabled,
      byCategory: (byCategory as any[]).reduce(
        (acc: Record<string, number>, item: any) => ({ ...acc, [item.category]: item._count }),
        {} as Record<string, number>
      ),
      byRole: (byRole as any[]).reduce(
        (acc: Record<string, number>, item: any) => ({ ...acc, [item.targetRole]: item._count }),
        {} as Record<string, number>
      ),
    };
  }
}

export default new FeatureFlagService();
