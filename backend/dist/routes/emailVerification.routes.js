"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const emailVerification_controller_1 = __importDefault(require("../controllers/emailVerification.controller"));
const validation_middleware_1 = require("../middleware/validation.middleware");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const verifyEmailSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Verification token is required'),
});
const resendVerificationSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
});
// Public routes
router.post('/verify', (0, validation_middleware_1.validate)(verifyEmailSchema), emailVerification_controller_1.default.verifyEmail.bind(emailVerification_controller_1.default));
router.post('/resend', (0, validation_middleware_1.validate)(resendVerificationSchema), emailVerification_controller_1.default.resendVerificationEmail.bind(emailVerification_controller_1.default));
exports.default = router;
//# sourceMappingURL=emailVerification.routes.js.map