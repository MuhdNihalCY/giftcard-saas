import { Router } from 'express';
import analyticsController from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);
router.use(authorize('ADMIN', 'MERCHANT'));

router.get(
  '/sales',
  analyticsController.getSalesAnalytics.bind(analyticsController)
);

router.get(
  '/redemptions',
  analyticsController.getRedemptionAnalytics.bind(analyticsController)
);

router.get(
  '/customers',
  analyticsController.getCustomerAnalytics.bind(analyticsController)
);

router.get(
  '/gift-cards',
  analyticsController.getGiftCardStats.bind(analyticsController)
);

router.get(
  '/breakage',
  analyticsController.getBreakageAnalytics.bind(analyticsController)
);

export default router;

