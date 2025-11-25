import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import otpService from '../services/otp.service';
import { ValidationError } from '../utils/errors';

export class OTPController {
  /**
   * Generate and send OTP
   */
  async generateOTP(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { identifier, type, metadata } = req.body;

      if (!identifier || !type) {
        throw new ValidationError('Identifier and type are required');
      }

      const result = await otpService.generateAndSendOTP({
        identifier,
        type,
        userId: req.user?.userId,
        metadata,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { identifier, code, type } = req.body;

      if (!identifier || !code || !type) {
        throw new ValidationError('Identifier, code, and type are required');
      }

      await otpService.verifyOTP({
        identifier,
        code,
        type,
        userId: req.user?.userId,
      });

      res.json({
        success: true,
        message: 'OTP verified successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resend OTP
   */
  async resendOTP(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { identifier, type, metadata } = req.body;

      if (!identifier || !type) {
        throw new ValidationError('Identifier and type are required');
      }

      const result = await otpService.resendOTP({
        identifier,
        type,
        userId: req.user?.userId,
        metadata,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new OTPController();

