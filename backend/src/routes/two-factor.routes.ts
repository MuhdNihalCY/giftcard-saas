/**
 * Two-Factor Authentication Routes
 */

import { Router } from 'express';
import twoFactorController from '../controllers/two-factor.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  enable2FASchema,
  verify2FASchema,
  verify2FABackupSchema,
  disable2FASchema,
  regenerateBackupCodesSchema,
} from '../validators/two-factor.validator';

const router = Router();

// All routes require authentication except verify endpoints
router.get('/setup', authenticate, twoFactorController.setup.bind(twoFactorController));
router.post('/enable', authenticate, validate(enable2FASchema), twoFactorController.enable.bind(twoFactorController));
router.post('/verify', validate(verify2FASchema), twoFactorController.verify.bind(twoFactorController));
router.post('/verify-backup', validate(verify2FABackupSchema), twoFactorController.verifyBackup.bind(twoFactorController));
router.post('/disable', authenticate, validate(disable2FASchema), twoFactorController.disable.bind(twoFactorController));
router.get('/backup-codes', authenticate, twoFactorController.getBackupCodes.bind(twoFactorController));
router.post('/backup-codes/regenerate', authenticate, validate(regenerateBackupCodesSchema), twoFactorController.regenerateBackupCodes.bind(twoFactorController));
router.get('/status', authenticate, twoFactorController.getStatus.bind(twoFactorController));

export default router;

