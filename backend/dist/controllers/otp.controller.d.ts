import { Request, Response, NextFunction } from 'express';
export declare class OTPController {
    /**
     * Generate and send OTP
     */
    generateOTP(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Verify OTP
     */
    verifyOTP(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Resend OTP
     */
    resendOTP(req: Request, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: OTPController;
export default _default;
//# sourceMappingURL=otp.controller.d.ts.map