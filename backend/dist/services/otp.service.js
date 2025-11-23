"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPService = void 0;
const crypto_1 = require("crypto");
const database_1 = __importDefault(require("../config/database"));
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const communicationSettings_service_1 = __importDefault(require("./communicationSettings.service"));
const email_service_1 = __importDefault(require("./delivery/email.service"));
const sms_service_1 = __importDefault(require("./delivery/sms.service"));
class OTPService {
    /**
     * Generate and send OTP
     */
    async generateAndSendOTP(options) {
        const { identifier, type, userId, metadata } = options;
        // Check if OTP is enabled
        const otpConfig = await communicationSettings_service_1.default.getOTPConfig();
        if (!otpConfig.enabled) {
            throw new errors_1.ValidationError('OTP service is currently disabled by administrator');
        }
        // Check rate limiting
        await this.checkRateLimit(identifier, type);
        // Delete any existing unused OTPs for this identifier and type
        await database_1.default.oTP.deleteMany({
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
        const otp = await database_1.default.oTP.create({
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
            }
            else if (this.isPhoneNumber(identifier)) {
                await this.sendOTPViaSMS(identifier, code, type, otpConfig.expiryMinutes);
            }
            else {
                throw new errors_1.ValidationError('Invalid identifier format. Must be email or phone number.');
            }
            logger_1.default.info('OTP generated and sent', { identifier, type, userId });
        }
        catch (error) {
            logger_1.default.error('Failed to send OTP', { identifier, type, error: error.message });
            throw new errors_1.ValidationError(`Failed to send OTP: ${error.message}`);
        }
        return {
            message: 'OTP sent successfully',
            expiresIn: otpConfig.expiryMinutes,
        };
    }
    /**
     * Verify OTP
     */
    async verifyOTP(options) {
        const { identifier, code, type, userId } = options;
        // Find OTP
        const otp = await database_1.default.oTP.findFirst({
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
            await database_1.default.oTP.updateMany({
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
            throw new errors_1.ValidationError('Invalid or expired OTP');
        }
        // Check max attempts (5 attempts)
        if (otp.attempts >= 5) {
            await database_1.default.oTP.update({
                where: { id: otp.id },
                data: { used: true }, // Mark as used to prevent further attempts
            });
            throw new errors_1.ValidationError('OTP has exceeded maximum verification attempts');
        }
        // Mark OTP as used
        await database_1.default.oTP.update({
            where: { id: otp.id },
            data: { used: true },
        });
        logger_1.default.info('OTP verified successfully', { identifier, type, userId });
        return true;
    }
    /**
     * Check rate limit for OTP generation
     */
    async checkRateLimit(identifier, type) {
        const otpConfig = await communicationSettings_service_1.default.getOTPConfig();
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);
        const recentOTPs = await database_1.default.oTP.count({
            where: {
                identifier,
                type,
                createdAt: {
                    gte: oneHourAgo,
                },
            },
        });
        if (recentOTPs >= otpConfig.rateLimit) {
            throw new errors_1.ValidationError(`OTP rate limit exceeded. Please try again after some time. (Limit: ${otpConfig.rateLimit} per hour)`);
        }
    }
    /**
     * Generate OTP code
     */
    generateOTPCode(length) {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        return (0, crypto_1.randomInt)(min, max + 1).toString().padStart(length, '0');
    }
    /**
     * Check if identifier is email
     */
    isEmail(identifier) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    }
    /**
     * Check if identifier is phone number
     */
    isPhoneNumber(identifier) {
        return /^\+?[1-9]\d{1,14}$/.test(identifier.replace(/\s/g, ''));
    }
    /**
     * Send OTP via email
     */
    async sendOTPViaEmail(email, code, type, expiryMinutes) {
        const subject = this.getOTPEmailSubject(type);
        const html = this.generateOTPEmailTemplate(code, type, expiryMinutes);
        await email_service_1.default.sendEmail({
            to: email,
            subject,
            html,
        });
    }
    /**
     * Send OTP via SMS
     */
    async sendOTPViaSMS(phone, code, type, expiryMinutes) {
        const message = this.getOTPSMSMessage(code, type, expiryMinutes);
        await sms_service_1.default.sendSMS({
            to: phone,
            message,
        });
    }
    /**
     * Get OTP email subject
     */
    getOTPEmailSubject(type) {
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
    getOTPSMSMessage(code, type, expiryMinutes) {
        const typeText = type.replace('_', ' ').toLowerCase();
        return `Your ${typeText} OTP is: ${code}. Valid for ${expiryMinutes} minutes. Do not share this code.`;
    }
    /**
     * Generate OTP email template
     */
    generateOTPEmailTemplate(code, type, expiryMinutes) {
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
    async resendOTP(options) {
        return this.generateAndSendOTP(options);
    }
}
exports.OTPService = OTPService;
exports.default = new OTPService();
//# sourceMappingURL=otp.service.js.map