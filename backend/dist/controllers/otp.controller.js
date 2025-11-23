"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPController = void 0;
const otp_service_1 = __importDefault(require("../services/otp.service"));
const errors_1 = require("../utils/errors");
class OTPController {
    /**
     * Generate and send OTP
     */
    async generateOTP(req, res, next) {
        try {
            const { identifier, type, metadata } = req.body;
            if (!identifier || !type) {
                throw new errors_1.ValidationError('Identifier and type are required');
            }
            const result = await otp_service_1.default.generateAndSendOTP({
                identifier,
                type,
                userId: req.user?.userId,
                metadata,
            });
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Verify OTP
     */
    async verifyOTP(req, res, next) {
        try {
            const { identifier, code, type } = req.body;
            if (!identifier || !code || !type) {
                throw new errors_1.ValidationError('Identifier, code, and type are required');
            }
            await otp_service_1.default.verifyOTP({
                identifier,
                code,
                type,
                userId: req.user?.userId,
            });
            res.json({
                success: true,
                message: 'OTP verified successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Resend OTP
     */
    async resendOTP(req, res, next) {
        try {
            const { identifier, type, metadata } = req.body;
            if (!identifier || !type) {
                throw new errors_1.ValidationError('Identifier and type are required');
            }
            const result = await otp_service_1.default.resendOTP({
                identifier,
                type,
                userId: req.user?.userId,
                metadata,
            });
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.OTPController = OTPController;
exports.default = new OTPController();
//# sourceMappingURL=otp.controller.js.map