import { Router } from 'express';
import breakageController from '../controllers/breakage.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get breakage metrics (merchant dashboard)
router.get('/metrics', breakageController.getBreakageMetrics.bind(breakageController));

// Get breakage report
router.get('/report', breakageController.getBreakageReport.bind(breakageController));

// Get expired cards report
router.get('/expired-cards', breakageController.getExpiredCardsReport.bind(breakageController));

export default router;













