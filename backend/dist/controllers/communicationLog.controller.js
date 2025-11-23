"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationLogController = void 0;
const communicationLog_service_1 = __importDefault(require("../services/communicationLog.service"));
const errors_1 = require("../utils/errors");
class CommunicationLogController {
    /**
     * Get communication logs (Admin only)
     */
    async getLogs(req, res, next) {
        try {
            // Check if user is admin
            if (req.user?.role !== 'ADMIN') {
                throw new errors_1.UnauthorizedError('Only administrators can view communication logs');
            }
            const { channel, status, recipient, userId, startDate, endDate, page, limit, } = req.query;
            const result = await communicationLog_service_1.default.getLogs({
                channel: channel,
                status: status,
                recipient: recipient,
                userId: userId,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
            });
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get communication statistics (Admin only)
     */
    async getStatistics(req, res, next) {
        try {
            // Check if user is admin
            if (req.user?.role !== 'ADMIN') {
                throw new errors_1.UnauthorizedError('Only administrators can view communication statistics');
            }
            const { channel, startDate, endDate } = req.query;
            const stats = await communicationLog_service_1.default.getStatistics({
                channel: channel,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            });
            res.json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get channel-specific statistics (Admin only)
     */
    async getChannelStatistics(req, res, next) {
        try {
            // Check if user is admin
            if (req.user?.role !== 'ADMIN') {
                throw new errors_1.UnauthorizedError('Only administrators can view communication statistics');
            }
            const { startDate, endDate } = req.query;
            const stats = await communicationLog_service_1.default.getChannelStatistics(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
            res.json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CommunicationLogController = CommunicationLogController;
exports.default = new CommunicationLogController();
//# sourceMappingURL=communicationLog.controller.js.map