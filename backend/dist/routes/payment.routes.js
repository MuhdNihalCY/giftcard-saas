"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = __importDefault(require("../controllers/payment.controller"));
const webhook_controller_1 = __importDefault(require("../controllers/webhook.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const payment_validator_1 = require("../validators/payment.validator");
const express_2 = __importDefault(require("express"));
const router = (0, express_1.Router)();
// Payment routes (require authentication)
router.post('/create-intent', auth_middleware_1.authenticate, (0, validation_middleware_1.validate)(payment_validator_1.createPaymentSchema), payment_controller_1.default.createPayment.bind(payment_controller_1.default));
router.post('/confirm', (0, validation_middleware_1.validate)(payment_validator_1.confirmPaymentSchema), payment_controller_1.default.confirmPayment.bind(payment_controller_1.default));
router.get('/', auth_middleware_1.authenticate, payment_controller_1.default.listPayments.bind(payment_controller_1.default));
router.get('/:id', auth_middleware_1.authenticate, payment_controller_1.default.getPayment.bind(payment_controller_1.default));
router.post('/:id/refund', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN', 'MERCHANT'), (0, validation_middleware_1.validate)(payment_validator_1.refundPaymentSchema), payment_controller_1.default.refundPayment.bind(payment_controller_1.default));
// Webhook routes (no authentication, signature verification instead)
router.post('/webhook/stripe', express_2.default.raw({ type: 'application/json' }), webhook_controller_1.default.stripeWebhook.bind(webhook_controller_1.default));
router.post('/webhook/razorpay', express_2.default.json(), webhook_controller_1.default.razorpayWebhook.bind(webhook_controller_1.default));
exports.default = router;
//# sourceMappingURL=payment.routes.js.map