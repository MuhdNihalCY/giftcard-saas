"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler = (err, req, res, next) => {
    if (err instanceof errors_1.AppError) {
        logger_1.default.error(`AppError: ${err.message}`, {
            statusCode: err.statusCode,
            stack: err.stack,
            path: req.path,
            method: req.method,
        });
        return res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.constructor.name,
                message: err.message,
            },
        });
    }
    // Unknown error
    logger_1.default.error(`Unknown Error: ${err.message}`, {
        stack: err.stack,
        path: req.path,
        method: req.method,
    });
    return res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : err.message,
        },
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map