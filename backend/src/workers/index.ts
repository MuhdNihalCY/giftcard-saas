import Redis from 'ioredis';
import { Worker } from 'bullmq';
import { getRedisClient } from '../config/redis';
import { QUEUE_NAMES } from '../config/queue';
import { processGiftCardExpiry } from '../jobs/giftCardExpiry.job';
import { processExpiryReminder } from '../jobs/expiryReminders.job';
import { processCleanupTokens } from '../jobs/cleanupTokens.job';
import logger from '../utils/logger';

const workerOptions = {
  connection: new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
  }),
  concurrency: 5,
  limiter: {
    max: 10,
    duration: 1000,
  },
};

// Create workers
export const giftCardExpiryWorker = new Worker(
  QUEUE_NAMES.GIFT_CARD_EXPIRY,
  processGiftCardExpiry,
  workerOptions
);

export const expiryRemindersWorker = new Worker(
  QUEUE_NAMES.EXPIRY_REMINDERS,
  processExpiryReminder,
  workerOptions
);

export const cleanupTokensWorker = new Worker(
  QUEUE_NAMES.CLEANUP_TOKENS,
  processCleanupTokens,
  workerOptions
);

// Worker event handlers
const setupWorkerEvents = (worker: Worker, name: string) => {
  worker.on('completed', (job) => {
    logger.info('Worker job completed', { worker: name, jobId: job.id });
  });

  worker.on('failed', (job, err) => {
    logger.error('Worker job failed', { worker: name, jobId: job?.id, error: err.message });
  });

  worker.on('error', (err) => {
    logger.error('Worker error', { worker: name, error: err.message });
  });
};

setupWorkerEvents(giftCardExpiryWorker, 'giftCardExpiry');
setupWorkerEvents(expiryRemindersWorker, 'expiryReminders');
setupWorkerEvents(cleanupTokensWorker, 'cleanupTokens');

// Graceful shutdown
export const closeWorkers = async () => {
  await Promise.all([
    giftCardExpiryWorker.close(),
    expiryRemindersWorker.close(),
    cleanupTokensWorker.close(),
  ]);
  logger.info('All workers closed');
};


