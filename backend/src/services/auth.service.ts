import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import prisma from '../config/database';
import { UnauthorizedError, ValidationError } from '../utils/errors';
import { UserRole } from '@prisma/client';
import logger from '../utils/logger';

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
    import emailVerificationService from './emailVerification.service';
    emailVerificationService.sendVerificationEmail(user.id, user.email).catch((error) => {
      logger.error('Failed to send verification email during registration', { userId: user.id, error });
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

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

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
      ...tokens,
    };
  }

  generateTokens(payload: TokenPayload) {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
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

  async refreshToken(refreshToken: string) {
    const payload = this.verifyToken(refreshToken, true);

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }

    // Generate new tokens
    return this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  }
}

export default new AuthService();

