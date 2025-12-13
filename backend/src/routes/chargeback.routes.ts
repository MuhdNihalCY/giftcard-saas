import { Router } from 'express';
import chargebackController from '../controllers/chargeback.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Webhook endpoint (no auth, signature verification in controller)
router.post('/webhook', chargebackController.handleChargeback.bind(chargebackController));

// All other routes require authentication
router.use(authenticate);

// Get chargebacks
router.get('/', chargebackController.getChargebacks.bind(chargebackController));

// Get chargeback statistics
router.get('/statistics', chargebackController.getChargebackStatistics.bind(chargebackController));

// Submit evidence (merchant or admin)
router.post('/:id/evidence', chargebackController.submitEvidence.bind(chargebackController));

// Update chargeback status (admin only)
router.put('/:id/status', authorize('ADMIN'), chargebackController.updateChargebackStatus.bind(chargebackController));

export default router;













