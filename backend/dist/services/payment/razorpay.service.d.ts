export interface CreateRazorpayOrderData {
    amount: number;
    currency: string;
    giftCardId: string;
    receipt?: string;
    notes?: Record<string, string>;
}
export interface VerifyPaymentData {
    orderId: string;
    paymentId: string;
    signature: string;
}
export declare class RazorpayService {
    /**
     * Create Razorpay order
     */
    createOrder(data: CreateRazorpayOrderData): Promise<{
        orderId: string;
        amount: number;
        currency: string;
        status: "created" | "attempted" | "paid";
    }>;
    /**
     * Verify payment signature
     */
    verifyPaymentSignature(data: VerifyPaymentData): boolean;
    /**
     * Get payment details
     */
    getPayment(paymentId: string): Promise<{
        id: string;
        orderId: string;
        status: "created" | "authorized" | "captured" | "refunded" | "failed";
        amount: number;
        currency: string;
        method: string;
        transactionId: string;
    }>;
    /**
     * Get order details
     */
    getOrder(orderId: string): Promise<{
        id: string;
        status: "created" | "attempted" | "paid";
        amount: number;
        currency: string;
    }>;
    /**
     * Process refund
     */
    refundPayment(paymentId: string, amount?: number): Promise<{
        refundId: string;
        amount: number;
        status: "failed" | "pending" | "processed";
    }>;
}
declare const _default: RazorpayService;
export default _default;
//# sourceMappingURL=razorpay.service.d.ts.map