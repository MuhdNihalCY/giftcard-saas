/**
 * Auth feature API functions
 * All calls are wrapped around the shared axios instance from @/lib/api
 */
import api from '@/lib/api';
import type {
  AuthResponse,
  LoginData,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  TwoFactorVerifyData,
  TwoFactorBackupVerifyData,
  UpdateProfileData,
  User,
} from '../types';

/**
 * Login with email and password.
 * Returns AuthResponse (or a partial response indicating 2FA is required).
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', data);
  return response.data.data;
};

/**
 * Register a new user account.
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', data);
  return response.data.data;
};

/**
 * Logout the current user.
 */
export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

/**
 * Refresh access token using a refresh token.
 */
export const refreshToken = async (token: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/refresh', { refreshToken: token });
  return response.data.data;
};

/**
 * Get the currently authenticated user's profile.
 */
export const getProfile = async (): Promise<User> => {
  const response = await api.get('/auth/me');
  return response.data.data;
};

/**
 * Send a password reset email.
 */
export const forgotPassword = async (data: ForgotPasswordData): Promise<void> => {
  await api.post('/auth/forgot-password', data);
};

/**
 * Reset password using a reset token.
 */
export const resetPassword = async (data: ResetPasswordData): Promise<void> => {
  await api.post('/auth/reset-password', data);
};

/**
 * Verify a 2FA TOTP token after initial login.
 */
export const verify2FA = async (data: TwoFactorVerifyData): Promise<AuthResponse> => {
  const response = await api.post('/auth/2fa/verify', data);
  return response.data.data;
};

/**
 * Verify a 2FA backup code after initial login.
 */
export const verify2FABackup = async (data: TwoFactorBackupVerifyData): Promise<AuthResponse> => {
  const response = await api.post('/auth/2fa/verify-backup', data);
  return response.data.data;
};

/**
 * Enable two-factor authentication for the current user.
 */
export const enable2FA = async (): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> => {
  const response = await api.post('/auth/2fa/enable');
  return response.data.data;
};

/**
 * Disable two-factor authentication for the current user.
 */
export const disable2FA = async (token: string): Promise<void> => {
  await api.post('/auth/2fa/disable', { token });
};

/**
 * Update the authenticated user's profile.
 */
export const updateProfile = async (data: UpdateProfileData): Promise<User> => {
  const response = await api.put('/auth/profile', data);
  return response.data.data;
};

/**
 * Change the authenticated user's password.
 */
export const changePassword = async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
  await api.put('/auth/change-password', data);
};

// ─── 2FA Extended ─────────────────────────────────────────────────────────────

/**
 * Fetch the current 2FA status for the authenticated user.
 */
export const get2FAStatus = async (): Promise<{ enabled: boolean; remainingBackupCodes: number }> => {
  const response = await api.get('/auth/2fa/status');
  return response.data.data;
};

/**
 * Initiate 2FA setup — returns secret and QR code URL.
 */
export const setup2FA = async (): Promise<{ secret: string; qrCodeUrl: string }> => {
  const response = await api.get('/auth/2fa/setup');
  return response.data.data;
};

/**
 * Enable 2FA by verifying the TOTP token against the secret.
 */
export const enable2FAWithToken = async (data: {
  secret: string;
  token: string;
}): Promise<{ backupCodes: string[] }> => {
  const response = await api.post('/auth/2fa/enable', data);
  return response.data.data;
};

/**
 * Disable 2FA for the authenticated user, requires the account password.
 */
export const disable2FAWithPassword = async (password: string): Promise<void> => {
  await api.post('/auth/2fa/disable', { password });
};

/**
 * Regenerate backup codes for 2FA.
 */
export const regenerateBackupCodes = async (): Promise<{ backupCodes: string[] }> => {
  const response = await api.post('/auth/2fa/backup-codes/regenerate');
  return response.data.data;
};

// ─── Device Management ────────────────────────────────────────────────────────

export interface Device {
  id: string;
  deviceName: string | null;
  deviceType: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  lastUsedAt: string;
  createdAt: string;
}

/**
 * Fetch all active devices for the authenticated user.
 */
export const fetchDevices = async (): Promise<{ devices: Device[] }> => {
  const response = await api.get('/auth/devices');
  return response.data.data;
};

/**
 * Revoke a specific device by ID.
 */
export const revokeDevice = async (deviceId: string): Promise<void> => {
  await api.delete(`/auth/devices/${deviceId}`);
};

/**
 * Revoke all devices (logs out from all sessions).
 */
export const revokeAllDevices = async (): Promise<void> => {
  await api.delete('/auth/devices');
};

export const authApi = {
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
};
