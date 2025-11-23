export declare class EmailVerificationService {
    /**
     * Generate and send verification email
     */
    sendVerificationEmail(userId: string, email: string): Promise<void>;
    /**
     * Verify email with token
     */
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    /**
     * Resend verification email
     */
    resendVerificationEmail(email: string): Promise<{
        message: string;
    }>;
    /**
     * Generate verification email template
     */
    private generateVerificationEmailTemplate;
}
declare const _default: EmailVerificationService;
export default _default;
//# sourceMappingURL=emailVerification.service.d.ts.map