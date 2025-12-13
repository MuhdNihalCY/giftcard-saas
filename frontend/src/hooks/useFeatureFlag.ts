import { useEffect } from 'react';
import { useFeatureFlagStore } from '../store/featureFlagStore';
import { useAuthStore } from '../store/authStore';

/**
 * Hook to check if a feature is enabled
 * Automatically fetches feature flags on mount if user is authenticated
 */
export function useFeatureFlag(featureKey: string): boolean {
  const { isFeatureEnabled, fetchFlags, flagsMap, isLoading, lastFetched } = useFeatureFlagStore();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Fetch flags when user is authenticated
    if (isAuthenticated && user) {
      // If flags haven't been loaded, or cache is stale (older than 1 minute), fetch them
      const now = Date.now();
      const CACHE_DURATION = 60 * 1000; // 1 minute cache for more responsive updates
      const isStale = !lastFetched || (now - lastFetched > CACHE_DURATION);
      
      if (flagsMap.size === 0 || isStale) {
        fetchFlags(true); // Force refresh to get latest values
      }
    }
  }, [isAuthenticated, user, flagsMap.size, isLoading, lastFetched, fetchFlags]);

  return isFeatureEnabled(featureKey);
}

/**
 * Hook to check multiple features at once
 * Returns an object with feature keys as keys and boolean values
 */
export function useFeatureFlags(featureKeys: string[]): Record<string, boolean> {
  const { isFeatureEnabled, fetchFlags, flagsMap } = useFeatureFlagStore();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Fetch flags when user is authenticated and flags haven't been loaded
    if (isAuthenticated && user && flagsMap.size === 0) {
      fetchFlags();
    }
  }, [isAuthenticated, user, flagsMap.size, fetchFlags]);

  const result: Record<string, boolean> = {};
  featureKeys.forEach((key) => {
    result[key] = isFeatureEnabled(key);
  });

  return result;
}

/**
 * Hook to manually refresh feature flags
 */
export function useRefreshFeatureFlags() {
  const { fetchFlags } = useFeatureFlagStore();
  return fetchFlags;
}






