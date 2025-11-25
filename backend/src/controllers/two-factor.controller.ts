/**
 * Two-Factor Authentication Controller
 */

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import twoFactorService from '../services/two-factor.service';
import authService from '../services/auth.service';
import { ValidationError, UnauthorizedError } from '../utils/errors';
import logger from '../utils/logger';
import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import deviceService from '../services/device.service';

export class TwoFactorController {
  /**
   * Setup 2FA - Generate secret and QR code
   * GET /auth/2fa/setup
   */
  async setup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          twoFactorEnabled: true,
        },
      });

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      if (user.twoFactorEnabled) {
        throw new ValidationError('2FA is already enabled');
      }

      const setup = await twoFactorService.setup2FA(userId, user.email);

      res.json({
        success: true,
        data: setup,
        message: '2FA setup generated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Enable 2FA
   * POST /auth/2fa/enable
   */
  async enable(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { secret, token } = req.body;

      // Verify the token before enabling
      const isValid = twoFactorService.verifyToken(secret, token);
      if (!isValid) {
        throw new ValidationError('Invalid verification code');
      }

      // Get backup codes from setup (they should be stored temporarily or regenerated)
      const backupCodes = twoFactorService.generateBackupCodes();

      await twoFactorService.enable2FA(userId, secret, backupCodes);

      logger.info('2FA enabled', { userId });

      res.json({
        success: true,
        data: {
          backupCodes,
        },
        message: '2FA enabled successfully. Please save your backup codes.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify 2FA during login
   * POST /auth/2fa/verify
   */
  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, token } = req.body;

      const result = await authService.verify2FA(email, password, token);

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

      res.json({
        success: true,
        data: {
          user: result.user,
          ...tokens,
        },
        message: '2FA verified successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify 2FA using backup code
   * POST /auth/2fa/verify-backup
   */
  async verifyBackup(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, backupCode } = req.body;

      const result = await authService.verify2FABackup(email, password, backupCode);

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

      res.json({
        success: true,
        data: {
          user: result.user,
          ...tokens,
          remainingBackupCodes: result.remainingBackupCodes,
        },
        message: 'Backup code verified successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Disable 2FA
   * POST /auth/2fa/disable
   */
  async disable(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { password } = req.body;

      // Verify password
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          passwordHash: true,
        },
      });

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid password');
      }

      await twoFactorService.disable2FA(userId);

      logger.info('2FA disabled', { userId });

      res.json({
        success: true,
        message: '2FA disabled successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get backup codes (regenerate if needed)
   * GET /auth/2fa/backup-codes
   */
  async getBackupCodes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const remainingCount = await twoFactorService.getRemainingBackupCodesCount(userId);

      if (remainingCount === 0) {
        // Regenerate backup codes
        const backupCodes = await twoFactorService.regenerateBackupCodes(userId);

        res.json({
          success: true,
          data: {
            backupCodes,
            regenerated: true,
          },
          message: 'Backup codes regenerated',
        });
      } else {
        res.json({
          success: true,
          data: {
            remainingCount,
            regenerated: false,
          },
          message: `You have ${remainingCount} backup codes remaining`,
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Regenerate backup codes
   * POST /auth/2fa/backup-codes/regenerate
   */
  async regenerateBackupCodes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const backupCodes = await twoFactorService.regenerateBackupCodes(userId);

      logger.info('Backup codes regenerated', { userId });

      res.json({
        success: true,
        data: {
          backupCodes,
        },
        message: 'Backup codes regenerated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get 2FA status
   * GET /auth/2fa/status
   */
  async getStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          twoFactorEnabled: true,
        },
      });

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      const remainingBackupCodes = await twoFactorService.getRemainingBackupCodesCount(userId);

      res.json({
        success: true,
        data: {
          enabled: user.twoFactorEnabled,
          remainingBackupCodes,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new TwoFactorController();

