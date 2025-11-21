import { Job } from 'bullmq';
import prisma from '../config/database';
import logger from '../utils/logger';
import emailService from '../services/delivery/email.service';
import smsService from '../services/delivery/sms.service';
import { env } from '../config/env';

export interface ExpiryReminderJobData {
  giftCardId: string;
  daysUntilExpiry: number;
}

/**
 * Process expiry reminder
 */
export async function processExpiryReminder(job: Job<ExpiryReminderJobData>) {
  const { giftCardId, daysUntilExpiry } = job.data;

  try {
    const giftCard = await prisma.giftCard.findUnique({
      where: { id: giftCardId },
      include: {
        merchant: {
          select: {
            businessName: true,
          },
        },
      },
    });

    if (!giftCard) {
      logger.warn('Gift card not found for reminder', { giftCardId });
      return;
    }

    // Check if already expired or redeemed
    if (giftCard.status !== 'ACTIVE') {
      return;
    }

    // Check if still expiring soon
    if (!giftCard.expiryDate || giftCard.expiryDate > new Date()) {
      const redemptionUrl = `${env.FRONTEND_URL}/redeem/${giftCard.code}`;

      // Send email reminder if recipient email exists
      if (giftCard.recipientEmail) {
        try {
          await emailService.sendReminderEmail({
            to: giftCard.recipientEmail,
            recipientName: giftCard.recipientName || 'Friend',
            giftCardCode: giftCard.code,
            giftCardValue: Number(giftCard.value),
            currency: giftCard.currency,
            daysUntilExpiry,
            redemptionUrl,
          });
          logger.info('Expiry reminder email sent', { giftCardId, email: giftCard.recipientEmail });
        } catch (error: any) {
          logger.error('Failed to send expiry reminder email', { giftCardId, error: error.message });
        }
      }

      // Note: SMS reminders would require recipient phone number in the schema
      // For now, we'll skip SMS reminders
    }
  } catch (error: any) {
    logger.error('Error processing expiry reminder', { giftCardId, error: error.message });
    throw error;
  }
}

