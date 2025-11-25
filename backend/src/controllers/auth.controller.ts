import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { ValidationError, UnauthorizedError } from '../utils/errors';
import prisma from '../config/database';
import auditLogService from '../services/audit-log.service';
import { AuthRequest } from '../middleware/auth.middleware';
import deviceService from '../services/device.service';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        data: result,
        message: 'User registered successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      
      // If 2FA is required, return early
      if ('requires2FA' in result && result.requires2FA) {
        res.json({
          success: true,
          data: result,
          message: '2FA verification required',
        });
        return;
      }

      // Type guard: if not 2FA, must have user
      if (!('user' in result) || !result.user) {
        throw new UnauthorizedError('Login failed');
      }

      // Extract device info for token generation
      const userAgent = req.headers['user-agent'] || '';
      const ipAddress = deviceService.getClientIP(req);
      const deviceInfo = deviceService.parseUserAgent(userAgent);

      // Generate tokens with device tracking
      const tokens = await authService.generateTokens(
        {
          userId: result.user.id,
          email: result.user.email,
          role: result.user.role,
        },
        deviceInfo,
        ipAddress
      );

      // Log successful login
      await auditLogService.logAuth('LOGIN_SUCCESS', {
        userId: result.user.id,
        userEmail: result.user.email,
        ipAddress,
        userAgent,
      });
      
      res.json({
        success: true,
        data: {
          user: result.user,
          ...tokens,
        },
        message: 'Login successful',
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new ValidationError('Refresh token is required');
      }

      // Extract device info
      const userAgent = req.headers['user-agent'] || '';
      const ipAddress = deviceService.getClientIP(req);
      const deviceInfo = deviceService.parseUserAgent(userAgent);

      const tokens = await authService.refreshToken(refreshToken, deviceInfo, ipAddress);
      
      // Also return user info for convenience
      const payload = authService.verifyToken(tokens.accessToken, false);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          businessName: true,
          isEmailVerified: true,
        },
      });

      res.json({
        success: true,
        data: {
          ...tokens,
          user: user || null,
        },
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.userId;

      if (!userId) {
        throw new UnauthorizedError('Authentication required');
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          businessName: true,
          isEmailVerified: true,
          isActive: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      res.json({
        success: true,
        data: user,
        message: 'Profile retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();

