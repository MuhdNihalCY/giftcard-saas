"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayPalService = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../../config/env");
const errors_1 = require("../../utils/errors");
class PayPalService {
    baseUrl;
    clientId;
    clientSecret;
    constructor() {
        this.baseUrl = env_1.env.PAYPAL_MODE === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';
        this.clientId = env_1.env.PAYPAL_CLIENT_ID;
        this.clientSecret = env_1.env.PAYPAL_SECRET;
    }
    /**
     * Get access token
     */
    async getAccessToken() {
        try {
            const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
            const response = await axios_1.default.post(`${this.baseUrl}/v1/oauth2/token`, 'grant_type=client_credentials', {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            return response.data.access_token;
        }
        catch (error) {
            throw new errors_1.ValidationError(`PayPal authentication error: ${error.message}`);
        }
    }
    /**
     * Create PayPal order
     */
    async createOrder(data) {
        const { amount, currency, giftCardId, returnUrl, cancelUrl } = data;
        try {
            const accessToken = await this.getAccessToken();
            const orderData = {
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        reference_id: giftCardId,
                        amount: {
                            currency_code: currency,
                            value: amount.toFixed(2),
                        },
                    },
                ],
                application_context: {
                    return_url: returnUrl,
                    cancel_url: cancelUrl,
                },
            };
            const response = await axios_1.default.post(`${this.baseUrl}/v2/checkout/orders`, orderData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            return {
                orderId: response.data.id,
                status: response.data.status,
                links: response.data.links,
            };
        }
        catch (error) {
            throw new errors_1.ValidationError(`PayPal order creation error: ${error.message}`);
        }
    }
    /**
     * Capture PayPal order
     */
    async captureOrder(orderId) {
        try {
            const accessToken = await this.getAccessToken();
            const response = await axios_1.default.post(`${this.baseUrl}/v2/checkout/orders/${orderId}/capture`, {}, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            const capture = response.data.purchase_units[0].payments.captures[0];
            return {
                orderId: response.data.id,
                status: response.data.status,
                transactionId: capture.id,
                amount: parseFloat(capture.amount.value),
                currency: capture.amount.currency_code,
            };
        }
        catch (error) {
            throw new errors_1.ValidationError(`PayPal capture error: ${error.message}`);
        }
    }
    /**
     * Get order details
     */
    async getOrder(orderId) {
        try {
            const accessToken = await this.getAccessToken();
            const response = await axios_1.default.get(`${this.baseUrl}/v2/checkout/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            return {
                id: response.data.id,
                status: response.data.status,
                amount: parseFloat(response.data.purchase_units[0].amount.value),
                currency: response.data.purchase_units[0].amount.currency_code,
            };
        }
        catch (error) {
            throw new errors_1.ValidationError(`PayPal order retrieval error: ${error.message}`);
        }
    }
    /**
     * Process refund
     */
    async refundPayment(captureId, amount) {
        try {
            const accessToken = await this.getAccessToken();
            const refundData = {};
            if (amount) {
                refundData.amount = {
                    value: amount.toFixed(2),
                    currency_code: 'USD', // Should be dynamic based on original payment
                };
            }
            const response = await axios_1.default.post(`${this.baseUrl}/v2/payments/captures/${captureId}/refund`, refundData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            return {
                refundId: response.data.id,
                status: response.data.status,
                amount: parseFloat(response.data.amount?.value || '0'),
            };
        }
        catch (error) {
            throw new errors_1.ValidationError(`PayPal refund error: ${error.message}`);
        }
    }
}
exports.PayPalService = PayPalService;
exports.default = new PayPalService();
//# sourceMappingURL=paypal.service.js.map