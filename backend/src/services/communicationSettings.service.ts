import { AdminRepository } from '../modules/admin/admin.repository';
import { ValidationError } from '../utils/errors';
import logger from '../utils/logger';

export interface CommunicationSettingsData {
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  otpEnabled?: boolean;
  pushEnabled?: boolean;
  emailRateLimit?: number;
  smsRateLimit?: number;
  otpRateLimit?: number;
  otpExpiryMinutes?: number;
  otpLength?: number;
}

export class CommunicationSettingsService {
  private readonly repository = new AdminRepository();

  /**
   * Get current communication settings
   */
  async getSettings() {
    let settings = await this.repository.getCommunicationSettings();

    // Create default settings if they don't exist
    if (!settings) {
      settings = await this.repository.upsertCommunicationSettings({
        emailEnabled: true,
        smsEnabled: true,
        otpEnabled: true,
        pushEnabled: false,
        emailRateLimit: 100,
        smsRateLimit: 50,
        otpRateLimit: 10,
        otpExpiryMinutes: 10,
        otpLength: 6,
      });
      logger.info('Created default communication settings');
    }

    return settings;
  }

  /**
   * Update communication settings (Admin only)
   */
  async updateSettings(data: CommunicationSettingsData, updatedBy: string) {
    // Validate rate limits
    if (data.emailRateLimit !== undefined && data.emailRateLimit < 1) {
      throw new ValidationError('Email rate limit must be at least 1');
    }
    if (data.smsRateLimit !== undefined && data.smsRateLimit < 1) {
      throw new ValidationError('SMS rate limit must be at least 1');
    }
    if (data.otpRateLimit !== undefined && data.otpRateLimit < 1) {
      throw new ValidationError('OTP rate limit must be at least 1');
    }
    if (data.otpExpiryMinutes !== undefined && (data.otpExpiryMinutes < 1 || data.otpExpiryMinutes > 60)) {
      throw new ValidationError('OTP expiry must be between 1 and 60 minutes');
    }
    if (data.otpLength !== undefined && (data.otpLength < 4 || data.otpLength > 8)) {
      throw new ValidationError('OTP length must be between 4 and 8 digits');
    }

    const updated = await this.repository.upsertCommunicationSettings({
      ...data,
      updatedBy,
    });

    logger.info('Communication settings updated', { updatedBy, changes: data });

    return updated;
  }

  /**
   * Check if email is enabled
   */
  async isEmailEnabled(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.emailEnabled;
  }

  /**
   * Check if SMS is enabled
   */
  async isSMSEnabled(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.smsEnabled;
  }

  /**
   * Check if OTP is enabled
   */
  async isOTPEnabled(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.otpEnabled;
  }

  /**
   * Check if push notifications are enabled
   */
  async isPushEnabled(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.pushEnabled;
  }

  /**
   * Get rate limit for a channel
   */
  async getRateLimit(channel: 'email' | 'sms' | 'otp'): Promise<number> {
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

export default new CommunicationSettingsService();
