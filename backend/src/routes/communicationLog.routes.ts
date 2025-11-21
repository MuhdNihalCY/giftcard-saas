import { Router } from 'express';
import communicationLogController from '../controllers/communicationLog.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/logs', communicationLogController.getLogs.bind(communicationLogController));
router.get('/statistics', communicationLogController.getStatistics.bind(communicationLogController));
router.get('/statistics/channels', communicationLogController.getChannelStatistics.bind(communicationLogController));

export default router;

