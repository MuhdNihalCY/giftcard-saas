import { Worker } from 'bullmq';
export declare const giftCardExpiryWorker: Worker<import("../jobs/giftCardExpiry.job").GiftCardExpiryJobData, void, string>;
export declare const expiryRemindersWorker: Worker<import("../jobs/expiryReminders.job").ExpiryReminderJobData, void, string>;
export declare const cleanupTokensWorker: Worker<any, {
    emailTokens: number;
    passwordTokens: number;
}, string>;
export declare const closeWorkers: () => Promise<void>;
//# sourceMappingURL=index.d.ts.map