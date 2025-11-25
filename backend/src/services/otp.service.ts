import { randomInt } from 'crypto';
import prisma from '../config/database';
import { ValidationError } from '../utils/errors';
import logger from '../utils/logger';
import communicationSettingsService from './communicationSettings.service';
import emailService from './delivery/email.service';
import smsService from './delivery/sms.service';

export type OTPType = 'LOGIN' | 'VERIFICATION' | 'PASSWORD_RESET' | 'TRANSACTION' | '2FA';

export interface GenerateOTPOptions {
  identifier: string; // email or phone number
  type: OTPType;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface VerifyOTPOptions {
  identifier: string;
  code: string;
  type: OTPType;
  userId?: string;
}

export class OTPService {
  /**
   * Generate and send OTP
   */
  async generateAndSendOTP(options: GenerateOTPOptions) {
    const { identifier, type, userId, metadata } = options;

    // Check if OTP is enabled
    const otpConfig = await communicationSettingsService.getOTPConfig();
    if (!otpConfig.enabled) {
      throw new ValidationError('OTP service is currently disabled by administrator');
    }

    // Check rate limiting
    await this.checkRateLimit(identifier, type);

    // Delete any existing unused OTPs for this identifier and type
    await prisma.oTP.deleteMany({
      where: {
        identifier,
        type,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    // Generate OTP code
    const code = this.generateOTPCode(otpConfig.length);

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + otpConfig.expiryMinutes);

    // Store OTP
    await prisma.oTP.create({
      data: {
        userId,
        identifier,
        code,
        type,
        expiresAt,
        metadata: metadata || {},
      },
    });

    // Send OTP via appropriate channel
    try {
      if (this.isEmail(identifier)) {
        await this.sendOTPViaEmail(identifier, code, type, otpConfig.expiryMinutes);
      } else if (this.isPhoneNumber(identifier)) {
        await this.sendOTPViaSMS(identifier, code, type, otpConfig.expiryMinutes);
      } else {
        throw new ValidationError('Invalid identifier format. Must be email or phone number.');
      }

      logger.info('OTP generated and sent', { identifier, type, userId });
    } catch (error: any) {
      logger.error('Failed to send OTP', { identifier, type, error: error.message });
      throw new ValidationError(`Failed to send OTP: ${error.message}`);
    }

    return {
      message: 'OTP sent successfully',
      expiresIn: otpConfig.expiryMinutes,
    };
  }

  /**
   * Verify OTP
   */
  async verifyOTP(options: VerifyOTPOptions): Promise<boolean> {
    const { identifier, code, type, userId } = options;

    // Find OTP
    const otp = await prisma.oTP.findFirst({
      where: {
        identifier,
        code,
        type,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
        ...(userId && { userId }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otp) {
      // Increment attempts for failed verification
      await prisma.oTP.updateMany({
        where: {
          identifier,
          type,
          used: false,
        },
        data: {
          attempts: {
            increment: 1,
          },
        },
      });

      throw new ValidationError('Invalid or expired OTP');
    }

    // Check max attempts (5 attempts)
    if (otp.attempts >= 5) {
      await prisma.oTP.update({
        where: { id: otp.id },
        data: { used: true }, // Mark as used to prevent further attempts
      });
      throw new ValidationError('OTP has exceeded maximum verification attempts');
    }

    // Mark OTP as used
    await prisma.oTP.update({
      where: { id: otp.id },
      data: { used: true },
    });

    logger.info('OTP verified successfully', { identifier, type, userId });

    return true;
  }

  /**
   * Check rate limit for OTP generation
   */
  private async checkRateLimit(identifier: string, type: OTPType) {
    const otpConfig = await communicationSettingsService.getOTPConfig();
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const recentOTPs = await prisma.oTP.count({
      where: {
        identifier,
        type,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });

    if (recentOTPs >= otpConfig.rateLimit) {
      throw new ValidationError(
        `OTP rate limit exceeded. Please try again after some time. (Limit: ${otpConfig.rateLimit} per hour)`
      );
    }
  }

  /**
   * Generate OTP code
   */
  private generateOTPCode(length: number): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return randomInt(min, max + 1).toString().padStart(length, '0');
  }

  /**
   * Check if identifier is email
   */
  private isEmail(identifier: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  }

  /**
   * Check if identifier is phone number
   */
  private isPhoneNumber(identifier: string): boolean {
    return /^\+?[1-9]\d{1,14}$/.test(identifier.replace(/\s/g, ''));
  }

  /**
   * Send OTP via email
   */
  private async sendOTPViaEmail(
    email: string,
    code: string,
    type: OTPType,
    expiryMinutes: number
  ) {
    const subject = this.getOTPEmailSubject(type);
    const html = this.generateOTPEmailTemplate(code, type, expiryMinutes);

    await emailService.sendEmail({
      to: email,
      subject,
      html,
    });
  }

  /**
   * Send OTP via SMS
   */
  private async sendOTPViaSMS(
    phone: string,
    code: string,
    type: OTPType,
    expiryMinutes: number
  ) {
    const message = this.getOTPSMSMessage(code, type, expiryMinutes);

    await smsService.sendSMS({
      to: phone,
      message,
    });
  }

  /**
   * Get OTP email subject
   */
  private getOTPEmailSubject(type: OTPType): string {
    switch (type) {
      case 'LOGIN':
        return 'Your Login OTP Code';
      case 'VERIFICATION':
        return 'Your Verification OTP Code';
      case 'PASSWORD_RESET':
        return 'Your Password Reset OTP Code';
      case 'TRANSACTION':
        return 'Your Transaction OTP Code';
      case '2FA':
        return 'Your Two-Factor Authentication Code';
      default:
        return 'Your OTP Code';
    }
  }

  /**
   * Get OTP SMS message
   */
  private getOTPSMSMessage(code: string, type: OTPType, expiryMinutes: number): string {
    const typeText = type.replace('_', ' ').toLowerCase();
    return `Your ${typeText} OTP is: ${code}. Valid for ${expiryMinutes} minutes. Do not share this code.`;
  }

  /**
   * Generate OTP email template
   */
  private generateOTPEmailTemplate(code: string, type: OTPType, expiryMinutes: number): string {
    const typeText = type.replace('_', ' ').toLowerCase();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Code</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Your OTP Code</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px;">Your ${typeText} OTP code is:</p>
          
          <div style="background: white; border: 2px dashed #667eea; border-radius: 10px; padding: 30px; margin: 20px 0; text-align: center;">
            <p style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea; margin: 0;">${code}</p>
          </div>
          
          <p style="color: #666; font-size: 14px;">This code will expire in <strong>${expiryMinutes} minutes</strong>.</p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
            For security reasons, do not share this code with anyone. If you didn't request this code, please ignore this email.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Resend OTP
   */
  async resendOTP(options: GenerateOTPOptions) {
    return this.generateAndSendOTP(options);
  }
}

export default new OTPService();


