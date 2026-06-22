import { Router } from "express";
import { BotController } from "../controllers/botController.js";
import { authenticate } from '../middleware/auth.js';
import { botActionLimiter } from "../middleware/adminOnly.js";

const router = Router();
router.use(authenticate);
router.use(botActionLimiter);

// 1. STATIC ROUTES FIRST
router.get("/active", BotController.getActiveBot); 
router.post("/activate", BotController.activateBotWithKey);
router.get("/", BotController.getAllBots);
router.post("/", BotController.createBot);

// 2. DYNAMIC ROUTES LAST
router.get("/:id", BotController.getBotById);
router.delete("/:id", BotController.deleteBot);
router.get("/:id/logs", BotController.getBotLogs);
router.patch("/:id/start", BotController.startBot);
router.patch("/:id/stop", BotController.stopBot);
router.post("/:id/toggle/status", BotController.toggleStatus);
router.get("/:id/stats", BotController.getBotStats);
router.patch("/:id/settings", BotController.updateBotSettings);

export { router as botRoutes };