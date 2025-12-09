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
   * Schedule payout processing
   * Runs every hour to process scheduled payouts
   */
  schedulePayoutProcessing() {
    cron.schedule('0 * * * *', async () => {
      logger.info('Starting scheduled payout processing');

      try {
        const payoutService = (await import('./payout.service')).default;
        const result = await payoutService.processScheduledPayouts();

        logger.info('Scheduled payout processing completed', {
          processed: result.processed,
          failed: result.failed,
        });

        if (result.errors.length > 0) {
          logger.warn('Payout processing errors', { errors: result.errors });
        }
      } catch (error: any) {
        logger.error('Error processing scheduled payouts', { error: error.message });
      }
    });
  }

  /**
   * Schedule daily payouts (for merchants with DAILY schedule)
   * Runs every day at 8 AM
   */
  scheduleDailyPayouts() {
    cron.schedule('0 8 * * *', async () => {
      logger.info('Starting daily payout processing');

      try {
        const payoutService = (await import('./payout.service')).default;
        const payoutSettingsService = (await import('./payout-settings.service')).default;
        const prisma = (await import('../config/database')).default;

        // Find merchants with DAILY payout schedule
        const settings = await prisma.payoutSettings.findMany({
          where: {
            payoutSchedule: 'DAILY',
            isActive: true,
          },
          include: {
            merchant: {
              select: {
                id: true,
                merchantBalance: true,
              },
            },
          },
        });

        for (const setting of settings) {
          try {
            const availableBalance = await payoutService.calculateAvailableBalance(
              setting.merchantId
            );
            const minimumAmount = Number(setting.minimumPayoutAmount);

            if (availableBalance >= minimumAmount) {
              await payoutService.requestPayout({
                merchantId: setting.merchantId,
                amount: availableBalance,
                method: setting.payoutMethod,
              });
              logger.info('Daily payout requested', {
                merchantId: setting.merchantId,
                amount: availableBalance,
              });
            }
          } catch (error: any) {
            logger.error('Failed to process daily payout', {
              merchantId: setting.merchantId,
              error: error.message,
            });
          }
        }

        logger.info('Daily payout processing completed', { count: settings.length });
      } catch (error: any) {
        logger.error('Error processing daily payouts', { error: error.message });
      }
    });
  }

  /**
   * Schedule weekly payouts (for merchants with WEEKLY schedule)
   * Runs every Monday at 8 AM
   */
  scheduleWeeklyPayouts() {
    cron.schedule('0 8 * * 1', async () => {
      logger.info('Starting weekly payout processing');

      try {
        const payoutService = (await import('./payout.service')).default;
        const prisma = (await import('../config/database')).default;

        // Find merchants with WEEKLY payout schedule
        const settings = await prisma.payoutSettings.findMany({
          where: {
            payoutSchedule: 'WEEKLY',
            isActive: true,
          },
          include: {
            merchant: {
              select: {
                id: true,
                merchantBalance: true,
              },
            },
          },
        });

        for (const setting of settings) {
          try {
            const availableBalance = await payoutService.calculateAvailableBalance(
              setting.merchantId
            );
            const minimumAmount = Number(setting.minimumPayoutAmount);

            if (availableBalance >= minimumAmount) {
              await payoutService.requestPayout({
                merchantId: setting.merchantId,
                amount: availableBalance,
                method: setting.payoutMethod,
              });
              logger.info('Weekly payout requested', {
                merchantId: setting.merchantId,
                amount: availableBalance,
              });
            }
          } catch (error: any) {
            logger.error('Failed to process weekly payout', {
              merchantId: setting.merchantId,
              error: error.message,
            });
          }
        }

        logger.info('Weekly payout processing completed', { count: settings.length });
      } catch (error: any) {
        logger.error('Error processing weekly payouts', { error: error.message });
      }
    });
  }

  /**
   * Schedule monthly payouts (for merchants with MONTHLY schedule)
   * Runs on the 1st of every month at 8 AM
   */
  scheduleMonthlyPayouts() {
    cron.schedule('0 8 1 * *', async () => {
      logger.info('Starting monthly payout processing');

      try {
        const payoutService = (await import('./payout.service')).default;
        const prisma = (await import('../config/database')).default;

        // Find merchants with MONTHLY payout schedule
        const settings = await prisma.payoutSettings.findMany({
          where: {
            payoutSchedule: 'MONTHLY',
            isActive: true,
          },
          include: {
            merchant: {
              select: {
                id: true,
                merchantBalance: true,
              },
            },
          },
        });

        for (const setting of settings) {
          try {
            const availableBalance = await payoutService.calculateAvailableBalance(
              setting.merchantId
            );
            const minimumAmount = Number(setting.minimumPayoutAmount);

            if (availableBalance >= minimumAmount) {
              await payoutService.requestPayout({
                merchantId: setting.merchantId,
                amount: availableBalance,
                method: setting.payoutMethod,
              });
              logger.info('Monthly payout requested', {
                merchantId: setting.merchantId,
                amount: availableBalance,
              });
            }
          } catch (error: any) {
            logger.error('Failed to process monthly payout', {
              merchantId: setting.merchantId,
              error: error.message,
            });
          }
        }

        logger.info('Monthly payout processing completed', { count: settings.length });
      } catch (error: any) {
        logger.error('Error processing monthly payouts', { error: error.message });
      }
    });
  }

  /**
   * Schedule retry of failed payouts
   * Runs every 6 hours
   */
  scheduleRetryFailedPayouts() {
    cron.schedule('0 */6 * * *', async () => {
      logger.info('Starting retry of failed payouts');

      try {
        const payoutService = (await import('./payout.service')).default;
        const prisma = (await import('../config/database')).default;

        // Find failed payouts with retry count < 3
        const failedPayouts = await prisma.payout.findMany({
          where: {
            status: 'FAILED',
            retryCount: {
              lt: 3,
            },
          },
          select: {
            id: true,
            merchantId: true,
            retryCount: true,
          },
        });

        for (const payout of failedPayouts) {
          try {
            await payoutService.retryFailedPayout(payout.id);
            logger.info('Failed payout retried', {
              payoutId: payout.id,
              retryCount: payout.retryCount + 1,
            });
          } catch (error: any) {
            logger.error('Failed to retry payout', {
              payoutId: payout.id,
              error: error.message,
            });
          }
        }

        logger.info('Failed payout retry completed', { count: failedPayouts.length });
      } catch (error: any) {
        logger.error('Error retrying failed payouts', { error: error.message });
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
    this.schedulePayoutProcessing();
    this.scheduleDailyPayouts();
    this.scheduleWeeklyPayouts();
    this.scheduleMonthlyPayouts();
    this.scheduleRetryFailedPayouts();
    logger.info('All scheduled jobs started');
  }
}

export default new SchedulerService();


