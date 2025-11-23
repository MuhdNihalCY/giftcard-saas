import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class RedemptionController {
    validateGiftCard(req: Request, res: Response, next: NextFunction): Promise<void>;
    redeemGiftCard(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getRedemption(req: Request, res: Response, next: NextFunction): Promise<void>;
    listRedemptions(req: Request, res: Response, next: NextFunction): Promise<void>;
    getGiftCardHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
    checkBalance(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTransactionHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Redeem via QR code (from QR code data)
     */
    redeemViaQR(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Redeem via link (public endpoint)
     */
    redeemViaLink(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
declare const _default: RedemptionController;
export default _default;
//# sourceMappingURL=redemption.controller.d.ts.map