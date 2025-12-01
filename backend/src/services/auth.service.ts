import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { env } from '../config/env';
import prisma from '../config/database';
import { UnauthorizedError, ValidationError } from '../utils/errors';
import { UserRole } from '@prisma/client';
import logger from '../utils/logger';
import twoFactorService from './two-factor.service';
import type { DeviceInfo } from './device.service';

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  role?: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export class AuthService {
  async register(data: RegisterData) {
    const { email, password, firstName, lastName, businessName, role } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ValidationError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        businessName,
        role: role || 'CUSTOMER',
        isEmailVerified: false, // Require email verification
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        businessName: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    // Send verification email (don't await to avoid blocking registration)
    // Use dynamic import to avoid circular dependency if any
    import('./emailVerification.service').then((module) => {
      module.default.sendVerificationEmail(user.id, user.email).catch((error) => {
        logger.error('Failed to send verification email during registration', { userId: user.id, error });
      });
    });

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user,
      ...tokens,
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  async login(data: LoginData) {
    const { email, password } = data;

    // Verify prisma is initialized
    if (!prisma || !prisma.user) {
      logger.error('Prisma client is not initialized', { prisma: typeof prisma });
      throw new Error('Database connection not available');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedError(`Account is locked. Please try again in ${minutesLeft} minute(s).`);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      // Increment failed login attempts
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const maxAttempts = 5;
      const lockoutDuration = 30; // 30 minutes

      if (failedAttempts >= maxAttempts) {
        // Lock account
        const lockedUntil = new Date();
        lockedUntil.setMinutes(lockedUntil.getMinutes() + lockoutDuration);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: failedAttempts,
            lockedUntil,
          },
        });

        logger.warn('Account locked due to failed login attempts', { userId: user.id, email });
        throw new UnauthorizedError(`Account locked due to ${maxAttempts} failed login attempts. Please try again in ${lockoutDuration} minutes.`);
      } else {
        // Update failed attempts
        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: failedAttempts },
        });

        logger.warn('Failed login attempt', { userId: user.id, email, attempts: failedAttempts });
        throw new UnauthorizedError(`Invalid email or password. ${maxAttempts - failedAttempts} attempt(s) remaining.`);
      }
    }

    // Reset failed login attempts on successful login
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Return requires2FA flag instead of tokens
      return {
        requires2FA: true,
        email: user.email,
      };
    }

    // Return user info - tokens will be generated in controller with device tracking
    logger.info('User logged in successfully', { userId: user.id, email });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        businessName: user.businessName,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  /**
   * Verify 2FA and complete login
   */
  async verify2FA(email: string, password: string, token: string): Promise<{
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      role: UserRole;
      businessName: string | null;
      isEmailVerified: boolean;
    };
  }> {
    // First verify password
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new ValidationError('2FA is not enabled for this account');
    }

    // Verify TOTP token
    const isValidToken = twoFactorService.verifyToken(user.twoFactorSecret, token);
    if (!isValidToken) {
      throw new UnauthorizedError('Invalid 2FA code');
    }

    // Return user info - tokens will be generated in controller with device tracking
    logger.info('User logged in successfully with 2FA', { userId: user.id, email });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        businessName: user.businessName,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  /**
   * Verify 2FA using backup code
   */
  async verify2FABackup(email: string, password: string, backupCode: string): Promise<{
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      role: UserRole;
      businessName: string | null;
      isEmailVerified: boolean;
    };
    remainingBackupCodes: number;
  }> {
    // First verify password
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.twoFactorEnabled) {
      throw new ValidationError('2FA is not enabled for this account');
    }

    // Verify backup code
    const result = await twoFactorService.verifyBackupCode(user.id, backupCode);

    // Return user info - tokens will be generated in controller with device tracking
    logger.info('User logged in successfully with 2FA backup code', { userId: user.id, email });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        businessName: user.businessName,
        isEmailVerified: user.isEmailVerified,
      },
      remainingBackupCodes: result.remainingCodes,
    };
  }

  /**
   * Generate tokens with device tracking
   */
  async generateTokens(
    payload: TokenPayload,
    deviceInfo?: DeviceInfo,
    ipAddress?: string
  ): Promise<{ accessToken: string; refreshToken: string; refreshTokenId: string }> {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    // Generate a secure random token for refresh token
    const refreshTokenValue = randomBytes(32).toString('hex');
    
    // Calculate expiry date
    const expiresAt = new Date();
    const refreshExpiresIn = parseInt(env.JWT_REFRESH_EXPIRES_IN.replace('d', '')) || 30;
    expiresAt.setDate(expiresAt.getDate() + refreshExpiresIn);

    // Create refresh token record in database
    const refreshTokenRecord = await prisma.refreshToken.create({
      data: {
        userId: payload.userId,
        token: refreshTokenValue,
        deviceName: deviceInfo?.deviceName,
        deviceType: deviceInfo?.deviceType,
        userAgent: deviceInfo?.userAgent,
        ipAddress: ipAddress,
        lastUsedAt: new Date(),
        expiresAt,
      },
    });

    // Sign the refresh token with the database ID
    const refreshToken = jwt.sign(
      { ...payload, refreshTokenId: refreshTokenRecord.id },
      env.JWT_REFRESH_SECRET,
      {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
      }
    );

    return {
      accessToken,
      refreshToken,
      refreshTokenId: refreshTokenRecord.id,
    };
  }

  /**
   * Legacy generateTokens for backward compatibility (without device tracking)
   */
  generateTokensLegacy(payload: TokenPayload) {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  verifyToken(token: string, isRefresh = false): TokenPayload {
    try {
      const secret = isRefresh ? env.JWT_REFRESH_SECRET : env.JWT_SECRET;
      const payload = jwt.verify(token, secret) as TokenPayload;
      return payload;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  async refreshToken(
    refreshToken: string,
    deviceInfo?: DeviceInfo,
    ipAddress?: string
  ): Promise<{ accessToken: string; refreshToken: string; refreshTokenId: string }> {
    const payload = this.verifyToken(refreshToken, true);

    // Extract refreshTokenId from payload if it exists (new format)
    const refreshTokenId = (payload as any).refreshTokenId;

    if (refreshTokenId) {
      // New token rotation flow
      const refreshTokenRecord = await prisma.refreshToken.findUnique({
        where: { id: refreshTokenId },
        include: { user: true },
      });

      if (!refreshTokenRecord) {
        throw new UnauthorizedError('Refresh token not found');
      }

      if (refreshTokenRecord.revokedAt) {
        throw new UnauthorizedError('Refresh token has been revoked');
      }

      if (refreshTokenRecord.expiresAt < new Date()) {
        throw new UnauthorizedError('Refresh token has expired');
      }

      const user = refreshTokenRecord.user;
      if (!user || !user.isActive) {
        throw new UnauthorizedError('User not found or inactive');
      }

      // Revoke old token
      await prisma.refreshToken.update({
        where: { id: refreshTokenId },
        data: { revokedAt: new Date() },
      });

      // Generate new tokens with device tracking
      const newTokens = await this.generateTokens(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        deviceInfo || {
          deviceName: refreshTokenRecord.deviceName || 'Unknown Device',
          deviceType: (refreshTokenRecord.deviceType as 'MOBILE' | 'DESKTOP' | 'TABLET' | 'UNKNOWN') || 'UNKNOWN',
          userAgent: refreshTokenRecord.userAgent || '',
        },
        ipAddress || refreshTokenRecord.ipAddress || undefined
      );

      // Update last used timestamp on old token (before revoking)
      await prisma.refreshToken.update({
        where: { id: refreshTokenId },
        data: { lastUsedAt: new Date() },
      });

      logger.info('Token refreshed with rotation', { userId: user.id, oldTokenId: refreshTokenId });

      return newTokens;
    } else {
      // Legacy flow - no token rotation, but verify user
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedError('User not found or inactive');
      }

      // Legacy flow - generate tokens without device tracking
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN as any }
      );

      const refreshTokenValue = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        env.JWT_REFRESH_SECRET,
        { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any }
      );

      return {
        accessToken,
        refreshToken: refreshTokenValue,
        refreshTokenId: '',
      };
    }
  }
}

export default new AuthService();

