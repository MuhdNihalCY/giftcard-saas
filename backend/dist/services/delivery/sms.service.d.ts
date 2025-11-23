export interface SMSOptions {
    to: string;
    message: string;
}
export declare class SMSService {
    private twilioClient;
    private brevoApiInstance;
    constructor();
    /**
     * Send SMS
     */
    sendSMS(options: SMSOptions): Promise<void>;
    /**
     * Send gift card SMS
     */
    sendGiftCardSMS(data: {
        to: string;
        giftCardCode: string;
        giftCardValue: number;
        currency: string;
        redemptionUrl: string;
        merchantName?: string;
        expiryDate?: Date;
    }): Promise<void>;
    /**
     * Send reminder SMS
     */
    sendReminderSMS(data: {
        to: string;
        giftCardCode: string;
        giftCardValue: number;
        currency: string;
        daysUntilExpiry: number;
        redemptionUrl: string;
    }): Promise<void>;
}
declare const _default: SMSService;
export default _default;
//# sourceMappingURL=sms.service.d.ts.map