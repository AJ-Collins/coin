import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { generateDepositAddress, getDepositHistory } from '../controllers/depositController.js';

const router = Router();

router.use(authenticate);
router.post('/address', generateDepositAddress);
router.get('/history', getDepositHistory);

export default router;