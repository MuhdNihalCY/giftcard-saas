export declare class PasswordResetService {
    /**
     * Request password reset
     */
    requestPasswordReset(email: string): Promise<{
        message: string;
    }>;
    /**
     * Reset password with token
     */
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    /**
     * Validate password complexity
     */
    private validatePasswordComplexity;
    /**
     * Generate password reset email template
     */
    private generatePasswordResetEmailTemplate;
}
declare const _default: PasswordResetService;
export default _default;
//# sourceMappingURL=passwordReset.service.d.ts.map