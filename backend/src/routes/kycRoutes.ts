import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';
import { kycUpload } from '../middleware/upload';
import { KYCController, AdminKYCController } from '../controllers/kycController';

const router = Router();

router.use(authenticate);

// User endpoints
router.post('/submit', kycUpload.array('documents', 2), KYCController.submitKYC);
router.get('/status', KYCController.getKYCStatus);
router.post('/resubmit', kycUpload.array('documents', 2), KYCController.resubmitKYC);
router.get('/history', KYCController.getKYCSubmissionHistory);

// Admin endpoints
router.get('/admin/pending', adminOnly('ADMIN'), AdminKYCController.getPendingKYCs);
router.patch('/admin/:kycVerificationId/approve', adminOnly('ADMIN'), AdminKYCController.approveKYC);
router.patch('/admin/:kycVerificationId/reject', adminOnly('ADMIN'), AdminKYCController.rejectKYC);
router.delete('/admin/:kycVerificationId', adminOnly('ADMIN'), AdminKYCController.deleteKYC);

export default router;
