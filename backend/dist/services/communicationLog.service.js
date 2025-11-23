"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationLogService = void 0;
const database_1 = __importDefault(require("../config/database"));
const logger_1 = __importDefault(require("../utils/logger"));
class CommunicationLogService {
    /**
     * Log a communication attempt
     */
    async log(options) {
        try {
            await database_1.default.communicationLog.create({
                data: {
                    channel: options.channel,
                    recipient: options.recipient,
                    subject: options.subject,
                    message: options.message,
                    status: options.status,
                    errorMessage: options.errorMessage,
                    userId: options.userId,
                    metadata: options.metadata || {},
                },
            });
        }
        catch (error) {
            // Don't throw error if logging fails, just log it
            logger_1.default.error('Failed to log communication', { error: error.message, options });
        }
    }
    /**
     * Get communication logs with filters
     */
    async getLogs(filters) {
        const { channel, status, recipient, userId, startDate, endDate, page = 1, limit = 50, } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (channel)
            where.channel = channel;
        if (status)
            where.status = status;
        if (recipient)
            where.recipient = { contains: recipient, mode: 'insensitive' };
        if (userId)
            where.userId = userId;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        const [logs, total] = await Promise.all([
            database_1.default.communicationLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            database_1.default.communicationLog.count({ where }),
        ]);
        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Get communication statistics
     */
    async getStatistics(filters) {
        const { channel, startDate, endDate } = filters;
        const where = {};
        if (channel)
            where.channel = channel;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        const [total, sent, failed, blocked] = await Promise.all([
            database_1.default.communicationLog.count({ where }),
            database_1.default.communicationLog.count({ where: { ...where, status: 'SENT' } }),
            database_1.default.communicationLog.count({ where: { ...where, status: 'FAILED' } }),
            database_1.default.communicationLog.count({ where: { ...where, status: 'BLOCKED' } }),
        ]);
        return {
            total,
            sent,
            failed,
            blocked,
            successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : '0.00',
        };
    }
    /**
     * Get channel-specific statistics
     */
    async getChannelStatistics(startDate, endDate) {
        const where = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        const channels = ['EMAIL', 'SMS', 'OTP', 'PUSH'];
        const stats = await Promise.all(channels.map(async (channel) => {
            const channelWhere = { ...where, channel };
            const [total, sent, failed] = await Promise.all([
                database_1.default.communicationLog.count({ where: channelWhere }),
                database_1.default.communicationLog.count({ where: { ...channelWhere, status: 'SENT' } }),
                database_1.default.communicationLog.count({ where: { ...channelWhere, status: 'FAILED' } }),
            ]);
            return {
                channel,
                total,
                sent,
                failed,
                successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : '0.00',
            };
        }));
        return stats;
    }
}
exports.CommunicationLogService = CommunicationLogService;
exports.default = new CommunicationLogService();
//# sourceMappingURL=communicationLog.service.js.map