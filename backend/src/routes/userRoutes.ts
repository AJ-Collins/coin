import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';



const router = Router();
router.use(authenticate);

router.get('/account/balance', UserController.getAccountBalance);
router.post("/password", UserController.updatePassword);
router.get("/withdraw/history", UserController.getWithdrawalHistory);
router.post("/withdraw", UserController.requestWithdrawal);

export default router;