import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class PaymentController {
    createPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    confirmPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
    listPayments(req: Request, res: Response, next: NextFunction): Promise<void>;
    refundPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: PaymentController;
export default _default;
//# sourceMappingURL=payment.controller.d.ts.map