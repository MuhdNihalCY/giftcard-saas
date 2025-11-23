import { randomBytes } from 'crypto';
import prisma from '../config/database';
import { ValidationError, UnauthorizedError } from '../utils/errors';
import emailService from './delivery/email.service';
import logger from '../utils/logger';
import { env } from '../config/env';

export class EmailVerificationService {
  /**
   * Generate and send verification email
   */
  async sendVerificationEmail(userId: string, email: string) {
    // Delete any existing verification tokens
    await prisma.emailVerificationToken.deleteMany({
      where: { userId },
    });

    // Generate verification token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

    // Create verification token
    await prisma.emailVerificationToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    // Generate verification URL
    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;

    // Send verification email
    try {
      await emailService.sendEmail({
        to: email,
        subject: 'Verify Your Email Address',
        html: this.generateVerificationEmailTemplate(verificationUrl),
      });
      logger.info('Verification email sent', { userId, email });
    } catch (error) {
      logger.error('Failed to send verification email', { userId, email, error });
      throw new ValidationError('Failed to send verification email');
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string) {
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      throw new ValidationError('Invalid verification token');
    }

    // Check if token is expired
    if (verificationToken.expiresAt < new Date()) {
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });
      throw new ValidationError('Verification token has expired');
    }

    // Check if email is already verified
    if (verificationToken.user.isEmailVerified) {
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });
      throw new ValidationError('Email is already verified');
    }

    // Update user email verification status
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { isEmailVerified: true },
    });

    // Delete verification token
    await prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    });

    logger.info('Email verified successfully', { userId: verificationToken.userId });

    return {
      message: 'Email verified successfully',
    };
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists for security
      return { message: 'If the email exists, a verification link has been sent' };
    }

    if (user.isEmailVerified) {
      throw new ValidationError('Email is already verified');
    }

    await this.sendVerificationEmail(user.id, user.email);

    return { message: 'Verification email sent' };
  }

  /**
   * Generate verification email template
   */
  private generateVerificationEmailTemplate(verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Verify Your Email Address</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px;">Thank you for signing up!</p>
          
          <p>Please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email Address</a>
          </div>
          
          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #667eea; font-size: 12px; word-break: break-all;">${verificationUrl}</p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
            This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      </body>
      </html>
    `;
  }
}

export default new EmailVerificationService();


