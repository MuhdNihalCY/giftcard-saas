import cron from 'node-cron';
import prisma from '../config/database';
import { giftCardExpiryQueue, expiryRemindersQueue, cleanupTokensQueue } from '../config/queue';
import logger from '../utils/logger';

export class SchedulerService {
  /**
   * Schedule daily gift card expiry check
   * Runs every day at 2 AM
   */
  scheduleGiftCardExpiryCheck() {
    cron.schedule('0 2 * * *', async () => {
      logger.info('Starting scheduled gift card expiry check');

      try {
        // Find all active gift cards with expiry dates
        const giftCards = await prisma.giftCard.findMany({
          where: {
            status: 'ACTIVE',
            expiryDate: {
              not: null,
              lte: new Date(),
            },
          },
          select: {
            id: true,
          },
        });

        // Queue expiry check jobs
        for (const giftCard of giftCards) {
          await giftCardExpiryQueue.add('check-expiry', {
            giftCardId: giftCard.id,
          });
        }

        logger.info('Gift card expiry check scheduled', { count: giftCards.length });
      } catch (error: any) {
        logger.error('Error scheduling gift card expiry check', { error: error.message });
      }
    });
  }

  /**
   * Schedule expiry reminders
   * Runs every day at 9 AM
   */
  scheduleExpiryReminders() {
    cron.schedule('0 9 * * *', async () => {
      logger.info('Starting scheduled expiry reminders');

      try {
        const reminderDays = [7, 3, 1]; // Remind 7 days, 3 days, and 1 day before expiry

        for (const days of reminderDays) {
          const reminderDate = new Date();
          reminderDate.setDate(reminderDate.getDate() + days);

          // Find gift cards expiring in X days
          const giftCards = await prisma.giftCard.findMany({
            where: {
              status: 'ACTIVE',
              expiryDate: {
                gte: new Date(reminderDate.setHours(0, 0, 0, 0)),
                lt: new Date(reminderDate.setHours(23, 59, 59, 999)),
              },
              recipientEmail: {
                not: null,
              },
            },
            select: {
              id: true,
            },
          });

          // Queue reminder jobs
          for (const giftCard of giftCards) {
            await expiryRemindersQueue.add('send-reminder', {
              giftCardId: giftCard.id,
              daysUntilExpiry: days,
            });
          }

          logger.info('Expiry reminders scheduled', { days, count: giftCards.length });
        }
      } catch (error: any) {
        logger.error('Error scheduling expiry reminders', { error: error.message });
      }
    });
  }

  /**
   * Schedule token cleanup
   * Runs every day at 3 AM
   */
  scheduleTokenCleanup() {
    cron.schedule('0 3 * * *', async () => {
      logger.info('Starting scheduled token cleanup');

      try {
        await cleanupTokensQueue.add('cleanup-tokens', {});
        logger.info('Token cleanup scheduled');
      } catch (error: any) {
        logger.error('Error scheduling token cleanup', { error: error.message });
      }
    });
  }

  /**
   * Schedule IP tracking cleanup
   * Runs every week on Sunday at 4 AM
   */
  scheduleIPTrackingCleanup() {
    cron.schedule('0 4 * * 0', async () => {
      logger.info('Starting scheduled IP tracking cleanup');

      try {
        const ipTrackingService = (await import('../services/ip-tracking.service')).default;
        const deleted = await ipTrackingService.cleanOldRecords(90); // Keep 90 days
        logger.info('IP tracking cleanup completed', { deleted });
      } catch (error: any) {
        logger.error('Error cleaning IP tracking records', { error: error.message });
      }
    });
  }

  /**
   * Start all scheduled jobs
   */
  start() {
    this.scheduleGiftCardExpiryCheck();
    this.scheduleExpiryReminders();
    this.scheduleTokenCleanup();
    this.scheduleIPTrackingCleanup();
    logger.info('All scheduled jobs started');
  }
}

export default new SchedulerService();


