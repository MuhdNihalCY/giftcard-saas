import { Request, Response, NextFunction } from 'express';
export declare class EmailVerificationController {
    verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
    resendVerificationEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: EmailVerificationController;
export default _default;
//# sourceMappingURL=emailVerification.controller.d.ts.map