/**
 * Auth feature type definitions
 */

export type UserRole = 'ADMIN' | 'MERCHANT' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  businessName?: string;
  businessLogo?: string;
  isEmailVerified: boolean;
  isActive: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  requires2FA?: boolean;
  remainingBackupCodes?: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  businessName?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface TwoFactorVerifyData {
  email: string;
  password: string;
  token: string;
}

export interface TwoFactorBackupVerifyData {
  email: string;
  password: string;
  backupCode: string;
}

export interface RefreshTokenData {
  refreshToken: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  businessName?: string;
  businessLogo?: string;
}
