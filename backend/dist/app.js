"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const env_1 = require("./config/env");
const error_middleware_1 = require("./middleware/error.middleware");
const logger_middleware_1 = require("./middleware/logger.middleware");
const logger_1 = __importDefault(require("./utils/logger"));
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: env_1.env.CORS_ORIGIN,
    credentials: true,
}));
// Compression middleware
app.use((0, compression_1.default)());
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Request logging
app.use(logger_middleware_1.requestLogger);
// Rate limiting
const rateLimit_middleware_1 = require("./middleware/rateLimit.middleware");
app.use(`/api/${env_1.env.API_VERSION}`, rateLimit_middleware_1.apiRateLimiter);
// Health check routes (before rate limiting)
const health_routes_1 = __importDefault(require("./routes/health.routes"));
app.use('/', health_routes_1.default);
// API routes
app.get(`/api/${env_1.env.API_VERSION}`, (req, res) => {
    res.json({
        success: true,
        message: 'Gift Card SaaS API',
        version: env_1.env.API_VERSION,
    });
});
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const giftcard_routes_1 = __importDefault(require("./routes/giftcard.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const delivery_routes_1 = __importDefault(require("./routes/delivery.routes"));
const redemption_routes_1 = __importDefault(require("./routes/redemption.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const emailVerification_routes_1 = __importDefault(require("./routes/emailVerification.routes"));
const passwordReset_routes_1 = __importDefault(require("./routes/passwordReset.routes"));
const communicationSettings_routes_1 = __importDefault(require("./routes/communicationSettings.routes"));
const otp_routes_1 = __importDefault(require("./routes/otp.routes"));
const communicationLog_routes_1 = __importDefault(require("./routes/communicationLog.routes"));
app.use(`/api/${env_1.env.API_VERSION}/auth`, auth_routes_1.default);
app.use(`/api/${env_1.env.API_VERSION}/gift-cards`, giftcard_routes_1.default);
app.use(`/api/${env_1.env.API_VERSION}/upload`, upload_routes_1.default);
app.use(`/api/${env_1.env.API_VERSION}/payments`, payment_routes_1.default);
app.use(`/api/${env_1.env.API_VERSION}/delivery`, delivery_routes_1.default);
app.use(`/api/${env_1.env.API_VERSION}/redemptions`, redemption_routes_1.default);
app.use(`/api/${env_1.env.API_VERSION}/analytics`, analytics_routes_1.default);
app.use(`/api/${env_1.env.API_VERSION}/email-verification`, emailVerification_routes_1.default);
app.use(`/api/${env_1.env.API_VERSION}/password-reset`, passwordReset_routes_1.default);
app.use(`/api/${env_1.env.API_VERSION}/admin/communication-settings`, communicationSettings_routes_1.default);
app.use(`/api/${env_1.env.API_VERSION}/otp`, otp_routes_1.default);
app.use(`/api/${env_1.env.API_VERSION}/admin/communication-logs`, communicationLog_routes_1.default);
// Serve uploaded files
app.use('/uploads', express_1.default.static('uploads'));
app.use('/uploads/pdfs', express_1.default.static('uploads/pdfs'));
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'Route not found',
        },
    });
});
// Error handling middleware (must be last)
app.use(error_middleware_1.errorHandler);
const PORT = env_1.env.PORT;
// Start workers and schedulers (only in production or when explicitly enabled)
if (env_1.env.NODE_ENV === 'production' || process.env.ENABLE_WORKERS === 'true') {
    Promise.resolve().then(() => __importStar(require('./workers'))).then(({ closeWorkers }) => {
        Promise.resolve().then(() => __importStar(require('./services/scheduler.service'))).then(({ default: scheduler }) => {
            scheduler.start();
            logger_1.default.info('Background workers and schedulers started');
        });
        // Graceful shutdown
        process.on('SIGTERM', async () => {
            logger_1.default.info('SIGTERM received, closing workers...');
            await closeWorkers();
            process.exit(0);
        });
    });
}
app.listen(PORT, () => {
    logger_1.default.info(`Server is running on port ${PORT}`);
    logger_1.default.info(`Environment: ${env_1.env.NODE_ENV}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map