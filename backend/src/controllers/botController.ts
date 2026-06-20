import { Request, Response } from "express";
import { BotService } from "../services/botService";
import * as BotEngineService from "../services/botEngineService";

export class BotController {
  static async activateBotWithKey(req: Request, res: Response) {
    try {
      const { passkey, accountId } = req.body;
      const userId = (req as any).userId; 

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized!" });
      }

      if (!passkey) {
        return res.status(400).json({ error: "Passkey is required" });
      }

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized!" });
      }

      const activatedBot = await BotService.activateByPasskey(passkey, userId, accountId);
      res.status(200).json({ success: true, bot: activatedBot });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  static async getAllBots(req: Request, res: Response) {
    try {
      const bots = await BotService.getAllBots();
      res.json(bots);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async getActiveBot(req: any, res: Response) {
    try {
      const userId = req.userId;
      const bot = await BotService.getActiveBotByUserId(userId);
      res.json(bot);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async getBotById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
      const bot = await BotService.getBotById(Number(req.params.id));
      if (!bot) return res.status(404).json({ error: "Instance not found" });
      res.json(bot);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async getBotLogs(req: Request, res: Response) {
    try {
      const logs = await BotService.getBotLogs(Number(req.params.id));
      res.json(logs);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async createBot(req: Request, res: Response) {
    try {
      const bot = await BotService.createBot(req.body);
      res.status(201).json(bot);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async startBot(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      // FIX: Changed "running" to "RUNNING" to match ProBotStatus enum
      const bot = await BotService.updateBotStatus(id, "RUNNING");
      await BotEngineService.activateProBot(id);
      res.json(bot);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async stopBot(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      // FIX: Changed "stopped" to "STOPPED" to match ProBotStatus enum
      const bot = await BotService.updateBotStatus(id, "STOPPED");
      await BotEngineService.stopProBot(id);
      res.json(bot);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async deleteBot(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await BotEngineService.stopProBot(id);
      await BotService.deleteBot(id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async toggleStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { status } = req.body; // 'running' or 'stopped'
      
      // Call the existing startBot or stopBot services based on status
      if (status === "running") {
        await BotController.startBot(req, res);
      } else {
        await BotController.stopBot(req, res);
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async getBotStats(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      // You likely have this data in your bot object already, 
      // or you can pull it from your database via BotService
      const stats = await BotService.getBotStats(id); 
      res.json(stats);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async updateBotSettings(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const settings = req.body.settings; // Ensure the frontend sends { settings: { ... } }

      if (!settings) {
        return res.status(400).json({ error: "Settings payload missing" });
      }

      const updatedBot = await BotService.updateBotSettings(id, settings);
      res.json({ success: true, bot: updatedBot });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
}