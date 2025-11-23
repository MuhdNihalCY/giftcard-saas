import { Job } from 'bullmq';
export interface GiftCardExpiryJobData {
    giftCardId: string;
}
/**
 * Process gift card expiry check
 */
export declare function processGiftCardExpiry(job: Job<GiftCardExpiryJobData>): Promise<void>;
//# sourceMappingURL=giftCardExpiry.job.d.ts.map