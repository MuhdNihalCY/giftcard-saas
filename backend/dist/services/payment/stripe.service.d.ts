import Stripe from 'stripe';
export interface CreatePaymentIntentData {
    amount: number;
    currency: string;
    giftCardId: string;
    customerId?: string;
    metadata?: Record<string, string>;
}
export interface ConfirmPaymentData {
    paymentIntentId: string;
    paymentMethodId?: string;
}
export declare class StripeService {
    /**
     * Create payment intent
     */
    createPaymentIntent(data: CreatePaymentIntentData): Promise<{
        paymentIntentId: string;
        clientSecret: string | null;
        status: Stripe.PaymentIntent.Status;
    }>;
    /**
     * Confirm payment intent
     */
    confirmPaymentIntent(data: ConfirmPaymentData): Promise<{
        paymentIntentId: string;
        status: Stripe.PaymentIntent.Status;
        transactionId: string;
    }>;
    /**
     * Retrieve payment intent
     */
    getPaymentIntent(paymentIntentId: string): Promise<{
        id: string;
        status: Stripe.PaymentIntent.Status;
        amount: number;
        currency: string;
        metadata: Stripe.Metadata;
        transactionId: string;
    }>;
    /**
     * Process refund
     */
    refundPayment(paymentIntentId: string, amount?: number): Promise<{
        refundId: string;
        amount: number;
        status: string | null;
    }>;
    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event;
}
declare const _default: StripeService;
export default _default;
//# sourceMappingURL=stripe.service.d.ts.map