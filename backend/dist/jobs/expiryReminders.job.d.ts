import { Job } from 'bullmq';
export interface ExpiryReminderJobData {
    giftCardId: string;
    daysUntilExpiry: number;
}
/**
 * Process expiry reminder
 */
export declare function processExpiryReminder(job: Job<ExpiryReminderJobData>): Promise<void>;
//# sourceMappingURL=expiryReminders.job.d.ts.map