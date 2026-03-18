/**
 * Auth feature — public API
 *
 * Import from '@/features/auth' to access everything this feature exposes.
 * Do NOT import from internal sub-paths (api/, store/, hooks/, types/).
 */

// API
export { authApi } from './api';
export {
  login,
  register,
  logout,
  refreshToken,
  getProfile,
  forgotPassword,
  resetPassword,
  verify2FA,
  verify2FABackup,
  enable2FA,
  disable2FA,
  updateProfile,
  changePassword,
  get2FAStatus,
  setup2FA,
  enable2FAWithToken,
  disable2FAWithPassword,
  regenerateBackupCodes,
  fetchDevices,
  revokeDevice,
  revokeAllDevices,
} from './api';

// Store
export { useAuthStore } from './store/authStore';

// Hooks
export { useAuth } from './hooks/useAuth';

// Types
export type {
  User,
  UserRole,
  AuthTokens,
  AuthResponse,
  LoginData,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  TwoFactorVerifyData,
  TwoFactorBackupVerifyData,
  RefreshTokenData,
  UpdateProfileData,
} from './types';
