import { Queue, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import logger from '../utils/logger';

// Queue names
export const QUEUE_NAMES = {
  GIFT_CARD_EXPIRY: 'gift-card-expiry',
  EXPIRY_REMINDERS: 'expiry-reminders',
  EMAIL_DELIVERY: 'email-delivery',
  SMS_DELIVERY: 'sms-delivery',
  CLEANUP_TOKENS: 'cleanup-tokens',
} as const;

// Queue options
const queueOptions = {
  connection: new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
  }),
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
export const giftCardExpiryQueue = new Queue(QUEUE_NAMES.GIFT_CARD_EXPIRY, queueOptions);
export const expiryRemindersQueue = new Queue(QUEUE_NAMES.EXPIRY_REMINDERS, queueOptions);
export const emailDeliveryQueue = new Queue(QUEUE_NAMES.EMAIL_DELIVERY, queueOptions);
export const smsDeliveryQueue = new Queue(QUEUE_NAMES.SMS_DELIVERY, queueOptions);
export const cleanupTokensQueue = new Queue(QUEUE_NAMES.CLEANUP_TOKENS, queueOptions);

// Queue events for monitoring
export const queueEvents = {
  giftCardExpiry: new QueueEvents(QUEUE_NAMES.GIFT_CARD_EXPIRY, queueOptions),
  expiryReminders: new QueueEvents(QUEUE_NAMES.EXPIRY_REMINDERS, queueOptions),
  emailDelivery: new QueueEvents(QUEUE_NAMES.EMAIL_DELIVERY, queueOptions),
  smsDelivery: new QueueEvents(QUEUE_NAMES.SMS_DELIVERY, queueOptions),
  cleanupTokens: new QueueEvents(QUEUE_NAMES.CLEANUP_TOKENS, queueOptions),
};

// Log queue events
Object.values(queueEvents).forEach((events) => {
  events.on('completed', ({ jobId }) => {
    logger.info('Job completed', { jobId });
  });

  events.on('failed', ({ jobId, failedReason }) => {
    logger.error('Job failed', { jobId, failedReason });
  });

  events.on('stalled', ({ jobId }) => {
    logger.warn('Job stalled', { jobId });
  });
});

// Graceful shutdown
export const closeQueues = async () => {
  await Promise.all([
    giftCardExpiryQueue.close(),
    expiryRemindersQueue.close(),
    emailDeliveryQueue.close(),
    smsDeliveryQueue.close(),
    cleanupTokensQueue.close(),
  ]);
  
  await Promise.all([
    queueEvents.giftCardExpiry.close(),
    queueEvents.expiryReminders.close(),
    queueEvents.emailDelivery.close(),
    queueEvents.smsDelivery.close(),
    queueEvents.cleanupTokens.close(),
  ]);
  
  logger.info('All queues closed');
};


