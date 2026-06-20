import { prisma } from '../prisma';

export async function fetchWithdrawalHistory(userId: string) {
  return prisma.withdrawal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      coin: true,
      network: true,
      amount: true,
      toAddress: true,
      status: true,
      txHash: true,
      createdAt: true,
    },
  });
}