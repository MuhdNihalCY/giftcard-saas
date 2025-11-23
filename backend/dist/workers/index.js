"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeWorkers = exports.cleanupTokensWorker = exports.expiryRemindersWorker = exports.giftCardExpiryWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const queue_1 = require("../config/queue");
const giftCardExpiry_job_1 = require("../jobs/giftCardExpiry.job");
const expiryReminders_job_1 = require("../jobs/expiryReminders.job");
const cleanupTokens_job_1 = require("../jobs/cleanupTokens.job");
const logger_1 = __importDefault(require("../utils/logger"));
const workerOptions = {
    connection: {
        get client() {
            return (0, redis_1.getRedisClient)();
        },
    },
    concurrency: 5,
    limiter: {
        max: 10,
        duration: 1000,
    },
};
// Create workers
exports.giftCardExpiryWorker = new bullmq_1.Worker(queue_1.QUEUE_NAMES.GIFT_CARD_EXPIRY, giftCardExpiry_job_1.processGiftCardExpiry, workerOptions);
exports.expiryRemindersWorker = new bullmq_1.Worker(queue_1.QUEUE_NAMES.EXPIRY_REMINDERS, expiryReminders_job_1.processExpiryReminder, workerOptions);
exports.cleanupTokensWorker = new bullmq_1.Worker(queue_1.QUEUE_NAMES.CLEANUP_TOKENS, cleanupTokens_job_1.processCleanupTokens, workerOptions);
// Worker event handlers
const setupWorkerEvents = (worker, name) => {
    worker.on('completed', (job) => {
        logger_1.default.info('Worker job completed', { worker: name, jobId: job.id });
    });
    worker.on('failed', (job, err) => {
        logger_1.default.error('Worker job failed', { worker: name, jobId: job?.id, error: err.message });
    });
    worker.on('error', (err) => {
        logger_1.default.error('Worker error', { worker: name, error: err.message });
    });
};
setupWorkerEvents(exports.giftCardExpiryWorker, 'giftCardExpiry');
setupWorkerEvents(exports.expiryRemindersWorker, 'expiryReminders');
setupWorkerEvents(exports.cleanupTokensWorker, 'cleanupTokens');
// Graceful shutdown
const closeWorkers = async () => {
    await Promise.all([
        exports.giftCardExpiryWorker.close(),
        exports.expiryRemindersWorker.close(),
        exports.cleanupTokensWorker.close(),
    ]);
    logger_1.default.info('All workers closed');
};
exports.closeWorkers = closeWorkers;
//# sourceMappingURL=index.js.map