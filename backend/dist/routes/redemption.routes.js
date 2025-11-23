"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const redemption_controller_1 = __importDefault(require("../controllers/redemption.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const redemption_validator_1 = require("../validators/redemption.validator");
const router = (0, express_1.Router)();
// Public endpoints
router.post('/validate', (0, validation_middleware_1.validate)(redemption_validator_1.validateGiftCardSchema), redemption_controller_1.default.validateGiftCard.bind(redemption_controller_1.default));
router.post('/check-balance', (0, validation_middleware_1.validate)(redemption_validator_1.checkBalanceSchema), redemption_controller_1.default.checkBalance.bind(redemption_controller_1.default));
router.post('/redeem/:code', (0, validation_middleware_1.validate)(redemption_validator_1.redeemViaLinkSchema), redemption_controller_1.default.redeemViaLink.bind(redemption_controller_1.default));
// Authenticated endpoints
router.post('/redeem', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN', 'MERCHANT'), (0, validation_middleware_1.validate)(redemption_validator_1.redeemGiftCardSchema), redemption_controller_1.default.redeemGiftCard.bind(redemption_controller_1.default));
router.post('/redeem/qr', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN', 'MERCHANT'), (0, validation_middleware_1.validate)(redemption_validator_1.redeemViaQRSchema), redemption_controller_1.default.redeemViaQR.bind(redemption_controller_1.default));
router.get('/', auth_middleware_1.authenticate, redemption_controller_1.default.listRedemptions.bind(redemption_controller_1.default));
router.get('/:id', auth_middleware_1.authenticate, redemption_controller_1.default.getRedemption.bind(redemption_controller_1.default));
router.get('/gift-card/:id/history', auth_middleware_1.authenticate, redemption_controller_1.default.getGiftCardHistory.bind(redemption_controller_1.default));
router.get('/gift-card/:id/transactions', auth_middleware_1.authenticate, redemption_controller_1.default.getTransactionHistory.bind(redemption_controller_1.default));
exports.default = router;
//# sourceMappingURL=redemption.routes.js.map