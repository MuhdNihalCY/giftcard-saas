import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class DeliveryController {
    deliverGiftCard(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    sendReminder(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    generatePDF(req: Request, res: Response, next: NextFunction): Promise<void>;
    downloadPDF(req: Request, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: DeliveryController;
export default _default;
//# sourceMappingURL=delivery.controller.d.ts.map