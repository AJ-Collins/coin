import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { loginLimiter, authLimiter } from '../middleware/adminOnly';
import { getAccountBalance } from '../controllers/userController';
import { authenticate } from '../middleware/auth';



const router = Router();
router.use(authenticate);

router.get('/account/balance', getAccountBalance);

export default router;