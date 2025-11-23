"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const payment_service_1 = __importDefault(require("../services/payment/payment.service"));
class PaymentController {
    async createPayment(req, res, next) {
        try {
            const customerId = req.user?.userId;
            const result = await payment_service_1.default.createPayment({
                ...req.body,
                customerId,
            });
            res.status(201).json({
                success: true,
                data: result,
                message: 'Payment created successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async confirmPayment(req, res, next) {
        try {
            const payment = await payment_service_1.default.confirmPayment(req.body);
            res.json({
                success: true,
                data: payment,
                message: 'Payment confirmed successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getPayment(req, res, next) {
        try {
            const { id } = req.params;
            const payment = await payment_service_1.default.getById(id);
            res.json({
                success: true,
                data: payment,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async listPayments(req, res, next) {
        try {
            const { giftCardId, customerId, status, paymentMethod, page, limit } = req.query;
            const result = await payment_service_1.default.list({
                giftCardId: giftCardId,
                customerId: customerId,
                status: status,
                paymentMethod: paymentMethod,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
            });
            res.json({
                success: true,
                data: result.payments,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async refundPayment(req, res, next) {
        try {
            const { id } = req.params;
            const result = await payment_service_1.default.refundPayment({
                paymentId: id,
                ...req.body,
            });
            res.json({
                success: true,
                data: result,
                message: 'Refund processed successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PaymentController = PaymentController;
exports.default = new PaymentController();
//# sourceMappingURL=payment.controller.js.map