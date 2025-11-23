"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = __importDefault(require("../controllers/analytics.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All analytics routes require authentication
router.use(auth_middleware_1.authenticate);
router.use((0, auth_middleware_1.authorize)('ADMIN', 'MERCHANT'));
router.get('/sales', analytics_controller_1.default.getSalesAnalytics.bind(analytics_controller_1.default));
router.get('/redemptions', analytics_controller_1.default.getRedemptionAnalytics.bind(analytics_controller_1.default));
router.get('/customers', analytics_controller_1.default.getCustomerAnalytics.bind(analytics_controller_1.default));
router.get('/gift-cards', analytics_controller_1.default.getGiftCardStats.bind(analytics_controller_1.default));
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map