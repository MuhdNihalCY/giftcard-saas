"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearRequestId = exports.getRequestId = exports.setRequestId = void 0;
const winston_1 = __importDefault(require("winston"));
const crypto_1 = require("crypto");
// Create request ID for tracking
let requestId = null;
const setRequestId = (id) => {
    requestId = id || (0, crypto_1.randomUUID)();
};
exports.setRequestId = setRequestId;
const getRequestId = () => requestId;
exports.getRequestId = getRequestId;
const clearRequestId = () => {
    requestId = null;
};
exports.clearRequestId = clearRequestId;
const logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format((info) => {
        // Add request ID to all log entries
        if (requestId) {
            info.requestId = requestId;
        }
        return info;
    })(), winston_1.default.format.json()),
    defaultMeta: { service: 'giftcard-saas' },
    transports: [
        new winston_1.default.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        new winston_1.default.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
});
// Add console transport for all environments (useful for production monitoring)
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
    }));
}
else {
    // In production, use JSON format for console (better for log aggregation)
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    }));
}
exports.default = logger;
//# sourceMappingURL=logger.js.map