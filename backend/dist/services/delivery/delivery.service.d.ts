export interface DeliveryOptions {
    giftCardId: string;
    deliveryMethod: 'email' | 'sms' | 'both';
    recipientEmail?: string;
    recipientPhone?: string;
    recipientName?: string;
    scheduleFor?: Date;
}
export declare class DeliveryService {
    /**
     * Deliver gift card
     */
    deliverGiftCard(options: DeliveryOptions): Promise<{
        scheduled: boolean;
        scheduledFor: Date;
        message: string;
        delivered?: undefined;
        results?: undefined;
    } | {
        delivered: boolean;
        results: ({
            method: string;
            status: string;
            recipient: string;
            error?: undefined;
        } | {
            method: string;
            status: string;
            recipient: string;
            error: any;
        })[];
        message: string;
        scheduled?: undefined;
        scheduledFor?: undefined;
    }>;
    /**
     * Send expiry reminder
     */
    sendExpiryReminder(giftCardId: string, daysBeforeExpiry?: number): Promise<{
        message: string;
        sent?: undefined;
        results?: undefined;
        daysUntilExpiry?: undefined;
    } | {
        sent: boolean;
        results: ({
            method: string;
            status: string;
            error?: undefined;
        } | {
            method: string;
            status: string;
            error: any;
        })[];
        daysUntilExpiry: number;
        message?: undefined;
    }>;
}
declare const _default: DeliveryService;
export default _default;
//# sourceMappingURL=delivery.service.d.ts.map