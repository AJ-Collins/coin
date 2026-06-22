import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { loginLimiter, authLimiter } from '../middleware/adminOnly.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', authLimiter, AuthController.register);
router.post('/login', loginLimiter, AuthController.login);
router.post('/forgot-password', authLimiter, AuthController.forgotPassword);
router.post('/reset-password', authLimiter, AuthController.resetPassword);
router.get('/me', authenticate, AuthController.getMe);

export default router;