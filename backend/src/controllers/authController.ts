import { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';
import { AuthRequest } from '../middleware/auth.js';
import { validateEmail } from '../utils/validators.js';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const result = await AuthService.login(req.body);
      res.json(result);
    } catch (err: any) {
      if (err.message === 'ACCOUNT_SUSPENDED') {
        return res.status(403).json({ error: 'ACCOUNT_SUSPENDED' });
      }
      res.status(401).json({ error: err.message });
    }
  }

  /**
   * Handle account lookup and reset instructions generation.
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const email = ((req.body.email || '').trim());
      if (!email || !validateEmail(email)) {
        res.status(400).json({ error: 'INVALID_EMAIL_FORMAT' });
        return;
      }

      const result = await AuthService.forgotPassword(email);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  }

  /**
   * Complete password rewrite execution block.
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        res.status(400).json({ error: 'TOKEN_AND_PASSWORD_REQUIRED' });
        return;
      }

      const result = await AuthService.resetPassword(token, password);
      res.status(200).json(result);
    } catch (err: any) {
      if (err.message === 'INVALID_OR_EXPIRED_TOKEN') {
        res.status(400).json({ error: 'INVALID_OR_EXPIRED_TOKEN' });
        return;
      }
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  }

  /**
   * Fetches full profile context for the current session holder
   */
  static async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const result = await AuthService.getMe(userId);
      res.status(200).json(result); // Sends { user: { id, email, accounts: [...] } }
    } catch (err: any) {
      if (err.message === 'USER_NOT_FOUND') {
        res.status(444).json({ error: 'User profile no longer exists' });
        return;
      }
      if (err.message === 'ACCOUNT_SUSPENDED') {
        res.status(403).json({ error: 'ACCOUNT_SUSPENDED' });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
