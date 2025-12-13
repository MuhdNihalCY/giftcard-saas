import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, auth } from '../lib/auth';
import api from '../lib/api';
import logger from '../lib/logger';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  checkAuth: () => void;
  refreshToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => {
        auth.setUser(user);
        // Force immediate state update
        set({ user, isAuthenticated: true });
        // Also update localStorage directly to ensure persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user));
        }
      },
      setTokens: (accessToken: string, refreshToken: string) => {
        auth.setTokens(accessToken, refreshToken);
        // Verify tokens are stored
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('accessToken');
          if (!stored || stored !== accessToken) {
            // Token storage verification - retry storage
            logger.warn('Token storage verification failed, retrying...');
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
          }
        }
      },
      clearAuth: () => {
        auth.clear();
        set({ user: null, isAuthenticated: false });
      },
      checkAuth: () => {
        const validation = auth.validateTokens();
        
        if (!validation.valid) {
          if (validation.needsRefresh) {
            // Try to refresh token
            useAuthStore.getState().refreshToken();
          } else {
            // Tokens are invalid, clear auth
            auth.clear();
            set({ user: null, isAuthenticated: false });
          }
          return;
        }

        const user = auth.getUser();
        const isAuthenticated = auth.isAuthenticated();
        set({ user, isAuthenticated });
      },
      refreshToken: async () => {
        const refreshTokenValue = auth.getRefreshToken();
        
        if (!refreshTokenValue || auth.isRefreshTokenExpired()) {
          auth.clear();
          set({ user: null, isAuthenticated: false });
          return false;
        }

        try {
          const response = await api.post('/auth/refresh', {
            refreshToken: refreshTokenValue,
          });

          const { accessToken, refreshToken: newRefreshToken, user } = response.data.data;

          auth.setTokens(accessToken, newRefreshToken || refreshTokenValue);
          if (user) {
            auth.setUser(user);
            set({ user, isAuthenticated: true });
          } else {
            set({ isAuthenticated: true });
          }

          return true;
        } catch (error) {
          auth.clear();
          set({ user: null, isAuthenticated: false });
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

