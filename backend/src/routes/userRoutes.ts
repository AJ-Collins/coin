import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { loginLimiter, authLimiter } from '../middleware/adminOnly';

const router = Router();

export default router;