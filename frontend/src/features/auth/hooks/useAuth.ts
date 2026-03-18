/**
 * useAuth hook — thin wrapper around the auth Zustand store.
 *
 * Exposes all auth state and actions in a single, ergonomic hook so that
 * feature components never import the store directly.
 */
import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api';
import type { LoginData, RegisterData } from '../types';
import logger from '@/lib/logger';

export function useAuth() {
  const { user, isAuthenticated, setUser, setTokens, clearAuth, checkAuth, refreshToken } =
    useAuthStore();

  /**
   * Login with email and password.
   * Stores tokens and user in the store on success.
   */
  const login = useCallback(
    async (data: LoginData) => {
      const result = await authApi.login(data);

      if (!result.requires2FA) {
        const { user: loggedInUser, accessToken, refreshToken: rt } = result;
        setTokens(accessToken, rt);
        setUser(loggedInUser);
      }

      return result;
    },
    [setTokens, setUser]
  );

  /**
   * Register a new account.
   * Stores tokens and user in the store on success.
   */
  const register = useCallback(
    async (data: RegisterData) => {
      const result = await authApi.register(data);
      const { user: newUser, accessToken, refreshToken: rt } = result;
      setTokens(accessToken, rt);
      setUser(newUser);
      return result;
    },
    [setTokens, setUser]
  );

  /**
   * Logout the current user.
   * Clears the auth store regardless of whether the server call succeeds.
   */
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      logger.warn('Logout API call failed, clearing local auth anyway', { error });
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  /**
   * Fetch and refresh the user profile from the server.
   */
  const fetchProfile = useCallback(async () => {
    const profile = await authApi.getProfile();
    setUser(profile);
    return profile;
  }, [setUser]);

  return {
    // State
    user,
    isAuthenticated,

    // Actions
    login,
    register,
    logout,
    fetchProfile,
    setUser,
    setTokens,
    clearAuth,
    checkAuth,
    refreshToken,
  };
}
