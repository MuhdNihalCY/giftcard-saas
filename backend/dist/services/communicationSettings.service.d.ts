export interface CommunicationSettingsData {
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    otpEnabled?: boolean;
    pushEnabled?: boolean;
    emailRateLimit?: number;
    smsRateLimit?: number;
    otpRateLimit?: number;
    otpExpiryMinutes?: number;
    otpLength?: number;
}
export declare class CommunicationSettingsService {
    private static SETTINGS_ID;
    /**
     * Get current communication settings
     */
    getSettings(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        emailEnabled: boolean;
        smsEnabled: boolean;
        otpEnabled: boolean;
        pushEnabled: boolean;
        emailRateLimit: number;
        smsRateLimit: number;
        otpRateLimit: number;
        otpExpiryMinutes: number;
        otpLength: number;
        updatedBy: string | null;
    }>;
    /**
     * Update communication settings (Admin only)
     */
    updateSettings(data: CommunicationSettingsData, updatedBy: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        emailEnabled: boolean;
        smsEnabled: boolean;
        otpEnabled: boolean;
        pushEnabled: boolean;
        emailRateLimit: number;
        smsRateLimit: number;
        otpRateLimit: number;
        otpExpiryMinutes: number;
        otpLength: number;
        updatedBy: string | null;
    }>;
    /**
     * Check if email is enabled
     */
    isEmailEnabled(): Promise<boolean>;
    /**
     * Check if SMS is enabled
     */
    isSMSEnabled(): Promise<boolean>;
    /**
     * Check if OTP is enabled
     */
    isOTPEnabled(): Promise<boolean>;
    /**
     * Check if push notifications are enabled
     */
    isPushEnabled(): Promise<boolean>;
    /**
     * Get rate limit for a channel
     */
    getRateLimit(channel: 'email' | 'sms' | 'otp'): Promise<number>;
    /**
     * Get OTP configuration
     */
    getOTPConfig(): Promise<{
        enabled: boolean;
        expiryMinutes: number;
        length: number;
        rateLimit: number;
    }>;
}
declare const _default: CommunicationSettingsService;
export default _default;
//# sourceMappingURL=communicationSettings.service.d.ts.map