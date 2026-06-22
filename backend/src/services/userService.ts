import { prisma } from "../prisma.js";
import bcrypt from 'bcryptjs';
import { AccountBalanceDTO } from '../types/auth.types';

export class UserService {
  static async fetchAccountBalance(userId: string): Promise<AccountBalanceDTO> {
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

  static async updatePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id }, select: { password: true } });
    if (!user) throw new Error('User not found');

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new Error('Current password is incorrect');

    if (newPassword.length < 8) throw new Error('New password must be at least 8 characters');

    const hashed = await bcrypt.hash(newPassword, 12);
    return prisma.user.update({ where: { id }, data: { password: hashed } });
  }
}