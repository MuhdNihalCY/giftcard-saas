"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = __importDefault(require("../services/auth.service"));
const errors_1 = require("../utils/errors");
const database_1 = __importDefault(require("../config/database"));
class AuthController {
    async register(req, res, next) {
        try {
            const result = await auth_service_1.default.register(req.body);
            res.status(201).json({
                success: true,
                data: result,
                message: 'User registered successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const result = await auth_service_1.default.login(req.body);
            res.json({
                success: true,
                data: result,
                message: 'Login successful',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                throw new errors_1.ValidationError('Refresh token is required');
            }
            const tokens = await auth_service_1.default.refreshToken(refreshToken);
            // Also return user info for convenience
            const payload = auth_service_1.default.verifyToken(tokens.accessToken, false);
            const user = await database_1.default.user.findUnique({
                where: { id: payload.userId },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    businessName: true,
                    isEmailVerified: true,
                },
            });
            res.json({
                success: true,
                data: {
                    ...tokens,
                    user: user || null,
                },
                message: 'Token refreshed successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getProfile(req, res, next) {
        try {
            const authReq = req;
            const userId = authReq.user?.userId;
            if (!userId) {
                throw new errors_1.UnauthorizedError('Authentication required');
            }
            const user = await database_1.default.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    businessName: true,
                    isEmailVerified: true,
                    isActive: true,
                    createdAt: true,
                },
            });
            if (!user) {
                throw new errors_1.UnauthorizedError('User not found');
            }
            res.json({
                success: true,
                data: user,
                message: 'Profile retrieved successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.default = new AuthController();
//# sourceMappingURL=auth.controller.js.map