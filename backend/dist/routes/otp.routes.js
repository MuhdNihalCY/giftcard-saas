"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const otp_controller_1 = __importDefault(require("../controllers/otp.controller"));
const validation_middleware_1 = require("../middleware/validation.middleware");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const generateOTPSchema = zod_1.z.object({
    identifier: zod_1.z.string().min(1, 'Identifier is required'),
    type: zod_1.z.enum(['LOGIN', 'VERIFICATION', 'PASSWORD_RESET', 'TRANSACTION', '2FA']),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
const verifyOTPSchema = zod_1.z.object({
    identifier: zod_1.z.string().min(1, 'Identifier is required'),
    code: zod_1.z.string().min(4, 'OTP code is required'),
    type: zod_1.z.enum(['LOGIN', 'VERIFICATION', 'PASSWORD_RESET', 'TRANSACTION', '2FA']),
});
// Public routes (some OTPs can be generated without auth, like password reset)
router.post('/generate', (0, validation_middleware_1.validate)(generateOTPSchema), otp_controller_1.default.generateOTP.bind(otp_controller_1.default));
router.post('/verify', (0, validation_middleware_1.validate)(verifyOTPSchema), otp_controller_1.default.verifyOTP.bind(otp_controller_1.default));
router.post('/resend', (0, validation_middleware_1.validate)(generateOTPSchema), otp_controller_1.default.resendOTP.bind(otp_controller_1.default));
exports.default = router;
//# sourceMappingURL=otp.routes.js.map