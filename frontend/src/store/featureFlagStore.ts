import { create } from 'zustand';
import logger from '../lib/logger';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../lib/api';
import { useAuthStore } from './authStore';

export interface FeatureFlag {
  id: string;
  featureKey: string;
  featureName: string;
  description: string | null;
  category: 'PAGE' | 'FEATURE';
  targetRole: 'MERCHANT' | 'CUSTOMER' | 'ALL';
  isEnabled: boolean;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

interface FeatureFlagState {
  flags: FeatureFlag[];
  flagsMap: Map<string, boolean>;
  isLoading: boolean;
  lastFetched: number | null;
  fetchFlags: (forceRefresh?: boolean) => Promise<void>;
  isFeatureEnabled: (featureKey: string) => boolean;
  clearFlags: () => void;
}

// Cache duration: 1 minute (reduced for more responsive updates)
const CACHE_DURATION = 60 * 1000;

export const useFeatureFlagStore = create<FeatureFlagState>()(
  persist(
    (set, get) => ({
      flags: [],
      flagsMap: new Map(),
      isLoading: false,
      lastFetched: null,

      fetchFlags: async (forceRefresh: boolean = false) => {
        const state = get();
        const now = Date.now();

        // Return cached data if still valid (unless force refresh)
        if (
          !forceRefresh &&
          state.lastFetched &&
          now - state.lastFetched < CACHE_DURATION &&
          state.flags.length > 0
        ) {
          return;
        }

        set({ isLoading: true });

        try {
          const user = useAuthStore.getState().user;
          if (!user) {
            set({ isLoading: false });
            return;
          }

          const response = await api.get('/feature-flags');
          const flags: FeatureFlag[] = response.data.data || [];

          // Create a map for quick lookups
          const flagsMap = new Map<string, boolean>();
          flags.forEach((flag) => {
            // Only include flags that apply to the user's role
            if (
              flag.targetRole === 'ALL' ||
              flag.targetRole === user.role
            ) {
              flagsMap.set(flag.featureKey, flag.isEnabled);
            } else {
              // Flag doesn't apply to this role, so it's effectively enabled
              flagsMap.set(flag.featureKey, true);
            }
          });

          set({
            flags,
            flagsMap,
            isLoading: false,
            lastFetched: now,
          });
        } catch (error) {
          logger.error('Failed to fetch feature flags', { error });
          // On error, default to all features enabled (fail open)
          set({
            flags: [],
            flagsMap: new Map(),
            isLoading: false,
            lastFetched: now,
          });
        }
      },

      isFeatureEnabled: (featureKey: string) => {
        const state = get();
        const user = useAuthStore.getState().user;

        // Admins always have access
        if (user?.role === 'ADMIN') {
          return true;
        }

        // If no flags loaded yet, try to fetch them first
        if (state.flagsMap.size === 0) {
          // If we're authenticated, try fetching flags
          if (user) {
            // Return false for security - don't show features until flags are loaded
            // The hook will trigger a fetch
            return false;
          }
          // Not authenticated, default to false
          return false;
        }

        // Check if feature is enabled
        const isEnabled = state.flagsMap.get(featureKey);

        // If flag doesn't exist in map, default to false (secure default)
        if (isEnabled === undefined) {
          return false;
        }

        return isEnabled;
      },

      clearFlags: () => {
        set({
          flags: [],
          flagsMap: new Map(),
          lastFetched: null,
        });
      },
    }),
    {
      name: 'feature-flags-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist flags and lastFetched, not loading state
      partialize: (state) => ({
        flags: state.flags,
        flagsMap: Array.from(state.flagsMap.entries()),
        lastFetched: state.lastFetched,
      }),
      // Restore flagsMap from array
      onRehydrateStorage: () => (state) => {
        if (state) {
          const map = new Map<string, boolean>();
          if (Array.isArray(state.flagsMap)) {
            state.flagsMap.forEach(([key, value]: [string, boolean]) => {
              map.set(key, value);
            });
          }
          state.flagsMap = map;
        }
      },
    }
  )
);






