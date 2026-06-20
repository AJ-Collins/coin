import { Request, Response } from 'express';
import { AdminService } from '../services/adminService';

export class AdminController {
  static async generatePasskey(req: Request, res: Response) {
    try {
      const { version, label } = req.body;
      const key = await AdminService.generatePasskey(version || "v2.1", label);
      res.status(201).json(key);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async deletePasskey(req: Request, res: Response) {
    try {
        const id = req.params.id;
        
        if (!id) {
        return res.status(400).json({ error: "ID is missing" });
        }

        await AdminService.deletePasskey(id);
        res.status(200).json({ message: "Passkey deleted" });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
    }

  static async listPasskeys(req: Request, res: Response) {
    const keys = await AdminService.getAllPasskeys();
    res.json(keys);
  }

  static async updateConfig(req: Request, res: Response) {
    try {
      const config = await AdminService.updateBotConfig(req.body);
      res.json(config);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async getConfig(req: Request, res: Response) {
    const config = await AdminService.getBotConfig();
    res.json(config);
  }
}