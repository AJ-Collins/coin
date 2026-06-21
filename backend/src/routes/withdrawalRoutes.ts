import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getWithdrawalHistory, requestWithdrawal } from '../controllers/withrawController';
import { KYCController } from '../controllers/kycController';

const router = Router();

router.use(authenticate);

router.post('/request', requestWithdrawal);
router.get('/history', getWithdrawalHistory);
router.get('/kyc/history', KYCController.getKYCSubmissionHistory);

export default router;