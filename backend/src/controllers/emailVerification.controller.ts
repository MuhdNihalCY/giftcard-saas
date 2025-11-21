import { Request, Response, NextFunction } from 'express';
import emailVerificationService from '../services/emailVerification.service';

export class EmailVerificationController {
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      const result = await emailVerificationService.verifyEmail(token);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async resendVerificationEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await emailVerificationService.resendVerificationEmail(email);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new EmailVerificationController();

