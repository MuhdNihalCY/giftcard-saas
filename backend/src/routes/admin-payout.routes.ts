import { Router } from 'express';
import adminPayoutController from '../controllers/admin-payout.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN'));

// List all payouts
router.get(
  '/',
  adminPayoutController.listAllPayouts.bind(adminPayoutController)
);

// Get payout statistics
router.get(
  '/stats',
  adminPayoutController.getPayoutStats.bind(adminPayoutController)
);

// Process payout manually
router.post(
  '/:id/process',
  adminPayoutController.processPayout.bind(adminPayoutController)
);

// Retry failed payout
router.post(
  '/:id/retry',
  adminPayoutController.retryPayout.bind(adminPayoutController)
);

export default router;






