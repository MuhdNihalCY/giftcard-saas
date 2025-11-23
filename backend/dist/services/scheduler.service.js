"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const database_1 = __importDefault(require("../config/database"));
const queue_1 = require("../config/queue");
const logger_1 = __importDefault(require("../utils/logger"));
class SchedulerService {
    /**
     * Schedule daily gift card expiry check
     * Runs every day at 2 AM
     */
    scheduleGiftCardExpiryCheck() {
        node_cron_1.default.schedule('0 2 * * *', async () => {
            logger_1.default.info('Starting scheduled gift card expiry check');
            try {
                // Find all active gift cards with expiry dates
                const giftCards = await database_1.default.giftCard.findMany({
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
                    await queue_1.giftCardExpiryQueue.add('check-expiry', {
                        giftCardId: giftCard.id,
                    });
                }
                logger_1.default.info('Gift card expiry check scheduled', { count: giftCards.length });
            }
            catch (error) {
                logger_1.default.error('Error scheduling gift card expiry check', { error: error.message });
            }
        });
    }
    /**
     * Schedule expiry reminders
     * Runs every day at 9 AM
     */
    scheduleExpiryReminders() {
        node_cron_1.default.schedule('0 9 * * *', async () => {
            logger_1.default.info('Starting scheduled expiry reminders');
            try {
                const reminderDays = [7, 3, 1]; // Remind 7 days, 3 days, and 1 day before expiry
                for (const days of reminderDays) {
                    const reminderDate = new Date();
                    reminderDate.setDate(reminderDate.getDate() + days);
                    // Find gift cards expiring in X days
                    const giftCards = await database_1.default.giftCard.findMany({
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
                        await queue_1.expiryRemindersQueue.add('send-reminder', {
                            giftCardId: giftCard.id,
                            daysUntilExpiry: days,
                        });
                    }
                    logger_1.default.info('Expiry reminders scheduled', { days, count: giftCards.length });
                }
            }
            catch (error) {
                logger_1.default.error('Error scheduling expiry reminders', { error: error.message });
            }
        });
    }
    /**
     * Schedule token cleanup
     * Runs every day at 3 AM
     */
    scheduleTokenCleanup() {
        node_cron_1.default.schedule('0 3 * * *', async () => {
            logger_1.default.info('Starting scheduled token cleanup');
            try {
                await queue_1.cleanupTokensQueue.add('cleanup-tokens', {});
                logger_1.default.info('Token cleanup scheduled');
            }
            catch (error) {
                logger_1.default.error('Error scheduling token cleanup', { error: error.message });
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
        logger_1.default.info('All scheduled jobs started');
    }
}
exports.SchedulerService = SchedulerService;
exports.default = new SchedulerService();
//# sourceMappingURL=scheduler.service.js.map