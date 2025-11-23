"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationSettingsService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
class CommunicationSettingsService {
    static SETTINGS_ID = 'global-settings'; // Single global settings record
    /**
     * Get current communication settings
     */
    async getSettings() {
        let settings = await database_1.default.communicationSettings.findUnique({
            where: { id: this.SETTINGS_ID },
        });
        // Create default settings if they don't exist
        if (!settings) {
            settings = await database_1.default.communicationSettings.create({
                data: {
                    id: this.SETTINGS_ID,
                    emailEnabled: true,
                    smsEnabled: true,
                    otpEnabled: true,
                    pushEnabled: false,
                    emailRateLimit: 100,
                    smsRateLimit: 50,
                    otpRateLimit: 10,
                    otpExpiryMinutes: 10,
                    otpLength: 6,
                },
            });
            logger_1.default.info('Created default communication settings');
        }
        return settings;
    }
    /**
     * Update communication settings (Admin only)
     */
    async updateSettings(data, updatedBy) {
        // Validate rate limits
        if (data.emailRateLimit !== undefined && data.emailRateLimit < 1) {
            throw new errors_1.ValidationError('Email rate limit must be at least 1');
        }
        if (data.smsRateLimit !== undefined && data.smsRateLimit < 1) {
            throw new errors_1.ValidationError('SMS rate limit must be at least 1');
        }
        if (data.otpRateLimit !== undefined && data.otpRateLimit < 1) {
            throw new errors_1.ValidationError('OTP rate limit must be at least 1');
        }
        if (data.otpExpiryMinutes !== undefined && (data.otpExpiryMinutes < 1 || data.otpExpiryMinutes > 60)) {
            throw new errors_1.ValidationError('OTP expiry must be between 1 and 60 minutes');
        }
        if (data.otpLength !== undefined && (data.otpLength < 4 || data.otpLength > 8)) {
            throw new errors_1.ValidationError('OTP length must be between 4 and 8 digits');
        }
        const settings = await this.getSettings();
        const updated = await database_1.default.communicationSettings.update({
            where: { id: this.SETTINGS_ID },
            data: {
                ...data,
                updatedBy,
            },
        });
        logger_1.default.info('Communication settings updated', { updatedBy, changes: data });
        return updated;
    }
    /**
     * Check if email is enabled
     */
    async isEmailEnabled() {
        const settings = await this.getSettings();
        return settings.emailEnabled;
    }
    /**
     * Check if SMS is enabled
     */
    async isSMSEnabled() {
        const settings = await this.getSettings();
        return settings.smsEnabled;
    }
    /**
     * Check if OTP is enabled
     */
    async isOTPEnabled() {
        const settings = await this.getSettings();
        return settings.otpEnabled;
    }
    /**
     * Check if push notifications are enabled
     */
    async isPushEnabled() {
        const settings = await this.getSettings();
        return settings.pushEnabled;
    }
    /**
     * Get rate limit for a channel
     */
    async getRateLimit(channel) {
        const settings = await this.getSettings();
        switch (channel) {
            case 'email':
                return settings.emailRateLimit;
            case 'sms':
                return settings.smsRateLimit;
            case 'otp':
                return settings.otpRateLimit;
            default:
                return 10;
        }
    }
    /**
     * Get OTP configuration
     */
    async getOTPConfig() {
        const settings = await this.getSettings();
        return {
            enabled: settings.otpEnabled,
            expiryMinutes: settings.otpExpiryMinutes,
            length: settings.otpLength,
            rateLimit: settings.otpRateLimit,
        };
    }
}
exports.CommunicationSettingsService = CommunicationSettingsService;
exports.default = new CommunicationSettingsService();
//# sourceMappingURL=communicationSettings.service.js.map