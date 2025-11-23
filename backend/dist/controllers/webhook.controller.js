"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const crypto_1 = __importDefault(require("crypto"));
const library_1 = require("@prisma/client/runtime/library");
const stripe_service_1 = __importDefault(require("../services/payment/stripe.service"));
const client_1 = require("@prisma/client");
const database_1 = __importDefault(require("../config/database"));
const env_1 = require("../config/env");
const logger_1 = __importDefault(require("../utils/logger"));
class WebhookController {
    async stripeWebhook(req, res, next) {
        try {
            const signature = req.headers['stripe-signature'];
            const event = stripe_service_1.default.verifyWebhookSignature(req.body, signature);
            // Handle different event types
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.handleStripePaymentSuccess(event.data.object);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handleStripePaymentFailed(event.data.object);
                    break;
                case 'charge.refunded':
                    await this.handleStripeRefund(event.data.object);
                    break;
                default:
                    logger_1.default.info('Unhandled Stripe webhook event type', { eventType: event.type });
            }
            res.json({ received: true });
        }
        catch (error) {
            next(error);
        }
    }
    async handleStripePaymentSuccess(paymentIntent) {
        const giftCardId = paymentIntent.metadata?.giftCardId;
        if (!giftCardId)
            return;
        // Find payment by payment intent ID
        const payment = await database_1.default.payment.findFirst({
            where: {
                paymentIntentId: paymentIntent.id,
                paymentMethod: client_1.PaymentMethod.STRIPE,
            },
        });
        if (!payment || payment.status === client_1.PaymentStatus.COMPLETED) {
            return;
        }
        // Update payment status
        await database_1.default.payment.update({
            where: { id: payment.id },
            data: {
                status: client_1.PaymentStatus.COMPLETED,
                transactionId: paymentIntent.latest_charge,
            },
        });
        // Create transaction record
        await database_1.default.transaction.create({
            data: {
                giftCardId: payment.giftCardId,
                type: 'PURCHASE',
                amount: payment.amount,
                balanceBefore: new library_1.Decimal(0),
                balanceAfter: payment.amount,
                userId: payment.customerId || null,
                metadata: {
                    paymentId: payment.id,
                    paymentMethod: client_1.PaymentMethod.STRIPE,
                },
            },
        });
    }
    async handleStripePaymentFailed(paymentIntent) {
        const payment = await database_1.default.payment.findFirst({
            where: {
                paymentIntentId: paymentIntent.id,
                paymentMethod: client_1.PaymentMethod.STRIPE,
            },
        });
        if (payment && payment.status !== client_1.PaymentStatus.FAILED) {
            await database_1.default.payment.update({
                where: { id: payment.id },
                data: { status: client_1.PaymentStatus.FAILED },
            });
        }
    }
    async handleStripeRefund(charge) {
        // Handle refund webhook if needed
        logger_1.default.info('Stripe refund webhook received', { chargeId: charge.id });
    }
    async razorpayWebhook(req, res, next) {
        try {
            const event = req.body;
            // Verify webhook signature
            const text = JSON.stringify(req.body);
            const signature = req.headers['x-razorpay-signature'];
            const expectedSignature = crypto_1.default
                .createHmac('sha256', env_1.env.RAZORPAY_KEY_SECRET)
                .update(text)
                .digest('hex');
            if (signature !== expectedSignature) {
                return res.status(400).json({ error: 'Invalid signature' });
            }
            // Handle different event types
            switch (event.event) {
                case 'payment.captured':
                    await this.handleRazorpayPaymentSuccess(event.payload.payment.entity);
                    break;
                case 'payment.failed':
                    await this.handleRazorpayPaymentFailed(event.payload.payment.entity);
                    break;
                default:
                    logger_1.default.info('Unhandled Razorpay webhook event', { eventType: event.event });
            }
            res.json({ received: true });
        }
        catch (error) {
            next(error);
        }
    }
    async handleRazorpayPaymentSuccess(payment) {
        const orderId = payment.order_id;
        const paymentRecord = await database_1.default.payment.findFirst({
            where: {
                paymentIntentId: payment.id,
                paymentMethod: client_1.PaymentMethod.RAZORPAY,
            },
        });
        if (!paymentRecord || paymentRecord.status === client_1.PaymentStatus.COMPLETED) {
            return;
        }
        await database_1.default.payment.update({
            where: { id: paymentRecord.id },
            data: {
                status: client_1.PaymentStatus.COMPLETED,
                transactionId: payment.id,
            },
        });
        await database_1.default.transaction.create({
            data: {
                giftCardId: paymentRecord.giftCardId,
                type: 'PURCHASE',
                amount: paymentRecord.amount,
                balanceBefore: new library_1.Decimal(0),
                balanceAfter: paymentRecord.amount,
                userId: paymentRecord.customerId || null,
                metadata: {
                    paymentId: paymentRecord.id,
                    paymentMethod: client_1.PaymentMethod.RAZORPAY,
                },
            },
        });
    }
    async handleRazorpayPaymentFailed(payment) {
        const paymentRecord = await database_1.default.payment.findFirst({
            where: {
                paymentIntentId: payment.id,
                paymentMethod: client_1.PaymentMethod.RAZORPAY,
            },
        });
        if (paymentRecord && paymentRecord.status !== client_1.PaymentStatus.FAILED) {
            await database_1.default.payment.update({
                where: { id: paymentRecord.id },
                data: { status: client_1.PaymentStatus.FAILED },
            });
        }
    }
}
exports.WebhookController = WebhookController;
exports.default = new WebhookController();
//# sourceMappingURL=webhook.controller.js.map