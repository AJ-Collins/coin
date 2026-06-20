import { Request, Response } from 'express';
import { fetchWithdrawalHistory } from '../services/withdrawalService';

export async function getWithdrawalHistory(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const withdrawals = await fetchWithdrawalHistory(userId);
    return res.json(withdrawals);
  } catch (err) {
    console.error('getWithdrawalHistory error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}