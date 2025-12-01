import { Job } from 'bullmq';
import deliveryService from '../services/delivery/delivery.service';
import logger from '../utils/logger';

export async function processScheduledDelivery(job: Job) {
  const { giftCardId, deliveryMethod, recipientEmail, recipientPhone, recipientName } = job.data;

  logger.info('Processing scheduled delivery', {
    jobId: job.id,
    giftCardId,
    deliveryMethod,
  });

  try {
    await deliveryService.deliverGiftCard({
      giftCardId,
      deliveryMethod,
      recipientEmail,
      recipientPhone,
      recipientName,
    });

    logger.info('Scheduled delivery completed', {
      jobId: job.id,
      giftCardId,
    });
  } catch (error: any) {
    logger.error('Scheduled delivery failed', {
      jobId: job.id,
      giftCardId,
      error: error.message,
    });
    throw error;
  }
}




