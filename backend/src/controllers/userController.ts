import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { AccountBalanceDTO } from '../types/auth.types';

export class UserController {
  static async getAccountBalance(req: Request, res: Response<AccountBalanceDTO | { message: string }>) {
    try {
      const userId = req.user!.id;
      const data = await UserService.fetchAccountBalance(userId);
      return res.json(data);
    } catch (err: any) {
      if (err.message === 'Account not found') {
        return res.status(404).json({ message: err.message });
      }
      console.error('getAccountBalance error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async updatePassword(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ error: 'All password fields are required' });
      }
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'New passwords do not match' });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters' });
      }

      await UserService.updatePassword(userId, currentPassword, newPassword);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }
}