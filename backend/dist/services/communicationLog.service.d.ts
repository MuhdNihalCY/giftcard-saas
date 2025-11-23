export type CommunicationChannel = 'EMAIL' | 'SMS' | 'OTP' | 'PUSH';
export type CommunicationStatus = 'SENT' | 'FAILED' | 'PENDING' | 'BLOCKED';
export interface LogCommunicationOptions {
    channel: CommunicationChannel;
    recipient: string;
    subject?: string;
    message?: string;
    status: CommunicationStatus;
    errorMessage?: string;
    userId?: string;
    metadata?: Record<string, any>;
}
export declare class CommunicationLogService {
    /**
     * Log a communication attempt
     */
    log(options: LogCommunicationOptions): Promise<void>;
    /**
     * Get communication logs with filters
     */
    getLogs(filters: {
        channel?: CommunicationChannel;
        status?: CommunicationStatus;
        recipient?: string;
        userId?: string;
        startDate?: Date;
        endDate?: Date;
        page?: number;
        limit?: number;
    }): Promise<{
        logs: {
            message: string | null;
            id: string;
            createdAt: Date;
            subject: string | null;
            status: string;
            userId: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            channel: string;
            recipient: string;
            errorMessage: string | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    /**
     * Get communication statistics
     */
    getStatistics(filters: {
        channel?: CommunicationChannel;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        total: number;
        sent: number;
        failed: number;
        blocked: number;
        successRate: string;
    }>;
    /**
     * Get channel-specific statistics
     */
    getChannelStatistics(startDate?: Date, endDate?: Date): Promise<{
        channel: CommunicationChannel;
        total: number;
        sent: number;
        failed: number;
        successRate: string;
    }[]>;
}
declare const _default: CommunicationLogService;
export default _default;
//# sourceMappingURL=communicationLog.service.d.ts.map