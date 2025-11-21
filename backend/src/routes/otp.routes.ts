import { Router } from 'express';
import otpController from '../controllers/otp.controller';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

const generateOTPSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  type: z.enum(['LOGIN', 'VERIFICATION', 'PASSWORD_RESET', 'TRANSACTION', '2FA']),
  metadata: z.record(z.any()).optional(),
});

const verifyOTPSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  code: z.string().min(4, 'OTP code is required'),
  type: z.enum(['LOGIN', 'VERIFICATION', 'PASSWORD_RESET', 'TRANSACTION', '2FA']),
});

// Public routes (some OTPs can be generated without auth, like password reset)
router.post('/generate', validate(generateOTPSchema), otpController.generateOTP.bind(otpController));
router.post('/verify', validate(verifyOTPSchema), otpController.verifyOTP.bind(otpController));
router.post('/resend', validate(generateOTPSchema), otpController.resendOTP.bind(otpController));

export default router;

