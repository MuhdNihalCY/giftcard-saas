import { Request, Response, NextFunction } from 'express';
import passwordResetService from '../services/passwordReset.service';

export class PasswordResetController {
  async requestPasswordReset(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await passwordResetService.requestPasswordReset(email);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      const result = await passwordResetService.resetPassword(token, password);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PasswordResetController();

