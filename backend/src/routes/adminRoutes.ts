import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { adminOnly, adminLimiter } from '../middleware/adminOnly';

const router = Router();

router.use(authenticate);
router.use(adminOnly("ADMIN"));

router.post("/passkeys", AdminController.generatePasskey);
router.get("/passkeys", AdminController.listPasskeys);
router.get("/bot/config", AdminController.getConfig);
router.put("/bot/config", AdminController.updateConfig);
router.delete("/passkeys/:id", AdminController.deletePasskey);

export default router;