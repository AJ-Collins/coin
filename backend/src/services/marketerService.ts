import prisma from '../utils/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import { Coin } from '@prisma/client';
import { LoginInput, AuthResponse, UserDTO } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Critical Configuration Error: JWT_SECRET environment variable is missing.');
}

// 1. Define compile-time safe database return shapes using Prisma's type utilities
type DBUserWithRelations = Prisma.UserGetPayload<{
  include: { accounts: true };
}>;

/**
 * Data Transfer Object (DTO) to sanitize and transform database payloads 
 * securely before transmitting data to the client application layer.
 */
function toUserDTO(user: DBUserWithRelations): UserDTO {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    referralRate: Number(user.referralRate),
    kycStatus: user.kycStatus,
    idDocument: user.idDocument ?? null,
    createdAt: user.createdAt,
    accounts: (user.accounts ?? []).map((acc) => ({
      id: acc.id,
      type: acc.type,
      balance: Number(acc.balance),
      currency: acc.currency,
      createdAt: acc.createdAt,
    })),
  };
}

export class MarketerService {
    /**
     * Authenticates only MARKETER role users.
     */
    static async marketerLogin(credentials: LoginInput): Promise<AuthResponse> {
    const { email, password } = credentials;

    const user = await prisma.user.findUnique({
        where: { email },
        include: { accounts: true },
    });

    if (!user) throw new Error('INVALID_CREDENTIALS');
    if (user.status === 'SUSPENDED') throw new Error('ACCOUNT_SUSPENDED');
    if (user.role !== 'MARKETER') throw new Error('INSUFFICIENT_ROLE');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('INVALID_CREDENTIALS');

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET!,
        { expiresIn: '7d' }
    );

    return { user: toUserDTO(user), token };
    }

    static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { accounts: true },
    });
    if (!user) throw new Error('User not found');
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      accounts: user.accounts.map(a => ({ ...a, balance: Number(a.balance) }))
    };
  }

  static async getExternalWithdrawals(userId: string) {
    const aggregations = await prisma.withdrawal.aggregate({
      where: { userId, status: 'COMPLETED' },
      _sum: { amount: true },
    });
    return { totalWithdrawals: Number(aggregations._sum.amount || 0) };
  }

  static async initiateDeposit(userId: string, currency: string) {
    let depositAddr = await prisma.depositAddress.findFirst({
      where: { userId, coin: currency as Coin },
    });

    if (!depositAddr) {
      depositAddr = await prisma.depositAddress.create({
        data: {
          userId,
          coin: currency as Coin,
          network: 'mainnet',
          address: `0x_mock_derived_${Math.random().toString(16).substring(2, 10)}`,
          derivationPath: "m/44'/60'/0'/0/0",
        }
      });
    }

    return {
      address: depositAddr.address,
      network: depositAddr.network,
      qrData: depositAddr.address,
    };
  }

  static async confirmDeposit(userId: string, body: any) {
    const addr = await prisma.depositAddress.findFirst({
      where: { userId, coin: body.currency as Coin }
    });
    if (!addr) throw new Error('No deposit address active for this asset asset.');

    await prisma.deposit.create({
      data: {
        userId,
        depositAddressId: addr.id,
        coin: body.currency as Coin,
        network: body.network || 'mainnet',
        txHash: body.txHash,
        amount: body.amount,
        status: 'PENDING'
      }
    });
  }

  static async getDepositHistory(userId: string) {
    const list = await prisma.deposit.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    return list.map(d => ({
      id: d.id,
      currency: d.coin,
      amount: Number(d.amount),
      network: d.network,
      txHash: d.txHash,
      status: d.status,
      createdAt: d.createdAt.toISOString()
    }));
  }

  static async requestWithdrawal(userId: string, body: any) {
    const account = await prisma.account.findFirst({
      where: { userId, currency: 'USD' }
    });
    if (!account || Number(account.balance) < body.amount) {
      throw new Error('Insufficient programmatic balance for deployment allocation');
    }

    await prisma.$transaction([
      prisma.account.update({
        where: { id: account.id },
        data: { balance: { decrement: body.amount } }
      }),
      prisma.withdrawal.create({
        data: {
          userId,
          accountId: account.id,
          amount: body.amount,
          coin: body.currency as Coin,
          network: body.network,
          toAddress: body.destinationAddress,
          status: 'PENDING'
        }
      })
    ]);
  }

  static async getWithdrawalHistory(userId: string) {
    const list = await prisma.withdrawal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    return list.map(w => ({
      id: w.id,
      currency: w.coin,
      amount: Number(w.amount),
      destinationAddress: w.toAddress,
      network: w.network,
      status: w.status,
      txHash: w.txHash ?? undefined,
      createdAt: w.createdAt.toISOString()
    }));
  }

  static async getTransactions(userId: string) {
    const [deposits, withdrawals] = await prisma.$transaction([
      prisma.deposit.findMany({ where: { userId } }),
      prisma.withdrawal.findMany({ where: { userId } })
    ]);

    const txs = [
      ...deposits.map(d => ({ id: d.id, type: 'DEPOSIT', amount: Number(d.amount), asset: d.coin, status: d.status, date: d.createdAt })),
      ...withdrawals.map(w => ({ id: w.id, type: 'WITHDRAWAL', amount: Number(w.amount), asset: w.coin, status: w.status, date: w.createdAt }))
    ];

    return txs.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  static async getReferrals(userId: string) {
    const referredUsers = await prisma.user.findMany({
      where: { referrerId: userId },
      include: { deposits: true }
    });

    const transformedReferrals = referredUsers.map(u => {
      const depositsByCurrency: Record<string, number> = {};
      u.deposits.forEach(d => {
        depositsByCurrency[d.coin] = (depositsByCurrency[d.coin] || 0) + Number(d.amount);
      });

      return {
        id: u.id,
        name: u.email.split('@')[0],
        joinedAt: u.createdAt.toISOString(),
        depositCount: u.deposits.length,
        depositsByCurrency
      };
    });

    return {
      referralCode: userId.substring(0, 8).toUpperCase(),
      referralLink: `https://aiscalpingpro.com/register?ref=${userId.substring(0, 8).toUpperCase()}`,
      totalReferred: referredUsers.length,
      referrals: transformedReferrals
    };
  }

  static async getNotifications(userId: string) {
    const auditLogs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return {
      notifications: auditLogs.map(log => ({
        id: log.id,
        message: log.action,
        isRead: log.metadata === 'READ',
        createdAt: log.createdAt.toISOString()
      })),
      unreadCount: auditLogs.filter(log => log.metadata !== 'READ').length
    };
  }

  static async markAsRead(id: string) {
    await prisma.auditLog.update({
      where: { id },
      data: { metadata: 'READ' }
    });
  }
}