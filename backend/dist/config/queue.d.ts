import { Queue, QueueEvents } from 'bullmq';
export declare const QUEUE_NAMES: {
    readonly GIFT_CARD_EXPIRY: "gift-card-expiry";
    readonly EXPIRY_REMINDERS: "expiry-reminders";
    readonly EMAIL_DELIVERY: "email-delivery";
    readonly SMS_DELIVERY: "sms-delivery";
    readonly CLEANUP_TOKENS: "cleanup-tokens";
};
export declare const giftCardExpiryQueue: Queue<any, any, string, any, any, string>;
export declare const expiryRemindersQueue: Queue<any, any, string, any, any, string>;
export declare const emailDeliveryQueue: Queue<any, any, string, any, any, string>;
export declare const smsDeliveryQueue: Queue<any, any, string, any, any, string>;
export declare const cleanupTokensQueue: Queue<any, any, string, any, any, string>;
export declare const queueEvents: {
    giftCardExpiry: QueueEvents;
    expiryReminders: QueueEvents;
    emailDelivery: QueueEvents;
    smsDelivery: QueueEvents;
    cleanupTokens: QueueEvents;
};
export declare const closeQueues: () => Promise<void>;
//# sourceMappingURL=queue.d.ts.map