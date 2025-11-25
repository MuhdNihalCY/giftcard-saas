/**
 * Audit Log Routes
 */

import { Router } from 'express';
import auditLogController from '../controllers/audit-log.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication and admin role
router.get('/', authenticate, authorize('ADMIN'), auditLogController.list.bind(auditLogController));
router.get('/statistics', authenticate, authorize('ADMIN'), auditLogController.getStatistics.bind(auditLogController));
router.get('/export', authenticate, authorize('ADMIN'), auditLogController.export.bind(auditLogController));
router.get('/:id', authenticate, authorize('ADMIN'), auditLogController.getById.bind(auditLogController));

export default router;

