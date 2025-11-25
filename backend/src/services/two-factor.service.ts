/**
 * Two-Factor Authentication Service
 * Handles TOTP generation, verification, QR codes, and backup codes
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { ValidationError } from '../utils/errors';
import logger from '../utils/logger';
import { env } from '../config/env';

export interface TwoFactorSetupResult {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface BackupCodeVerificationResult {
  valid: boolean;
  remainingCodes: number;
}

export class TwoFactorService {
  private readonly issuer = env.APP_NAME || 'Gift Card SaaS';
  private readonly backupCodeCount = 10;
  private readonly backupCodeLength = 8;

  /**
   * Generate a new TOTP secret for a user
   */
  generateSecret(userId: string): string {
    const secret = speakeasy.generateSecret({
      name: `${this.issuer} (${userId})`,
      length: 32,
    });

    return secret.base32 || '';
  }

  /**
   * Generate QR code data URL for TOTP secret
   */
  async generateQRCode(secret: string, email: string): Promise<string> {
    try {
      const otpAuthUrl = speakeasy.otpauthURL({
        secret,
        label: email,
        issuer: this.issuer,
        encoding: 'base32',
      });

      const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl);
      return qrCodeUrl;
    } catch (error) {
      logger.error('Failed to generate QR code', { error });
      throw new ValidationError('Failed to generate QR code');
    }
  }

  /**
   * Verify TOTP token
   */
  verifyToken(secret: string, token: string): boolean {
    try {
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2, // Allow 2 time steps (60 seconds) of tolerance
      });

      return verified || false;
    } catch (error) {
      logger.error('Failed to verify TOTP token', { error });
      return false;
    }
  }

  /**
   * Generate backup codes
   */
  generateBackupCodes(count: number = this.backupCodeCount): string[] {
    const codes: string[] = [];
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing characters

    for (let i = 0; i < count; i++) {
      let code = '';
      for (let j = 0; j < this.backupCodeLength; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      codes.push(code);
    }

    return codes;
  }

  /**
   * Hash backup codes for storage
   */
  async hashBackupCodes(codes: string[]): Promise<string[]> {
    return Promise.all(codes.map((code) => bcrypt.hash(code, 10)));
  }

  /**
   * Verify and consume a backup code
   */
  async verifyBackupCode(userId: string, code: string): Promise<BackupCodeVerificationResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorBackupCodes: true,
      },
    });

    if (!user || !user.twoFactorBackupCodes) {
      throw new ValidationError('No backup codes found');
    }

    const backupCodes = user.twoFactorBackupCodes as string[];
    let valid = false;
    let remainingCodes = backupCodes.length;

    // Try to match the code against hashed backup codes
    for (let i = 0; i < backupCodes.length; i++) {
      const hashedCode = backupCodes[i];
      const isMatch = await bcrypt.compare(code, hashedCode);

      if (isMatch) {
        valid = true;
        // Remove the used code
        backupCodes.splice(i, 1);
        remainingCodes = backupCodes.length;

        // Update user with remaining codes
        await prisma.user.update({
          where: { id: userId },
          data: {
            twoFactorBackupCodes: backupCodes.length > 0 ? backupCodes : undefined,
          },
        });

        break;
      }
    }

    if (!valid) {
      throw new ValidationError('Invalid backup code');
    }

    return {
      valid: true,
      remainingCodes,
    };
  }

  /**
   * Setup 2FA for a user (generate secret and backup codes)
   */
  async setup2FA(userId: string, email: string): Promise<TwoFactorSetupResult> {
    const secret = this.generateSecret(userId);
    const qrCodeUrl = await this.generateQRCode(secret, email);
    const backupCodes = this.generateBackupCodes();

    return {
      secret,
      qrCodeUrl,
      backupCodes,
    };
  }

  /**
   * Enable 2FA for a user
   */
  async enable2FA(userId: string, secret: string, backupCodes: string[]): Promise<void> {
    const hashedBackupCodes = await this.hashBackupCodes(backupCodes);

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        twoFactorBackupCodes: hashedBackupCodes,
      },
    });

    logger.info('2FA enabled for user', { userId });
  }

  /**
   * Disable 2FA for a user
   */
  async disable2FA(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: undefined,
      },
    });

    logger.info('2FA disabled for user', { userId });
  }

  /**
   * Regenerate backup codes for a user
   */
  async regenerateBackupCodes(userId: string): Promise<string[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorEnabled: true,
      },
    });

    if (!user || !user.twoFactorEnabled) {
      throw new ValidationError('2FA is not enabled');
    }

    const backupCodes = this.generateBackupCodes();
    const hashedBackupCodes = await this.hashBackupCodes(backupCodes);

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorBackupCodes: hashedBackupCodes,
      },
    });

    logger.info('Backup codes regenerated for user', { userId });

    return backupCodes;
  }

  /**
   * Get remaining backup codes count
   */
  async getRemainingBackupCodesCount(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorBackupCodes: true,
      },
    });

    if (!user || !user.twoFactorBackupCodes) {
      return 0;
    }

    const backupCodes = user.twoFactorBackupCodes as string[];
    return backupCodes.length;
  }
}

export default new TwoFactorService();

