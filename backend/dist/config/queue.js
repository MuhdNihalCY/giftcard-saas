"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeQueues = exports.queueEvents = exports.cleanupTokensQueue = exports.smsDeliveryQueue = exports.emailDeliveryQueue = exports.expiryRemindersQueue = exports.giftCardExpiryQueue = exports.QUEUE_NAMES = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("./redis");
const logger_1 = __importDefault(require("../utils/logger"));
// Queue names
exports.QUEUE_NAMES = {
    GIFT_CARD_EXPIRY: 'gift-card-expiry',
    EXPIRY_REMINDERS: 'expiry-reminders',
    EMAIL_DELIVERY: 'email-delivery',
    SMS_DELIVERY: 'sms-delivery',
    CLEANUP_TOKENS: 'cleanup-tokens',
};
// Queue options
const queueOptions = {
    connection: {
        get client() {
            return (0, redis_1.getRedisClient)();
        },
    },
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: {
            age: 3600, // Keep completed jobs for 1 hour
            count: 1000, // Keep max 1000 completed jobs
        },
        removeOnFail: {
            age: 86400, // Keep failed jobs for 24 hours
        },
    },
};
// Create queues
exports.giftCardExpiryQueue = new bullmq_1.Queue(exports.QUEUE_NAMES.GIFT_CARD_EXPIRY, queueOptions);
exports.expiryRemindersQueue = new bullmq_1.Queue(exports.QUEUE_NAMES.EXPIRY_REMINDERS, queueOptions);
exports.emailDeliveryQueue = new bullmq_1.Queue(exports.QUEUE_NAMES.EMAIL_DELIVERY, queueOptions);
exports.smsDeliveryQueue = new bullmq_1.Queue(exports.QUEUE_NAMES.SMS_DELIVERY, queueOptions);
exports.cleanupTokensQueue = new bullmq_1.Queue(exports.QUEUE_NAMES.CLEANUP_TOKENS, queueOptions);
// Queue events for monitoring
exports.queueEvents = {
    giftCardExpiry: new bullmq_1.QueueEvents(exports.QUEUE_NAMES.GIFT_CARD_EXPIRY, queueOptions),
    expiryReminders: new bullmq_1.QueueEvents(exports.QUEUE_NAMES.EXPIRY_REMINDERS, queueOptions),
    emailDelivery: new bullmq_1.QueueEvents(exports.QUEUE_NAMES.EMAIL_DELIVERY, queueOptions),
    smsDelivery: new bullmq_1.QueueEvents(exports.QUEUE_NAMES.SMS_DELIVERY, queueOptions),
    cleanupTokens: new bullmq_1.QueueEvents(exports.QUEUE_NAMES.CLEANUP_TOKENS, queueOptions),
};
// Log queue events
Object.values(exports.queueEvents).forEach((events) => {
    events.on('completed', ({ jobId }) => {
        logger_1.default.info('Job completed', { jobId });
    });
    events.on('failed', ({ jobId, failedReason }) => {
        logger_1.default.error('Job failed', { jobId, failedReason });
    });
    events.on('stalled', ({ jobId }) => {
        logger_1.default.warn('Job stalled', { jobId });
    });
});
// Graceful shutdown
const closeQueues = async () => {
    await Promise.all([
        exports.giftCardExpiryQueue.close(),
        exports.expiryRemindersQueue.close(),
        exports.emailDeliveryQueue.close(),
        exports.smsDeliveryQueue.close(),
        exports.cleanupTokensQueue.close(),
    ]);
    await Promise.all([
        exports.queueEvents.giftCardExpiry.close(),
        exports.queueEvents.expiryReminders.close(),
        exports.queueEvents.emailDelivery.close(),
        exports.queueEvents.smsDelivery.close(),
        exports.queueEvents.cleanupTokens.close(),
    ]);
    logger_1.default.info('All queues closed');
};
exports.closeQueues = closeQueues;
//# sourceMappingURL=queue.js.map