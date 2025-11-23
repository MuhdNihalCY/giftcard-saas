import { Job } from 'bullmq';
import prisma from '../config/database';
import logger from '../utils/logger';
import { GiftCardStatus } from '@prisma/client';

export interface GiftCardExpiryJobData {
  giftCardId: string;
}

/**
 * Process gift card expiry check
 */
export async function processGiftCardExpiry(job: Job<GiftCardExpiryJobData>) {
  const { giftCardId } = job.data;

  try {
    const giftCard = await prisma.giftCard.findUnique({
      where: { id: giftCardId },
    });

    if (!giftCard) {
      logger.warn('Gift card not found for expiry check', { giftCardId });
      return;
    }

    // Check if already expired or redeemed
    if (giftCard.status !== GiftCardStatus.ACTIVE) {
      return;
    }

    // Check if expired
    if (giftCard.expiryDate && giftCard.expiryDate < new Date()) {
      await prisma.giftCard.update({
        where: { id: giftCardId },
        data: { status: GiftCardStatus.EXPIRED },
      });

      logger.info('Gift card expired', { giftCardId, code: giftCard.code });
    }
  } catch (error: any) {
    logger.error('Error processing gift card expiry', { giftCardId, error: error.message });
    throw error;
  }
}


