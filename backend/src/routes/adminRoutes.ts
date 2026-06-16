import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { adminLimiter, adminOnly } from '../middleware/adminOnly';

const router = Router();
export default router;
