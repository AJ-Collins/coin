import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { loginLimiter, authLimiter } from '../middleware/adminOnly';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', authLimiter, AuthController.register);
router.post('/login', loginLimiter, AuthController.login);
router.post('/forgot-password', authLimiter, AuthController.forgotPassword);
router.post('/reset-password', authLimiter, AuthController.resetPassword);
router.get('/me', authenticate, AuthController.getMe);

export default router;