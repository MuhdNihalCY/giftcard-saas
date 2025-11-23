"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthenticate = exports.authorize = exports.authenticate = void 0;
const auth_service_1 = __importDefault(require("../services/auth.service"));
const errors_1 = require("../utils/errors");
const database_1 = __importDefault(require("../config/database"));
/**
 * Middleware to authenticate requests using JWT
 * Verifies the access token and attaches user info to request
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errors_1.UnauthorizedError('No token provided');
        }
        const token = authHeader.substring(7);
        // Verify token
        const payload = auth_service_1.default.verifyToken(token);
        // Verify user still exists and is active
        const user = await database_1.default.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
            },
        });
        if (!user) {
            throw new errors_1.UnauthorizedError('User not found');
        }
        if (!user.isActive) {
            throw new errors_1.UnauthorizedError('Account is deactivated');
        }
        // Attach user info to request
        req.user = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authenticate = authenticate;
/**
 * Middleware to authorize based on user roles
 * Must be used after authenticate middleware
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errors_1.UnauthorizedError('Authentication required'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new errors_1.UnauthorizedError('Insufficient permissions'));
        }
        next();
    };
};
exports.authorize = authorize;
/**
 * Optional authentication - doesn't fail if no token
 * Useful for routes that work for both authenticated and unauthenticated users
 */
const optionalAuthenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const payload = auth_service_1.default.verifyToken(token);
            const user = await database_1.default.user.findUnique({
                where: { id: payload.userId },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    isActive: true,
                },
            });
            if (user && user.isActive) {
                req.user = {
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                };
            }
        }
    }
    catch (error) {
        // Silently fail for optional auth
    }
    next();
};
exports.optionalAuthenticate = optionalAuthenticate;
//# sourceMappingURL=auth.middleware.js.map