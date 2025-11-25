/**
 * Device Management Routes
 */

import { Router } from 'express';
import deviceController from '../controllers/device.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.get('/', authenticate, deviceController.listDevices.bind(deviceController));
router.delete('/:deviceId', authenticate, deviceController.revokeDevice.bind(deviceController));
router.delete('/', authenticate, deviceController.revokeAllDevices.bind(deviceController));

export default router;

