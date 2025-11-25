import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validator';
import { authRateLimiter } from '../middleware/rateLimit.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { auditAuth } from '../middleware/audit.middleware';

const router = Router();

// Apply rate limiting to auth routes
router.use(authRateLimiter);

// Public routes
router.post('/register', validate(registerSchema), authController.register.bind(authController));
router.post('/login', validate(loginSchema), auditAuth('LOGIN_FAILED'), authController.login.bind(authController));
router.post('/refresh', validate(refreshTokenSchema), auditAuth('TOKEN_REFRESH'), authController.refreshToken.bind(authController));

// Protected routes
router.get('/profile', authenticate, authController.getProfile.bind(authController));

export default router;

