import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { adminOnly, depositCreditLimiter } from '../middleware/adminOnly';

const router = Router();

router.use(authenticate);
router.use(adminOnly("ADMIN"));

router.post("/passkeys", AdminController.generatePasskey);
router.get("/passkeys", AdminController.listPasskeys);
router.get("/bot/config", AdminController.getConfig);
router.put("/bot/config", AdminController.updateConfig);
router.delete("/passkeys/:id", AdminController.deletePasskey);

router.get("/stats", AdminController.getDashboardStats);
router.get("/activity", AdminController.getRecentActivity);

router.get("/users", AdminController.getUsers);
router.post("/users", AdminController.createUser);
router.patch("/users/:id", AdminController.updateUser);
router.patch("/users/:id/toggle-status", AdminController.toggleUserStatus);
router.delete("/users/:id", AdminController.deleteUser);

router.get("/marketers", AdminController.getMarketers);
router.get("/marketers/stats", AdminController.getMarketerStats);
router.patch("/marketers/:id/rate", AdminController.updateMarketerRate);

router.get("/trades", AdminController.getTrades);
router.get("/trades/stats", AdminController.getTradeStats);

router.get("/deposits", AdminController.getDeposits);
router.get("/deposits/stats", AdminController.getDepositStats);
router.post("/deposits/:id/retry", AdminController.retryDeposit);

router.get("/withdrawals", AdminController.getWithdrawals);
router.get("/withdrawals/stats", AdminController.getWithdrawalStats);
router.patch("/withdrawals/:id/status", AdminController.updateWithdrawalStatus);

router.get("/profile", AdminController.getProfile);
router.patch("/profile", AdminController.updateProfile);
router.patch("/profile/password", AdminController.updatePassword);

router.post("/deposits/credit", depositCreditLimiter, AdminController.manualCreditDeposit);

export default router;