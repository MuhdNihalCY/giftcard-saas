export interface CreatePayPalOrderData {
    amount: number;
    currency: string;
    giftCardId: string;
    returnUrl: string;
    cancelUrl: string;
}
export declare class PayPalService {
    private baseUrl;
    private clientId;
    private clientSecret;
    constructor();
    /**
     * Get access token
     */
    private getAccessToken;
    /**
     * Create PayPal order
     */
    createOrder(data: CreatePayPalOrderData): Promise<{
        orderId: any;
        status: any;
        links: any;
    }>;
    /**
     * Capture PayPal order
     */
    captureOrder(orderId: string): Promise<{
        orderId: any;
        status: any;
        transactionId: any;
        amount: number;
        currency: any;
    }>;
    /**
     * Get order details
     */
    getOrder(orderId: string): Promise<{
        id: any;
        status: any;
        amount: number;
        currency: any;
    }>;
    /**
     * Process refund
     */
    refundPayment(captureId: string, amount?: number): Promise<{
        refundId: any;
        status: any;
        amount: number;
    }>;
}
declare const _default: PayPalService;
export default _default;
//# sourceMappingURL=paypal.service.d.ts.map