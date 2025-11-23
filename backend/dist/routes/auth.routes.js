"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_validator_1 = require("../validators/auth.validator");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Apply rate limiting to auth routes
router.use(rateLimit_middleware_1.authRateLimiter);
// Public routes
router.post('/register', (0, validation_middleware_1.validate)(auth_validator_1.registerSchema), auth_controller_1.default.register.bind(auth_controller_1.default));
router.post('/login', (0, validation_middleware_1.validate)(auth_validator_1.loginSchema), auth_controller_1.default.login.bind(auth_controller_1.default));
router.post('/refresh', (0, validation_middleware_1.validate)(auth_validator_1.refreshTokenSchema), auth_controller_1.default.refreshToken.bind(auth_controller_1.default));
// Protected routes
router.get('/profile', auth_middleware_1.authenticate, auth_controller_1.default.getProfile.bind(auth_controller_1.default));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map