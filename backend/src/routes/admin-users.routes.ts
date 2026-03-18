import { Router } from 'express';
import adminUsersController from '../controllers/admin-users.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', adminUsersController.listUsers.bind(adminUsersController));
router.put('/:userId/toggle-active', adminUsersController.toggleActive.bind(adminUsersController));

export default router;
