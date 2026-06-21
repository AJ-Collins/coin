import { Request, Response } from 'express';
import { AdminService } from '../services/adminService';
import { isValidUUID, validateTxHash, truncateString, clampPageAndLimit } from '../utils/validators';

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

  static async getDashboardStats(req: Request, res: Response) {
    try {
      const stats = await AdminService.getDashboardStats();
      res.json(stats);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async getRecentActivity(req: Request, res: Response) {
    try {
      const activity = await AdminService.getRecentActivity();
      res.json(activity);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async getUsers(req: Request, res: Response) {
    try {
      const search = truncateString(req.query.search as string, 100);
      const users = await AdminService.getAllUsers(search || undefined);
      res.json(users);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async createUser(req: Request, res: Response) {
    try {
      const { email, password, role, balance } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      const user = await AdminService.createUser({ email, password, role: role || 'USER', balance });
      res.status(201).json(user);
    } catch (e: any) {
      const status = e.code === 'P2002' ? 409 : 500;
      res.status(status).json({ error: e.code === 'P2002' ? 'Email already exists' : e.message });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidUUID(id)) {
        return res.status(400).json({ error: 'Invalid user ID format' });
      }
      const { email, role, balance, password } = req.body;
      const user = await AdminService.updateUser(id, { email, role, balance, password });
      res.json(user);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async toggleUserStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidUUID(id)) {
        return res.status(400).json({ error: 'Invalid user ID format' });
      }
      const user = await AdminService.toggleUserStatus(id);
      res.json(user);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!isValidUUID(id)) {
        return res.status(400).json({ error: 'Invalid user ID format' });
      }
      await AdminService.deleteUser(id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  static async getMarketers(req: Request, res: Response) {
  try {
    const marketers = await AdminService.getAllMarketers();
    res.json(marketers);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

static async getMarketerStats(req: Request, res: Response) {
  try {
    const stats = await AdminService.getMarketerStats();
    res.json(stats);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

static async updateMarketerRate(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { referralRate } = req.body;
    if (referralRate === undefined) {
      return res.status(400).json({ error: 'referralRate is required' });
    }
    const marketer = await AdminService.updateMarketerRate(id, Number(referralRate));
    res.json(marketer);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

static async getTrades(req: Request, res: Response) {
  try {
    const search = truncateString(req.query.search as string, 100);
    const { page, limit } = clampPageAndLimit(req.query.page as string, req.query.limit as string);
    const result = await AdminService.getAllTrades(search || undefined, page, limit);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

static async getTradeStats(req: Request, res: Response) {
  try {
    const stats = await AdminService.getTradeStats();
    res.json(stats);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

static async getDeposits(req: Request, res: Response) {
  try {
    const search = truncateString(req.query.search as string, 100);
    const { page, limit } = clampPageAndLimit(req.query.page as string, req.query.limit as string);
    const result = await AdminService.getAllDeposits(search || undefined, page, limit);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

static async getDepositStats(req: Request, res: Response) {
  try {
    const stats = await AdminService.getDepositStats();
    res.json(stats);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

static async retryDeposit(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await AdminService.retryFailedDeposit(id);
    res.json({ success: true, result });
  } catch (e: any) {
    const status = e.message.includes('not found') ? 404
      : e.message.includes('Only') ? 400 : 500;
    res.status(status).json({ error: e.message });
  }
}

static async getProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const profile = await AdminService.getAdminProfile(userId);
    res.json(profile);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

static async updateProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const updated = await AdminService.updateAdminProfile(userId, { email });
    res.json(updated);
  } catch (e: any) {
    const status = e.message.includes('already in use') ? 409 : 500;
    res.status(status).json({ error: e.message });
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

    await AdminService.updateAdminPassword(userId, currentPassword, newPassword);
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

static async manualCreditDeposit(req: Request, res: Response) {
  try {
    const { txHash, usdValue } = req.body;

    if (!txHash || !usdValue) {
      return res.status(400).json({ error: 'txHash and usdValue are required' });
    }

    if (!validateTxHash(txHash)) {
      return res.status(400).json({ error: 'txHash must be 66-char hex string (0x...)' });
    }

    const usdNum = Number(usdValue);
    if (isNaN(usdNum) || usdNum <= 0) {
      return res.status(400).json({ error: 'usdValue must be a positive number' });
    }

    if (usdNum > 10_000_000) {
      return res.status(400).json({ error: 'usdValue exceeds maximum allowed ($10M)' });
    }

    const result = await AdminService.manualCreditDeposit({
      txHash: txHash.trim(),
      usdValue: usdNum,
    });

    if (result.alreadyCredited) {
      return res.json({
        success: true,
        alreadyCredited: true,
        message: 'Transaction already credited — no changes made',
      });
    }

    res.json({
      success: true,
      alreadyCredited: false,
      message: `Credited $${usdNum.toFixed(2)} to user ${result.userId}`,
      details: {
        userId: result.userId,
        coin: result.coin,
        network: result.network,
        toAddress: result.toAddress,
        amountCrypto: result.amountCrypto,
        usdValue: result.usdValue,
      },
    });
  } catch (e: any) {
    const status = e.message.includes('not found') || e.message.includes('not registered') ? 404 : 500;
    res.status(status).json({ error: e.message });
  }
}
}