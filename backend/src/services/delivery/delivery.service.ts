import prisma from '../../config/database';
import emailService from './email.service';
import smsService from './sms.service';
import giftCardService from '../giftcard.service';
import { env } from '../../config/env';
import { ValidationError } from '../../utils/errors';

export interface DeliveryOptions {
  giftCardId: string;
  deliveryMethod: 'email' | 'sms' | 'both';
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName?: string;
  scheduleFor?: Date;
}

export class DeliveryService {
  /**
   * Deliver gift card
   */
  async deliverGiftCard(options: DeliveryOptions) {
    const {
      giftCardId,
      deliveryMethod,
      recipientEmail,
      recipientPhone,
      recipientName,
      scheduleFor,
    } = options;

    // Get gift card
    const giftCard = await giftCardService.getById(giftCardId);

    if (giftCard.status !== 'ACTIVE') {
      throw new ValidationError('Gift card is not active');
    }

    const redemptionUrl = `${env.FRONTEND_URL}/redeem/${giftCard.code}`;

    // If scheduled for future, queue it
    if (scheduleFor && new Date(scheduleFor) > new Date()) {
      const { scheduledDeliveryQueue } = await import('../../config/queue');
      
      // Calculate delay in milliseconds
      const delay = scheduleFor.getTime() - Date.now();
      
      // Queue the delivery job
      await scheduledDeliveryQueue.add(
        'scheduled-delivery',
        {
          giftCardId,
          deliveryMethod,
          recipientEmail,
          recipientPhone,
          recipientName,
        },
        {
          delay, // Delay in milliseconds
          jobId: `scheduled-delivery-${giftCardId}-${scheduleFor.getTime()}`,
        }
      );

      logger.info('Gift card delivery scheduled', {
        giftCardId,
        scheduledFor: scheduleFor.toISOString(),
        delayMs: delay,
      });

      return {
        scheduled: true,
        scheduledFor: scheduleFor,
        message: 'Gift card delivery scheduled',
      };
    }

    // Deliver immediately
    const deliveryResults = [];

    if (deliveryMethod === 'email' || deliveryMethod === 'both') {
      if (!recipientEmail) {
        throw new ValidationError('Recipient email is required for email delivery');
      }

      try {
        await emailService.sendGiftCardEmail({
          to: recipientEmail,
          recipientName,
          giftCardCode: giftCard.code,
          giftCardValue: Number(giftCard.value),
          currency: giftCard.currency,
          qrCodeUrl: giftCard.qrCodeUrl || undefined,
          customMessage: giftCard.customMessage || undefined,
          merchantName: giftCard.merchant.businessName || undefined,
          expiryDate: giftCard.expiryDate || undefined,
          redemptionUrl,
        });

        deliveryResults.push({
          method: 'email',
          status: 'success',
          recipient: recipientEmail,
        });
      } catch (error: any) {
        deliveryResults.push({
          method: 'email',
          status: 'failed',
          recipient: recipientEmail,
          error: error.message,
        });
      }
    }

    if (deliveryMethod === 'sms' || deliveryMethod === 'both') {
      if (!recipientPhone) {
        throw new ValidationError('Recipient phone is required for SMS delivery');
      }

      try {
        await smsService.sendGiftCardSMS({
          to: recipientPhone,
          giftCardCode: giftCard.code,
          giftCardValue: Number(giftCard.value),
          currency: giftCard.currency,
          redemptionUrl,
          merchantName: giftCard.merchant.businessName || undefined,
          expiryDate: giftCard.expiryDate || undefined,
        });

        deliveryResults.push({
          method: 'sms',
          status: 'success',
          recipient: recipientPhone,
        });
      } catch (error: any) {
        deliveryResults.push({
          method: 'sms',
          status: 'failed',
          recipient: recipientPhone,
          error: error.message,
        });
      }
    }

    // Update gift card with recipient info if provided
    if (recipientEmail || recipientName) {
      await prisma.giftCard.update({
        where: { id: giftCardId },
        data: {
          recipientEmail: recipientEmail || giftCard.recipientEmail,
          recipientName: recipientName || giftCard.recipientName,
        },
      });
    }

    return {
      delivered: true,
      results: deliveryResults,
      message: 'Gift card delivered successfully',
    };
  }

  /**
   * Send expiry reminder
   */
  async sendExpiryReminder(giftCardId: string, daysBeforeExpiry: number = 7) {
    const giftCard = await giftCardService.getById(giftCardId);

    if (giftCard.status !== 'ACTIVE' || !giftCard.expiryDate) {
      return { message: 'Gift card does not need reminder' };
    }

    const expiryDate = new Date(giftCard.expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry > daysBeforeExpiry || daysUntilExpiry <= 0) {
      return { message: 'Not time for reminder yet' };
    }

    const redemptionUrl = `${env.FRONTEND_URL}/redeem/${giftCard.code}`;
    const results = [];

    // Send email reminder if email exists
    if (giftCard.recipientEmail) {
      try {
        await emailService.sendReminderEmail({
          to: giftCard.recipientEmail,
          recipientName: giftCard.recipientName || undefined,
          giftCardCode: giftCard.code,
          giftCardValue: Number(giftCard.value),
          currency: giftCard.currency,
          daysUntilExpiry,
          redemptionUrl,
        });
        results.push({ method: 'email', status: 'success' });
      } catch (error: any) {
        results.push({ method: 'email', status: 'failed', error: error.message });
      }
    }

    // Note: SMS reminders would require recipientPhone field in GiftCard schema
    // Currently, only recipientEmail is stored. To enable SMS reminders:
    // 1. Add recipientPhone field to GiftCard model
    // 2. Update gift card creation/update services to accept phone
    // 3. Uncomment the SMS reminder code below
    // if (giftCard.recipientPhone) {
    //   try {
    //     const smsService = (await import('./sms.service')).default;
    //     await smsService.sendReminderSMS({
    //       to: giftCard.recipientPhone,
    //       giftCardCode: giftCard.code,
    //       giftCardValue: Number(giftCard.value),
    //       currency: giftCard.currency,
    //       daysUntilExpiry,
    //       redemptionUrl,
    //     });
    //     results.push({ method: 'sms', status: 'success' });
    //   } catch (error: any) {
    //     results.push({ method: 'sms', status: 'failed', error: error.message });
    //   }
    // }

    return {
      sent: true,
      results,
      daysUntilExpiry,
    };
  }
}

export default new DeliveryService();

