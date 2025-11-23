"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailVerificationService = void 0;
const crypto_1 = require("crypto");
const database_1 = __importDefault(require("../config/database"));
const errors_1 = require("../utils/errors");
const email_service_1 = __importDefault(require("./delivery/email.service"));
const logger_1 = __importDefault(require("../utils/logger"));
const env_1 = require("../config/env");
class EmailVerificationService {
    /**
     * Generate and send verification email
     */
    async sendVerificationEmail(userId, email) {
        // Delete any existing verification tokens
        await database_1.default.emailVerificationToken.deleteMany({
            where: { userId },
        });
        // Generate verification token
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry
        // Create verification token
        await database_1.default.emailVerificationToken.create({
            data: {
                userId,
                token,
                expiresAt,
            },
        });
        // Generate verification URL
        const verificationUrl = `${env_1.env.FRONTEND_URL}/verify-email?token=${token}`;
        // Send verification email
        try {
            await email_service_1.default.sendEmail({
                to: email,
                subject: 'Verify Your Email Address',
                html: this.generateVerificationEmailTemplate(verificationUrl),
            });
            logger_1.default.info('Verification email sent', { userId, email });
        }
        catch (error) {
            logger_1.default.error('Failed to send verification email', { userId, email, error });
            throw new errors_1.ValidationError('Failed to send verification email');
        }
    }
    /**
     * Verify email with token
     */
    async verifyEmail(token) {
        const verificationToken = await database_1.default.emailVerificationToken.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!verificationToken) {
            throw new errors_1.ValidationError('Invalid verification token');
        }
        // Check if token is expired
        if (verificationToken.expiresAt < new Date()) {
            await database_1.default.emailVerificationToken.delete({
                where: { id: verificationToken.id },
            });
            throw new errors_1.ValidationError('Verification token has expired');
        }
        // Check if email is already verified
        if (verificationToken.user.isEmailVerified) {
            await database_1.default.emailVerificationToken.delete({
                where: { id: verificationToken.id },
            });
            throw new errors_1.ValidationError('Email is already verified');
        }
        // Update user email verification status
        await database_1.default.user.update({
            where: { id: verificationToken.userId },
            data: { isEmailVerified: true },
        });
        // Delete verification token
        await database_1.default.emailVerificationToken.delete({
            where: { id: verificationToken.id },
        });
        logger_1.default.info('Email verified successfully', { userId: verificationToken.userId });
        return {
            message: 'Email verified successfully',
        };
    }
    /**
     * Resend verification email
     */
    async resendVerificationEmail(email) {
        const user = await database_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            // Don't reveal if user exists for security
            return { message: 'If the email exists, a verification link has been sent' };
        }
        if (user.isEmailVerified) {
            throw new errors_1.ValidationError('Email is already verified');
        }
        await this.sendVerificationEmail(user.id, user.email);
        return { message: 'Verification email sent' };
    }
    /**
     * Generate verification email template
     */
    generateVerificationEmailTemplate(verificationUrl) {
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
exports.EmailVerificationService = EmailVerificationService;
exports.default = new EmailVerificationService();
//# sourceMappingURL=emailVerification.service.js.map