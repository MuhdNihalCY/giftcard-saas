import { Request, Response, NextFunction } from 'express';
export declare class CommunicationLogController {
    /**
     * Get communication logs (Admin only)
     */
    getLogs(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get communication statistics (Admin only)
     */
    getStatistics(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get channel-specific statistics (Admin only)
     */
    getChannelStatistics(req: Request, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: CommunicationLogController;
export default _default;
//# sourceMappingURL=communicationLog.controller.d.ts.map