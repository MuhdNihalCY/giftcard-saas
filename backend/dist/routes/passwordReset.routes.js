"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passwordReset_controller_1 = __importDefault(require("../controllers/passwordReset.controller"));
const validation_middleware_1 = require("../middleware/validation.middleware");
const password_validator_1 = require("../validators/password.validator");
const router = (0, express_1.Router)();
// Public routes
router.post('/request', (0, validation_middleware_1.validate)(password_validator_1.requestPasswordResetSchema), passwordReset_controller_1.default.requestPasswordReset.bind(passwordReset_controller_1.default));
router.post('/reset', (0, validation_middleware_1.validate)(password_validator_1.resetPasswordSchema), passwordReset_controller_1.default.resetPassword.bind(passwordReset_controller_1.default));
exports.default = router;
//# sourceMappingURL=passwordReset.routes.js.map