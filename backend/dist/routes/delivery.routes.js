"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const delivery_controller_1 = __importDefault(require("../controllers/delivery.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const delivery_validator_1 = require("../validators/delivery.validator");
const router = (0, express_1.Router)();
// All delivery routes require authentication
router.use(auth_middleware_1.authenticate);
// Deliver gift card
router.post('/deliver', (0, auth_middleware_1.authorize)('ADMIN', 'MERCHANT'), (0, validation_middleware_1.validate)(delivery_validator_1.deliverGiftCardSchema), delivery_controller_1.default.deliverGiftCard.bind(delivery_controller_1.default));
// Send expiry reminder
router.post('/reminder/:id', (0, auth_middleware_1.authorize)('ADMIN', 'MERCHANT'), (0, validation_middleware_1.validate)(delivery_validator_1.sendReminderSchema), delivery_controller_1.default.sendReminder.bind(delivery_controller_1.default));
// Generate PDF (stream)
router.get('/pdf/:id', delivery_controller_1.default.generatePDF.bind(delivery_controller_1.default));
// Generate and download PDF (save to file)
router.get('/pdf/:id/download', delivery_controller_1.default.downloadPDF.bind(delivery_controller_1.default));
exports.default = router;
//# sourceMappingURL=delivery.routes.js.map