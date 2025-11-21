import { Router } from 'express';
import communicationSettingsController from '../controllers/communicationSettings.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

const updateSettingsSchema = z.object({
  emailEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  otpEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  emailRateLimit: z.number().int().min(1).optional(),
  smsRateLimit: z.number().int().min(1).optional(),
  otpRateLimit: z.number().int().min(1).optional(),
  otpExpiryMinutes: z.number().int().min(1).max(60).optional(),
  otpLength: z.number().int().min(4).max(8).optional(),
});

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', communicationSettingsController.getSettings.bind(communicationSettingsController));
router.put('/', validate(updateSettingsSchema), communicationSettingsController.updateSettings.bind(communicationSettingsController));

export default router;

