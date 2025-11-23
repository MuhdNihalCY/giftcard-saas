export declare class SchedulerService {
    /**
     * Schedule daily gift card expiry check
     * Runs every day at 2 AM
     */
    scheduleGiftCardExpiryCheck(): void;
    /**
     * Schedule expiry reminders
     * Runs every day at 9 AM
     */
    scheduleExpiryReminders(): void;
    /**
     * Schedule token cleanup
     * Runs every day at 3 AM
     */
    scheduleTokenCleanup(): void;
    /**
     * Start all scheduled jobs
     */
    start(): void;
}
declare const _default: SchedulerService;
export default _default;
//# sourceMappingURL=scheduler.service.d.ts.map