/**
 * Shared store re-exports
 *
 * Note: authStore lives in features/auth/store — import it from '@/features/auth'.
 */

export { useFeatureFlagStore } from '@/store/featureFlagStore';
export type { FeatureFlag } from '@/store/featureFlagStore';

export { useThemeStore } from '@/store/themeStore';
export type { Theme } from '@/store/themeStore';
