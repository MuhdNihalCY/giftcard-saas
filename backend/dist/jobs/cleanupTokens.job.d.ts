import { Job } from 'bullmq';
/**
 * Clean up expired tokens
 */
export declare function processCleanupTokens(job: Job): Promise<{
    emailTokens: number;
    passwordTokens: number;
}>;
//# sourceMappingURL=cleanupTokens.job.d.ts.map