import { Request, Response } from 'express';
import { fetchAccountBalance } from '../services/userService';
import { AccountBalanceDTO } from '../types/auth.types';

export class UserController {}

export async function getAccountBalance(req: Request, res: Response<AccountBalanceDTO | { message: string }>) {
  try {
    const userId = req.user!.id;
    const data = await fetchAccountBalance(userId);
    return res.json(data);
  } catch (err: any) {
    if (err.message === 'Account not found') {
      return res.status(404).json({ message: err.message });
    }
    console.error('getAccountBalance error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}