"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayService = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const env_1 = require("../../config/env");
const errors_1 = require("../../utils/errors");
const crypto_1 = __importDefault(require("crypto"));
const razorpay = new razorpay_1.default({
    key_id: env_1.env.RAZORPAY_KEY_ID,
    key_secret: env_1.env.RAZORPAY_KEY_SECRET,
});
class RazorpayService {
    /**
     * Create Razorpay order
     */
    async createOrder(data) {
        const { amount, currency, giftCardId, receipt, notes = {} } = data;
        try {
            const order = await razorpay.orders.create({
                amount: Math.round(amount * 100), // Convert to paise
                currency: currency.toUpperCase(),
                receipt: receipt || `giftcard_${giftCardId}_${Date.now()}`,
                notes: {
                    giftCardId,
                    ...notes,
                },
            });
            return {
                orderId: order.id,
                amount: order.amount / 100,
                currency: order.currency,
                status: order.status,
            };
        }
        catch (error) {
            throw new errors_1.ValidationError(`Razorpay order creation error: ${error.message}`);
        }
    }
    /**
     * Verify payment signature
     */
    verifyPaymentSignature(data) {
        const { orderId, paymentId, signature } = data;
        const text = `${orderId}|${paymentId}`;
        const generatedSignature = crypto_1.default
            .createHmac('sha256', env_1.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest('hex');
        return generatedSignature === signature;
    }
    /**
     * Get payment details
     */
    async getPayment(paymentId) {
        try {
            const payment = await razorpay.payments.fetch(paymentId);
            return {
                id: payment.id,
                orderId: payment.order_id,
                status: payment.status,
                amount: payment.amount / 100,
                currency: payment.currency,
                method: payment.method,
                transactionId: payment.id,
            };
        }
        catch (error) {
            throw new errors_1.ValidationError(`Razorpay payment retrieval error: ${error.message}`);
        }
    }
    /**
     * Get order details
     */
    async getOrder(orderId) {
        try {
            const order = await razorpay.orders.fetch(orderId);
            return {
                id: order.id,
                status: order.status,
                amount: order.amount / 100,
                currency: order.currency,
            };
        }
        catch (error) {
            throw new errors_1.ValidationError(`Razorpay order retrieval error: ${error.message}`);
        }
    }
    /**
     * Process refund
     */
    async refundPayment(paymentId, amount) {
        try {
            const refundData = {};
            if (amount) {
                refundData.amount = Math.round(amount * 100); // Convert to paise
            }
            const refund = await razorpay.payments.refund(paymentId, refundData);
            return {
                refundId: refund.id,
                amount: refund.amount / 100,
                status: refund.status,
            };
        }
        catch (error) {
            throw new errors_1.ValidationError(`Razorpay refund error: ${error.message}`);
        }
    }
}
exports.RazorpayService = RazorpayService;
exports.default = new RazorpayService();
//# sourceMappingURL=razorpay.service.js.map