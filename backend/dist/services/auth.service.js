"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const database_1 = __importDefault(require("../config/database"));
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
class AuthService {
    async register(data) {
        const { email, password, firstName, lastName, businessName, role } = data;
        // Check if user already exists
        const existingUser = await database_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new errors_1.ValidationError('User with this email already exists');
        }
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        // Create user
        const user = await database_1.default.user.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName,
                businessName,
                role: role || 'CUSTOMER',
                isEmailVerified: false, // Require email verification
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                businessName: true,
                isEmailVerified: true,
                createdAt: true,
            },
        });
        // Send verification email (don't await to avoid blocking registration)
        import emailVerificationService from './emailVerification.service';
        emailVerification_service_1.default.sendVerificationEmail(user.id, user.email).catch((error) => {
            logger_1.default.error('Failed to send verification email during registration', { userId: user.id, error });
        });
        // Generate tokens
        const tokens = this.generateTokens({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        return {
            user,
            ...tokens,
            message: 'Registration successful. Please check your email to verify your account.',
        };
    }
    async login(data) {
        const { email, password } = data;
        // Find user
        const user = await database_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new errors_1.UnauthorizedError('Invalid email or password');
        }
        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
            throw new errors_1.UnauthorizedError(`Account is locked. Please try again in ${minutesLeft} minute(s).`);
        }
        // Check if user is active
        if (!user.isActive) {
            throw new errors_1.UnauthorizedError('Account is deactivated');
        }
        // Verify password
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            // Increment failed login attempts
            const failedAttempts = (user.failedLoginAttempts || 0) + 1;
            const maxAttempts = 5;
            const lockoutDuration = 30; // 30 minutes
            if (failedAttempts >= maxAttempts) {
                // Lock account
                const lockedUntil = new Date();
                lockedUntil.setMinutes(lockedUntil.getMinutes() + lockoutDuration);
                await database_1.default.user.update({
                    where: { id: user.id },
                    data: {
                        failedLoginAttempts: failedAttempts,
                        lockedUntil,
                    },
                });
                logger_1.default.warn('Account locked due to failed login attempts', { userId: user.id, email });
                throw new errors_1.UnauthorizedError(`Account locked due to ${maxAttempts} failed login attempts. Please try again in ${lockoutDuration} minutes.`);
            }
            else {
                // Update failed attempts
                await database_1.default.user.update({
                    where: { id: user.id },
                    data: { failedLoginAttempts: failedAttempts },
                });
                logger_1.default.warn('Failed login attempt', { userId: user.id, email, attempts: failedAttempts });
                throw new errors_1.UnauthorizedError(`Invalid email or password. ${maxAttempts - failedAttempts} attempt(s) remaining.`);
            }
        }
        // Reset failed login attempts on successful login
        if (user.failedLoginAttempts > 0 || user.lockedUntil) {
            await database_1.default.user.update({
                where: { id: user.id },
                data: {
                    failedLoginAttempts: 0,
                    lockedUntil: null,
                },
            });
        }
        // Generate tokens
        const tokens = this.generateTokens({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        logger_1.default.info('User logged in successfully', { userId: user.id, email });
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                businessName: user.businessName,
                isEmailVerified: user.isEmailVerified,
            },
            ...tokens,
        };
    }
    generateTokens(payload) {
        const accessToken = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
            expiresIn: env_1.env.JWT_EXPIRES_IN,
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_REFRESH_SECRET, {
            expiresIn: env_1.env.JWT_REFRESH_EXPIRES_IN,
        });
        return {
            accessToken,
            refreshToken,
        };
    }
    verifyToken(token, isRefresh = false) {
        try {
            const secret = isRefresh ? env_1.env.JWT_REFRESH_SECRET : env_1.env.JWT_SECRET;
            const payload = jsonwebtoken_1.default.verify(token, secret);
            return payload;
        }
        catch (error) {
            throw new errors_1.UnauthorizedError('Invalid or expired token');
        }
    }
    async refreshToken(refreshToken) {
        const payload = this.verifyToken(refreshToken, true);
        // Verify user still exists and is active
        const user = await database_1.default.user.findUnique({
            where: { id: payload.userId },
        });
        if (!user || !user.isActive) {
            throw new errors_1.UnauthorizedError('User not found or inactive');
        }
        // Generate new tokens
        return this.generateTokens({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
    }
}
exports.AuthService = AuthService;
exports.default = new AuthService();
//# sourceMappingURL=auth.service.js.map