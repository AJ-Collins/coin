import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';



const router = Router();
router.use(authenticate);

router.get('/account/balance', UserController.getAccountBalance);
router.post("/password", UserController.updatePassword);

export default router;