"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetController = void 0;
const passwordReset_service_1 = __importDefault(require("../services/passwordReset.service"));
class PasswordResetController {
    async requestPasswordReset(req, res, next) {
        try {
            const { email } = req.body;
            const result = await passwordReset_service_1.default.requestPasswordReset(email);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async resetPassword(req, res, next) {
        try {
            const { token, password } = req.body;
            const result = await passwordReset_service_1.default.resetPassword(token, password);
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
exports.PasswordResetController = PasswordResetController;
exports.default = new PasswordResetController();
//# sourceMappingURL=passwordReset.controller.js.map