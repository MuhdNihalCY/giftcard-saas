import twilio from 'twilio';
import { env } from '../../config/env';
import { ValidationError } from '../../utils/errors';

export interface SMSOptions {
  to: string;
  message: string;
}

export class SMSService {
  private client: twilio.Twilio | null = null;

  constructor() {
    if (env.SMS_SERVICE === 'twilio' && env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
      // Only initialize if credentials are valid (start with AC)
      if (env.TWILIO_ACCOUNT_SID.startsWith('AC') && env.TWILIO_AUTH_TOKEN.length > 0) {
        try {
          this.client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
        } catch (error) {
          console.warn('Twilio initialization failed, SMS service disabled:', error);
          this.client = null;
        }
      } else {
        console.warn('Twilio credentials not configured, SMS service disabled');
        this.client = null;
      }
    }
  }

  /**
   * Send SMS
   */
  async sendSMS(options: SMSOptions): Promise<void> {
    if (!this.client) {
      throw new ValidationError('SMS service not configured');
    }

    try {
      await this.client.messages.create({
        body: options.message,
        from: env.TWILIO_PHONE_NUMBER,
        to: options.to,
      });
    } catch (error: any) {
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

