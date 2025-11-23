export type OTPType = 'LOGIN' | 'VERIFICATION' | 'PASSWORD_RESET' | 'TRANSACTION' | '2FA';
export interface GenerateOTPOptions {
    identifier: string;
    type: OTPType;
    userId?: string;
    metadata?: Record<string, any>;
}
export interface VerifyOTPOptions {
    identifier: string;
    code: string;
    type: OTPType;
    userId?: string;
}
export declare class OTPService {
    /**
     * Generate and send OTP
     */
    generateAndSendOTP(options: GenerateOTPOptions): Promise<{
        message: string;
        expiresIn: number;
    }>;
    /**
     * Verify OTP
     */
    verifyOTP(options: VerifyOTPOptions): Promise<boolean>;
    /**
     * Check rate limit for OTP generation
     */
    private checkRateLimit;
    /**
     * Generate OTP code
     */
    private generateOTPCode;
    /**
     * Check if identifier is email
     */
    private isEmail;
    /**
     * Check if identifier is phone number
     */
    private isPhoneNumber;
    /**
     * Send OTP via email
     */
    private sendOTPViaEmail;
    /**
     * Send OTP via SMS
     */
    private sendOTPViaSMS;
    /**
     * Get OTP email subject
     */
    private getOTPEmailSubject;
    /**
     * Get OTP SMS message
     */
    private getOTPSMSMessage;
    /**
     * Generate OTP email template
     */
    private generateOTPEmailTemplate;
    /**
     * Resend OTP
     */
    resendOTP(options: GenerateOTPOptions): Promise<{
        message: string;
        expiresIn: number;
    }>;
}
declare const _default: OTPService;
export default _default;
//# sourceMappingURL=otp.service.d.ts.map