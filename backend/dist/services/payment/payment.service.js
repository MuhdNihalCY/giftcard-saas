"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const library_1 = require("@prisma/client/runtime/library");
const database_1 = __importDefault(require("../../config/database"));
const errors_1 = require("../../utils/errors");
const client_1 = require("@prisma/client");
const stripe_service_1 = __importDefault(require("./stripe.service"));
const paypal_service_1 = __importDefault(require("./paypal.service"));
const razorpay_service_1 = __importDefault(require("./razorpay.service"));
const giftcard_service_1 = __importDefault(require("../giftcard.service"));
class PaymentService {
    /**
     * Create payment
     */
    async createPayment(data) {
        const { giftCardId, customerId, amount, currency, paymentMethod, returnUrl, cancelUrl } = data;
        // Verify gift card exists
        const giftCard = await giftcard_service_1.default.getById(giftCardId);
        if (giftCard.status !== 'ACTIVE') {
            throw new errors_1.ValidationError('Gift card is not active');
        }
        // Validate amount matches gift card value
        if (amount !== Number(giftCard.value)) {
            throw new errors_1.ValidationError('Payment amount does not match gift card value');
        }
        let paymentIntentId;
        let orderId;
        let clientSecret;
        let status = client_1.PaymentStatus.PENDING;
        // Create payment based on method
        switch (paymentMethod) {
            case client_1.PaymentMethod.STRIPE:
                const stripeResult = await stripe_service_1.default.createPaymentIntent({
                    amount,
                    currency,
                    giftCardId,
                    customerId,
                });
                paymentIntentId = stripeResult.paymentIntentId;
                clientSecret = stripeResult.clientSecret;
                status = stripeResult.status === 'succeeded' ? client_1.PaymentStatus.COMPLETED : client_1.PaymentStatus.PENDING;
                break;
            case client_1.PaymentMethod.PAYPAL:
                if (!returnUrl || !cancelUrl) {
                    throw new errors_1.ValidationError('Return URL and Cancel URL are required for PayPal');
                }
                const paypalResult = await paypal_service_1.default.createOrder({
                    amount,
                    currency,
                    giftCardId,
                    returnUrl,
                    cancelUrl,
                });
                orderId = paypalResult.orderId;
                break;
            case client_1.PaymentMethod.RAZORPAY:
                const razorpayResult = await razorpay_service_1.default.createOrder({
                    amount,
                    currency,
                    giftCardId,
                });
                orderId = razorpayResult.orderId;
                break;
            case client_1.PaymentMethod.UPI:
                // UPI integration would go here
                // For now, we'll treat it similar to Razorpay
                throw new errors_1.ValidationError('UPI payment method not yet implemented');
            default:
                throw new errors_1.ValidationError('Invalid payment method');
        }
        // Create payment record
        const payment = await database_1.default.payment.create({
            data: {
                giftCardId,
                customerId,
                amount: new library_1.Decimal(amount),
                currency,
                paymentMethod,
                paymentIntentId: paymentIntentId || orderId || '',
                status,
                metadata: {
                    returnUrl,
                    cancelUrl,
                },
            },
            include: {
                giftCard: true,
                customer: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        });
        return {
            payment,
            clientSecret,
            orderId,
            paymentIntentId,
        };
    }
    /**
     * Confirm payment
     */
    async confirmPayment(data) {
        const { paymentId, paymentMethod, paymentIntentId, orderId, paymentMethodId, signature } = data;
        // Get payment record
        const payment = await database_1.default.payment.findUnique({
            where: { id: paymentId },
            include: { giftCard: true },
        });
        if (!payment) {
            throw new errors_1.NotFoundError('Payment not found');
        }
        if (payment.status === client_1.PaymentStatus.COMPLETED) {
            throw new errors_1.ValidationError('Payment already completed');
        }
        let transactionId;
        let confirmed = false;
        // Confirm payment based on method
        switch (paymentMethod) {
            case client_1.PaymentMethod.STRIPE:
                if (!paymentIntentId) {
                    throw new errors_1.ValidationError('Payment intent ID is required for Stripe');
                }
                const stripeResult = await stripe_service_1.default.confirmPaymentIntent({
                    paymentIntentId,
                    paymentMethodId,
                });
                transactionId = stripeResult.transactionId;
                confirmed = stripeResult.status === 'succeeded';
                break;
            case client_1.PaymentMethod.PAYPAL:
                if (!orderId) {
                    throw new errors_1.ValidationError('Order ID is required for PayPal');
                }
                const paypalResult = await paypal_service_1.default.captureOrder(orderId);
                transactionId = paypalResult.transactionId;
                confirmed = paypalResult.status === 'COMPLETED';
                break;
            case client_1.PaymentMethod.RAZORPAY:
                if (!orderId || !signature) {
                    throw new errors_1.ValidationError('Order ID and signature are required for Razorpay');
                }
                // Get payment ID from metadata or request
                const paymentIdFromRazorpay = payment.paymentIntentId; // This would be the Razorpay payment ID
                const isValid = razorpay_service_1.default.verifyPaymentSignature({
                    orderId,
                    paymentId: paymentIdFromRazorpay,
                    signature,
                });
                if (!isValid) {
                    throw new errors_1.ValidationError('Invalid payment signature');
                }
                const razorpayPayment = await razorpay_service_1.default.getPayment(paymentIdFromRazorpay);
                transactionId = razorpayPayment.transactionId;
                confirmed = razorpayPayment.status === 'captured';
                break;
            default:
                throw new errors_1.ValidationError('Invalid payment method');
        }
        if (!confirmed) {
            // Update payment status to failed
            await database_1.default.payment.update({
                where: { id: paymentId },
                data: { status: client_1.PaymentStatus.FAILED },
            });
            throw new errors_1.ValidationError('Payment confirmation failed');
        }
        // Update payment status
        const updatedPayment = await database_1.default.payment.update({
            where: { id: paymentId },
            data: {
                status: client_1.PaymentStatus.COMPLETED,
                transactionId,
            },
            include: {
                giftCard: true,
                customer: true,
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
                    paymentMethod: payment.paymentMethod,
                },
            },
        });
        return updatedPayment;
    }
    /**
     * Get payment by ID
     */
    async getById(id) {
        const payment = await database_1.default.payment.findUnique({
            where: { id },
            include: {
                giftCard: {
                    include: {
                        merchant: {
                            select: {
                                id: true,
                                email: true,
                                businessName: true,
                            },
                        },
                    },
                },
                customer: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        if (!payment) {
            throw new errors_1.NotFoundError('Payment not found');
        }
        return payment;
    }
    /**
     * List payments
     */
    async list(filters) {
        const { giftCardId, customerId, status, paymentMethod, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (giftCardId)
            where.giftCardId = giftCardId;
        if (customerId)
            where.customerId = customerId;
        if (status)
            where.status = status;
        if (paymentMethod)
            where.paymentMethod = paymentMethod;
        const [payments, total] = await Promise.all([
            database_1.default.payment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    giftCard: {
                        select: {
                            id: true,
                            code: true,
                            value: true,
                        },
                    },
                    customer: {
                        select: {
                            id: true,
                            email: true,
                        },
                    },
                },
            }),
            database_1.default.payment.count({ where }),
        ]);
        return {
            payments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Process refund
     */
    async refundPayment(data) {
        const { paymentId, amount, reason } = data;
        const payment = await this.getById(paymentId);
        if (payment.status !== client_1.PaymentStatus.COMPLETED) {
            throw new errors_1.ValidationError('Only completed payments can be refunded');
        }
        if (!payment.transactionId) {
            throw new errors_1.ValidationError('Payment transaction ID not found');
        }
        let refundResult;
        // Process refund based on payment method
        switch (payment.paymentMethod) {
            case client_1.PaymentMethod.STRIPE:
                refundResult = await stripe_service_1.default.refundPayment(payment.paymentIntentId, amount);
                break;
            case client_1.PaymentMethod.PAYPAL:
                refundResult = await paypal_service_1.default.refundPayment(payment.transactionId, amount);
                break;
            case client_1.PaymentMethod.RAZORPAY:
                refundResult = await razorpay_service_1.default.refundPayment(payment.transactionId, amount);
                break;
            default:
                throw new errors_1.ValidationError('Refund not supported for this payment method');
        }
        // Update payment status
        const refundAmount = amount || Number(payment.amount);
        await database_1.default.payment.update({
            where: { id: paymentId },
            data: { status: client_1.PaymentStatus.REFUNDED },
        });
        // Update gift card balance if needed
        const giftCard = await giftcard_service_1.default.getById(payment.giftCardId);
        const newBalance = Number(giftCard.balance) - refundAmount;
        await database_1.default.giftCard.update({
            where: { id: payment.giftCardId },
            data: {
                balance: new library_1.Decimal(Math.max(0, newBalance)),
                status: newBalance <= 0 ? 'CANCELLED' : giftCard.status,
            },
        });
        // Create transaction record
        await database_1.default.transaction.create({
            data: {
                giftCardId: payment.giftCardId,
                type: 'REFUND',
                amount: new library_1.Decimal(refundAmount),
                balanceBefore: giftCard.balance,
                balanceAfter: new library_1.Decimal(Math.max(0, newBalance)),
                userId: payment.customerId || null,
                metadata: {
                    paymentId: payment.id,
                    refundId: refundResult.refundId,
                    reason,
                },
            },
        });
        return {
            refundId: refundResult.refundId,
            amount: refundAmount,
            status: refundResult.status,
        };
    }
}
exports.PaymentService = PaymentService;
exports.default = new PaymentService();
//# sourceMappingURL=payment.service.js.map