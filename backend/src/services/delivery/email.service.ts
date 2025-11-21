import nodemailer from 'nodemailer';
import * as brevo from '@getbrevo/brevo';
import { env } from '../../config/env';
import { ValidationError } from '../../utils/errors';
import logger from '../../utils/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  fromName?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private brevoApiInstance: brevo.TransactionalEmailsApi | null = null;

  constructor() {
    // Initialize based on email service
    if (env.EMAIL_SERVICE === 'brevo' && env.BREVO_API_KEY) {
      // Brevo API
      const apiInstance = new brevo.TransactionalEmailsApi();
      apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, env.BREVO_API_KEY);
      this.brevoApiInstance = apiInstance;
      logger.info('Brevo email service initialized');
    } else if (env.EMAIL_SERVICE === 'sendgrid' && env.SENDGRID_API_KEY && env.SENDGRID_API_KEY !== 'your_sendgrid_api_key') {
      // SendGrid SMTP
      this.transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: env.SENDGRID_API_KEY,
        },
      });
      logger.info('SendGrid email service initialized');
    } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      // Default SMTP (can be configured for other services)
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      logger.info('SMTP email service initialized');
    } else {
      // Create a dummy transporter that will fail gracefully
      // This allows the app to start without email configuration
      this.transporter = nodemailer.createTransport({
        host: 'localhost',
        port: 587,
        secure: false,
        auth: {
          user: 'dummy',
          pass: 'dummy',
        },
      });
      logger.warn('Email service not configured, email sending will fail. Please configure Brevo, SendGrid, or SMTP settings.');
    }
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    // Check if email is enabled by admin
    const communicationSettingsService = await import('../communicationSettings.service').then(m => m.default);
    const isEnabled = await communicationSettingsService.isEmailEnabled();
    
    if (!isEnabled) {
      const communicationLogService = await import('../communicationLog.service').then(m => m.default);
      await communicationLogService.log({
        channel: 'EMAIL',
        recipient: options.to,
        subject: options.subject,
        message: options.html,
        status: 'BLOCKED',
        errorMessage: 'Email service disabled by administrator',
      });
      throw new ValidationError('Email service is currently disabled by administrator');
    }

    const communicationLogService = await import('../communicationLog.service').then(m => m.default);
    
    try {
      // Use Brevo API if configured
      if (env.EMAIL_SERVICE === 'brevo' && this.brevoApiInstance && env.BREVO_API_KEY) {
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.subject = options.subject;
        sendSmtpEmail.htmlContent = options.html;
        sendSmtpEmail.textContent = options.text || this.htmlToText(options.html);
        sendSmtpEmail.sender = {
          name: env.EMAIL_FROM_NAME,
          email: options.from || env.EMAIL_FROM,
        };
        sendSmtpEmail.to = [{ email: options.to }];

        await this.brevoApiInstance.sendTransacEmail(sendSmtpEmail);
        
        // Log successful email
        await communicationLogService.log({
          channel: 'EMAIL',
          recipient: options.to,
          subject: options.subject,
          message: options.html,
          status: 'SENT',
        });
        return;
      }

      // Use SMTP transporter (SendGrid or custom SMTP)
      if (!this.transporter) {
        throw new ValidationError('Email service not configured. Please set up Brevo, SendGrid, or SMTP settings.');
      }

      const mailOptions = {
        from: options.from || `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
      };

      await this.transporter.sendMail(mailOptions);
      
      // Log successful email
      await communicationLogService.log({
        channel: 'EMAIL',
        recipient: options.to,
        subject: options.subject,
        message: options.html,
        status: 'SENT',
      });
    } catch (error: any) {
      // Log failed email
      await communicationLogService.log({
        channel: 'EMAIL',
        recipient: options.to,
        subject: options.subject,
        message: options.html,
        status: 'FAILED',
        errorMessage: error.message,
      });
      throw new ValidationError(`Email sending failed: ${error.message}`);
    }
  }

  /**
   * Send gift card email
   */
  async sendGiftCardEmail(data: {
    to: string;
    recipientName?: string;
    giftCardCode: string;
    giftCardValue: number;
    currency: string;
    qrCodeUrl?: string;
    customMessage?: string;
    merchantName?: string;
    expiryDate?: Date;
    redemptionUrl: string;
  }): Promise<void> {
    const {
      to,
      recipientName,
      giftCardCode,
      giftCardValue,
      currency,
      qrCodeUrl,
      customMessage,
      merchantName,
      expiryDate,
      redemptionUrl,
    } = data;

    const subject = `🎁 You've received a gift card!`;
    const html = this.generateGiftCardEmailTemplate({
      recipientName: recipientName || 'Friend',
      giftCardCode,
      giftCardValue,
      currency,
      qrCodeUrl,
      customMessage,
      merchantName,
      expiryDate,
      redemptionUrl,
    });

    await this.sendEmail({
      to,
      subject,
      html,
    });
  }

  /**
   * Generate gift card email template
   */
  private generateGiftCardEmailTemplate(data: {
    recipientName: string;
    giftCardCode: string;
    giftCardValue: number;
    currency: string;
    qrCodeUrl?: string;
    customMessage?: string;
    merchantName?: string;
    expiryDate?: Date;
    redemptionUrl: string;
  }): string {
    const {
      recipientName,
      giftCardCode,
      giftCardValue,
      currency,
      qrCodeUrl,
      customMessage,
      merchantName,
      expiryDate,
      redemptionUrl,
    } = data;

    const formattedValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(giftCardValue);

    const expiryText = expiryDate
      ? `<p style="color: #666; font-size: 14px;">Expires: ${new Date(expiryDate).toLocaleDateString()}</p>`
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gift Card</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🎁 You've Received a Gift Card!</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px;">Hi ${recipientName},</p>
          
          ${customMessage ? `<p style="font-size: 16px; font-style: italic; color: #555;">"${customMessage}"</p>` : ''}
          
          <div style="background: white; border: 2px dashed #667eea; border-radius: 10px; padding: 30px; margin: 20px 0; text-align: center;">
            <h2 style="color: #667eea; margin: 0 0 10px 0;">${formattedValue}</h2>
            <p style="color: #666; margin: 5px 0;">Gift Card Code:</p>
            <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #333; margin: 10px 0;">${giftCardCode}</p>
            
            ${qrCodeUrl ? `<img src="${qrCodeUrl}" alt="QR Code" style="max-width: 200px; margin: 20px 0;" />` : ''}
            
            ${expiryText}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${redemptionUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Redeem Gift Card</a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            ${merchantName ? `This gift card is from ${merchantName}. ` : ''}
            You can use this gift card code at checkout or show the QR code at the store.
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Convert HTML to plain text
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }

  /**
   * Send reminder email
   */
  async sendReminderEmail(data: {
    to: string;
    recipientName?: string;
    giftCardCode: string;
    giftCardValue: number;
    currency: string;
    daysUntilExpiry: number;
    redemptionUrl: string;
  }): Promise<void> {
    const { to, recipientName, giftCardCode, giftCardValue, currency, daysUntilExpiry, redemptionUrl } = data;

    const subject = `⏰ Reminder: Your gift card expires in ${daysUntilExpiry} day(s)`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Gift Card Reminder</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 20px; border-radius: 5px;">
          <h2 style="color: #856404; margin-top: 0;">⏰ Don't Forget Your Gift Card!</h2>
          <p>Hi ${recipientName || 'there'},</p>
          <p>Your gift card (${giftCardCode}) worth ${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(giftCardValue)} expires in <strong>${daysUntilExpiry} day(s)</strong>.</p>
          <p>Don't miss out! Use it now:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${redemptionUrl}" style="background: #ffc107; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Redeem Now</a>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject,
      html,
    });
  }
}

export default new EmailService();

