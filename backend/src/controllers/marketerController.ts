import { Request, Response } from 'express';
import { MarketerService } from '../services/marketerService.js';

export class MarketerController {
    /**
     * Marketer-only login gate. Rejects any non-MARKETER role attempt.
     */
    static async marketerLogin(req: Request, res: Response): Promise<void> {
    try {
        const result = await MarketerService.marketerLogin(req.body);
        res.json(result);
    } catch (err: any) {
        const statusMap: Record<string, number> = {
        INVALID_CREDENTIALS: 401,
        ACCOUNT_SUSPENDED:   403,
        INSUFFICIENT_ROLE:   403,
        };
        const status = statusMap[err.message] ?? 500;
        res.status(status).json({ error: err.message });
    }
    }

  static async logout(req: Request, res: Response) {
    res.json({ success: true, message: 'Logged out successfully' });
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const profile = await MarketerService.getProfile(req.user!.id);
      res.json(profile);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getExternalWithdrawals(req: Request, res: Response) {
    try {
      const result = await MarketerService.getExternalWithdrawals(req.user!.id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async initiateDeposit(req: Request, res: Response) {
    try {
      const data = await MarketerService.initiateDeposit(req.user!.id, req.body.currency);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async confirmDeposit(req: Request, res: Response) {
    try {
      await MarketerService.confirmDeposit(req.user!.id, req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getDepositHistory(req: Request, res: Response) {
    try {
      const deposits = await MarketerService.getDepositHistory(req.user!.id);
      res.json({ success: true, data: { deposits } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async requestWithdrawal(req: Request, res: Response) {
    try {
      await MarketerService.requestWithdrawal(req.user!.id, req.body);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getWithdrawalHistory(req: Request, res: Response) {
    try {
      const withdrawals = await MarketerService.getWithdrawalHistory(req.user!.id);
      res.json({ success: true, data: { withdrawals } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getTransactions(req: Request, res: Response) {
    try {
      const transactions = await MarketerService.getTransactions(req.user!.id);
      res.json({ success: true, data: { transactions } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getReferrals(req: Request, res: Response) {
    try {
      const data = await MarketerService.getReferrals(req.user!.id);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getNotifications(req: Request, res: Response) {
    try {
      const data = await MarketerService.getNotifications(req.user!.id);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      await MarketerService.markAsRead(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}