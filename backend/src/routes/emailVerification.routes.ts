import { Router } from 'express';
import emailVerificationController from '../controllers/emailVerification.controller';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Public routes
router.post('/verify', validate(verifyEmailSchema), emailVerificationController.verifyEmail.bind(emailVerificationController));
router.post('/resend', validate(resendVerificationSchema), emailVerificationController.resendVerificationEmail.bind(emailVerificationController));

export default router;


