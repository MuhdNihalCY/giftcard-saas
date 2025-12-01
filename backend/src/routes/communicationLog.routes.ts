import { Router } from 'express';
import communicationLogController from '../controllers/communicationLog.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Logs endpoint allows both ADMIN and MERCHANT (merchants see only their own)
// IMPORTANT: This route must be defined BEFORE the router.use(authorize('ADMIN')) below
router.get('/logs', authorize('ADMIN', 'MERCHANT'), communicationLogController.getLogs.bind(communicationLogController));

// Statistics endpoints are admin-only
router.use(authorize('ADMIN'));
router.get('/statistics', communicationLogController.getStatistics.bind(communicationLogController));
router.get('/statistics/channels', communicationLogController.getChannelStatistics.bind(communicationLogController));

export default router;

