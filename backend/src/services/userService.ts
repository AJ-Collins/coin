import { prisma } from "../prisma";
import { AccountBalanceDTO } from '../types/auth.types';

export class UserService {}

export async function fetchAccountBalance(userId: string): Promise<AccountBalanceDTO> {
  const account = await prisma.account.findUnique({
    where: {
      userId_type: {
        userId,
        type: 'REAL',
      },
    },
    select: {
      balance: true,
      currency: true,
    },
  });

  if (!account) throw new Error('Account not found');

  return {
    balance: Number(account.balance),
    currency: account.currency,
  };
}