import { Request, Response } from 'express';
import { WithdrawalService } from '../services/withdrawalService.js';
import { fetchWithdrawalHistory } from '../services/withdrawalService.js';

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

export async function requestWithdrawal(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { accountId, amount, coin, network, toAddress } = req.body;

    if (!accountId || !amount || !coin || !network || !toAddress) {
      return res.status(400).json({
        error: 'Missing required fields: accountId, amount, coin, network, toAddress',
      });
    }

    if (!/^0x[a-fA-F0-9]{40}$|^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(toAddress)) {
      return res.status(400).json({ error: 'Invalid withdrawal address format' });
    }

    const withdrawal = await WithdrawalService.requestWithdrawal({
      userId,
      accountId,
      amount,
      coin,
      network,
      toAddress,
    });

    return res.status(201).json({
      success: true,
      withdrawalId: withdrawal.id,
      status: withdrawal.status,
      amount: Number(withdrawal.amount),
      message: 'Withdrawal request submitted successfully',
    });
  } catch (err: any) {
    console.error('requestWithdrawal error:', err);
    return res.status(400).json({ error: err.message });
  }
}