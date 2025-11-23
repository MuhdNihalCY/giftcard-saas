"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const env_1 = require("../../config/env");
const errors_1 = require("../../utils/errors");
const stripe = new stripe_1.default(env_1.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});
class StripeService {
    /**
     * Create payment intent
     */
    async createPaymentIntent(data) {
        const { amount, currency, giftCardId, customerId, metadata = {} } = data;
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency: currency.toLowerCase(),
                customer: customerId,
                metadata: {
                    giftCardId,
                    ...metadata,
                },
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            return {
                paymentIntentId: paymentIntent.id,
                clientSecret: paymentIntent.client_secret,
                status: paymentIntent.status,
            };
        }
        catch (error) {
            throw new errors_1.ValidationError(`Stripe error: ${error.message}`);
        }
    }
    /**
     * Confirm payment intent
     */
    async confirmPaymentIntent(data) {
        const { paymentIntentId, paymentMethodId } = data;
        try {
            const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
                payment_method: paymentMethodId,
            });
            return {
                paymentIntentId: paymentIntent.id,
                status: paymentIntent.status,
                transactionId: paymentIntent.latest_charge,
            };
        }
        catch (error) {
            throw new errors_1.ValidationError(`Stripe confirmation error: ${error.message}`);
        }
    }
    /**
     * Retrieve payment intent
     */
    async getPaymentIntent(paymentIntentId) {
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            return {
                id: paymentIntent.id,
                status: paymentIntent.status,
                amount: paymentIntent.amount / 100, // Convert from cents
                currency: paymentIntent.currency,
                metadata: paymentIntent.metadata,
                transactionId: paymentIntent.latest_charge,
            };
        }
        catch (error) {
            throw new errors_1.ValidationError(`Stripe retrieval error: ${error.message}`);
        }
    }
    /**
     * Process refund
     */
    async refundPayment(paymentIntentId, amount) {
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            const chargeId = paymentIntent.latest_charge;
            if (!chargeId) {
                throw new errors_1.ValidationError('No charge found for this payment intent');
            }
            const refund = await stripe.refunds.create({
                charge: chargeId,
                amount: amount ? Math.round(amount * 100) : undefined, // Partial refund if amount specified
            });
            return {
                refundId: refund.id,
                amount: refund.amount / 100,
                status: refund.status,
            };
        }
        catch (error) {
            throw new errors_1.ValidationError(`Stripe refund error: ${error.message}`);
        }
    }
    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(payload, signature) {
        try {
            return stripe.webhooks.constructEvent(payload, signature, env_1.env.STRIPE_WEBHOOK_SECRET);
        }
        catch (error) {
            throw new errors_1.ValidationError(`Webhook signature verification failed: ${error.message}`);
        }
    }
}
exports.StripeService = StripeService;
exports.default = new StripeService();
//# sourceMappingURL=stripe.service.js.map