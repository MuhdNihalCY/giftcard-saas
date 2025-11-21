import twilio from 'twilio';
import * as brevo from '@getbrevo/brevo';
import { env } from '../../config/env';
import { ValidationError } from '../../utils/errors';
import logger from '../../utils/logger';

export interface SMSOptions {
  to: string;
  message: string;
}

export class SMSService {
  private twilioClient: twilio.Twilio | null = null;
  private brevoApiInstance: brevo.TransactionalSMSApi | null = null;

  constructor() {
    if (env.SMS_SERVICE === 'brevo' && env.BREVO_API_KEY) {
      // Brevo SMS API
      const apiInstance = new brevo.TransactionalSMSApi();
      apiInstance.setApiKey(brevo.TransactionalSMSApiApiKeys.apiKey, env.BREVO_API_KEY);
      this.brevoApiInstance = apiInstance;
      logger.info('Brevo SMS service initialized');
    } else if (env.SMS_SERVICE === 'twilio' && env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
      // Only initialize if credentials are valid (start with AC)
      if (env.TWILIO_ACCOUNT_SID.startsWith('AC') && env.TWILIO_AUTH_TOKEN.length > 0) {
        try {
          this.twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
          logger.info('Twilio SMS service initialized');
        } catch (error) {
          logger.warn('Twilio initialization failed, SMS service disabled', { error });
          this.twilioClient = null;
        }
      } else {
        logger.warn('Twilio credentials not configured, SMS service disabled');
        this.twilioClient = null;
      }
    }
  }

  /**
   * Send SMS
   */
  async sendSMS(options: SMSOptions): Promise<void> {
    // Check if SMS is enabled by admin
    const communicationSettingsService = await import('../communicationSettings.service').then(m => m.default);
    const isEnabled = await communicationSettingsService.isSMSEnabled();
    
    if (!isEnabled) {
      const communicationLogService = await import('../communicationLog.service').then(m => m.default);
      await communicationLogService.log({
        channel: 'SMS',
        recipient: options.to,
        message: options.message,
        status: 'BLOCKED',
        errorMessage: 'SMS service disabled by administrator',
      });
      throw new ValidationError('SMS service is currently disabled by administrator');
    }

    const communicationLogService = await import('../communicationLog.service').then(m => m.default);

    try {
      // Use Brevo SMS API if configured
      if (env.SMS_SERVICE === 'brevo' && this.brevoApiInstance && env.BREVO_API_KEY && env.BREVO_SMS_SENDER) {
        const sendTransacSms = new brevo.SendTransacSms();
        sendTransacSms.sender = env.BREVO_SMS_SENDER;
        sendTransacSms.recipient = options.to;
        sendTransacSms.content = options.message;

        await this.brevoApiInstance.sendTransacSms(sendTransacSms);
        
        // Log successful SMS
        await communicationLogService.log({
          channel: 'SMS',
          recipient: options.to,
          message: options.message,
          status: 'SENT',
        });
        return;
      }

      // Use Twilio if configured
      if (env.SMS_SERVICE === 'twilio' && this.twilioClient) {
        await this.twilioClient.messages.create({
          body: options.message,
          from: env.TWILIO_PHONE_NUMBER,
          to: options.to,
        });
        
        // Log successful SMS
        await communicationLogService.log({
          channel: 'SMS',
          recipient: options.to,
          message: options.message,
          status: 'SENT',
        });
        return;
      }

      throw new ValidationError('SMS service not configured. Please set up Brevo or Twilio settings.');
    } catch (error: any) {
      // Log failed SMS
      await communicationLogService.log({
        channel: 'SMS',
        recipient: options.to,
        message: options.message,
        status: 'FAILED',
        errorMessage: error.message,
      });
      throw new ValidationError(`SMS sending failed: ${error.message}`);
    }
  }

  /**
   * Send gift card SMS
   */
  async sendGiftCardSMS(data: {
    to: string;
    giftCardCode: string;
    giftCardValue: number;
    currency: string;
    redemptionUrl: string;
    merchantName?: string;
    expiryDate?: Date;
  }): Promise<void> {
    const { to, giftCardCode, giftCardValue, currency, redemptionUrl, merchantName, expiryDate } = data;

    const formattedValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(giftCardValue);

    const expiryText = expiryDate
      ? ` Expires: ${new Date(expiryDate).toLocaleDateString()}.`
      : '';

    const merchantText = merchantName ? ` from ${merchantName}` : '';

    const message = `🎁 You've received a gift card${merchantText} worth ${formattedValue}! Code: ${giftCardCode}.${expiryText} Redeem: ${redemptionUrl}`;

    await this.sendSMS({
      to,
      message,
    });
  }

  /**
   * Send reminder SMS
   */
  async sendReminderSMS(data: {
    to: string;
    giftCardCode: string;
    giftCardValue: number;
    currency: string;
    daysUntilExpiry: number;
    redemptionUrl: string;
  }): Promise<void> {
    const { to, giftCardCode, giftCardValue, currency, daysUntilExpiry, redemptionUrl } = data;

    const formattedValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(giftCardValue);

    const message = `⏰ Reminder: Your gift card (${giftCardCode}) worth ${formattedValue} expires in ${daysUntilExpiry} day(s). Redeem now: ${redemptionUrl}`;

    await this.sendSMS({
      to,
      message,
    });
  }
}

export default new SMSService();

