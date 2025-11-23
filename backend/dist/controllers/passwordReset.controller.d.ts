import { Request, Response, NextFunction } from 'express';
export declare class PasswordResetController {
    requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void>;
    resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: PasswordResetController;
export default _default;
//# sourceMappingURL=passwordReset.controller.d.ts.map