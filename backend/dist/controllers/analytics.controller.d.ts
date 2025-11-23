import { Request, Response, NextFunction } from 'express';
export declare class AnalyticsController {
    getSalesAnalytics(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRedemptionAnalytics(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCustomerAnalytics(req: Request, res: Response, next: NextFunction): Promise<void>;
    getGiftCardStats(req: Request, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: AnalyticsController;
export default _default;
//# sourceMappingURL=analytics.controller.d.ts.map