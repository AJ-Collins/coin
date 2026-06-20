import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getWithdrawalHistory} from '../controllers/withrawController';

const router = Router();

router.use(authenticate);
router.get('/history', getWithdrawalHistory);

export default router;