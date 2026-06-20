import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { generateDepositAddress, getDepositHistory } from '../controllers/depositController';

const router = Router();

router.use(authenticate);
router.post('/address', generateDepositAddress);
router.get('/history', getDepositHistory);

export default router;