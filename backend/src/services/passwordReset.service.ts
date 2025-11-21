import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { ValidationError, UnauthorizedError } from '../utils/errors';
import emailService from './delivery/email.service';
import logger from '../utils/logger';
import { env } from '../config/env';

export class PasswordResetService {
  /**
   * Request password reset
   */
  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists for security
    if (!user) {
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    // Delete any existing reset tokens
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Generate reset token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    // Create reset token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Generate reset URL
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    // Send reset email
    try {
      await emailService.sendEmail({
        to: email,
        subject: 'Reset Your Password',
        html: this.generatePasswordResetEmailTemplate(resetUrl, user.firstName || 'User'),
      });
      logger.info('Password reset email sent', { userId: user.id, email });
    } catch (error) {
      logger.error('Failed to send password reset email', { userId: user.id, email, error });
      throw new ValidationError('Failed to send password reset email');
    }

    return { message: 'If the email exists, a password reset link has been sent' };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string) {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      throw new ValidationError('Invalid reset token');
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      throw new ValidationError('Reset token has expired');
    }

    // Check if token has been used
    if (resetToken.used) {
      throw new ValidationError('Reset token has already been used');
    }

    // Validate password complexity
    this.validatePasswordComplexity(newPassword);

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    // Clear failed login attempts
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    logger.info('Password reset successfully', { userId: resetToken.userId });

    return {
      message: 'Password reset successfully',
    };
  }

  /**
   * Validate password complexity
   */
  private validatePasswordComplexity(password: string) {
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      throw new ValidationError('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      throw new ValidationError('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      throw new ValidationError('Password must contain at least one number');
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      throw new ValidationError('Password must contain at least one special character');
    }
  }

  /**
   * Generate password reset email template
   */
  private generatePasswordResetEmailTemplate(resetUrl: string, firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Reset Your Password</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px;">Hi ${firstName},</p>
          
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
          </div>
          
          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #667eea; font-size: 12px; word-break: break-all;">${resetUrl}</p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
      </body>
      </html>
    `;
  }
}

export default new PasswordResetService();

