import { Router } from 'express';
import passwordResetController from '../controllers/passwordReset.controller';
import { validate } from '../middleware/validation.middleware';
import { requestPasswordResetSchema, resetPasswordSchema } from '../validators/password.validator';

const router = Router();

// Public routes
router.post('/request', validate(requestPasswordResetSchema), passwordResetController.requestPasswordReset.bind(passwordResetController));
router.post('/reset', validate(resetPasswordSchema), passwordResetController.resetPassword.bind(passwordResetController));

export default router;


