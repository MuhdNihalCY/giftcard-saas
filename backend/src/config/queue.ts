// Re-export shim — canonical location is infrastructure/queue.ts
export {
  QUEUE_NAMES,
  giftCardExpiryQueue,
  expiryRemindersQueue,
  emailDeliveryQueue,
  smsDeliveryQueue,
  scheduledDeliveryQueue,
  cleanupTokensQueue,
  queueEvents,
  closeQueues,
} from '../infrastructure/queue';
