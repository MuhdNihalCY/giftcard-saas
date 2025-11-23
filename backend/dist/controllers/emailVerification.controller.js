"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailVerificationController = void 0;
const emailVerification_service_1 = __importDefault(require("../services/emailVerification.service"));
class EmailVerificationController {
    async verifyEmail(req, res, next) {
        try {
            const { token } = req.body;
            const result = await emailVerification_service_1.default.verifyEmail(token);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async resendVerificationEmail(req, res, next) {
        try {
            const { email } = req.body;
            const result = await emailVerification_service_1.default.resendVerificationEmail(email);
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
exports.EmailVerificationController = EmailVerificationController;
exports.default = new EmailVerificationController();
//# sourceMappingURL=emailVerification.controller.js.map