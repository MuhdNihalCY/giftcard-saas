import { Router } from 'express';
import blacklistController from '../controllers/blacklist.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Check blacklist (public endpoint for internal use)
router.get('/check', blacklistController.checkBlacklist.bind(blacklistController));

// Admin-only routes
router.use(authorize('ADMIN'));

router.get('/', blacklistController.getBlacklistEntries.bind(blacklistController));
router.post('/', blacklistController.addToBlacklist.bind(blacklistController));
router.put('/:id', blacklistController.updateBlacklistEntry.bind(blacklistController));
router.delete('/:id', blacklistController.removeFromBlacklist.bind(blacklistController));

export default router;








