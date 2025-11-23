export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
    from?: string;
    fromName?: string;
}
export declare class EmailService {
    private transporter;
    private brevoApiInstance;
    constructor();
    /**
     * Send email
     */
    sendEmail(options: EmailOptions): Promise<void>;
    /**
     * Send gift card email
     */
    sendGiftCardEmail(data: {
        to: string;
        recipientName?: string;
        giftCardCode: string;
        giftCardValue: number;
        currency: string;
        qrCodeUrl?: string;
        customMessage?: string;
        merchantName?: string;
        expiryDate?: Date;
        redemptionUrl: string;
    }): Promise<void>;
    /**
     * Generate gift card email template
     */
    private generateGiftCardEmailTemplate;
    /**
     * Convert HTML to plain text
     */
    private htmlToText;
    /**
     * Send reminder email
     */
    sendReminderEmail(data: {
        to: string;
        recipientName?: string;
        giftCardCode: string;
        giftCardValue: number;
        currency: string;
        daysUntilExpiry: number;
        redemptionUrl: string;
    }): Promise<void>;
}
declare const _default: EmailService;
export default _default;
//# sourceMappingURL=email.service.d.ts.map