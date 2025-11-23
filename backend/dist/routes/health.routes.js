"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const router = (0, express_1.Router)();
/**
 * Health check endpoint
 * GET /health
 */
router.get('/health', async (req, res) => {
    try {
        // Check database connection
        await database_1.default.$queryRaw `SELECT 1`;
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
        });
    }
    catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Database connection failed',
        });
    }
});
/**
 * Readiness check endpoint
 * GET /ready
 */
router.get('/ready', async (req, res) => {
    try {
        // Check database connection
        await database_1.default.$queryRaw `SELECT 1`;
        res.status(200).json({
            status: 'ready',
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(503).json({
            status: 'not ready',
            timestamp: new Date().toISOString(),
            error: 'Database connection failed',
        });
    }
});
exports.default = router;
//# sourceMappingURL=health.routes.js.map