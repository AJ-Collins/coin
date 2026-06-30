// virtualWalletReconciliationService.ts
import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma.js';

export class VirtualWalletReconciliationService {

  /**
   * Recomputes a user's virtual wallet balance from the sum of all their
   * COMPLETED withdrawals, creates the wallet if missing, and logs a
   * transaction for the delta (if any). Safe to call repeatedly —
   * if nothing changed since the last run, it's a no-op.
   */
  static async reconcileForUser(userId: string, referenceWithdrawalId?: string) {
    await prisma.$transaction(async (tx) => {
      // Lock the wallet row (if it exists) to prevent concurrent reconciliations
      // for the same user from racing each other.
      const existing = await tx.$queryRaw<{ id: string; balance: Prisma.Decimal }[]>`
        SELECT id, balance FROM "VirtualWallet" WHERE "userId" = ${userId} FOR UPDATE
      `;

      let wallet = existing[0];

      if (!wallet) {
        wallet = await tx.virtualWallet.create({
          data: { userId, balance: new Prisma.Decimal(0) },
        });
      }

      // Sum all completed withdrawals for this user — the source of truth.
      const { _sum } = await tx.withdrawal.aggregate({
        where: { userId, status: 'COMPLETED' },
        _sum: { amount: true },
      });

      const totalCompleted = new Prisma.Decimal(_sum.amount ?? 0);
      const currentBalance = new Prisma.Decimal(wallet.balance.toString());
      const delta = totalCompleted.sub(currentBalance);

      // Nothing changed — skip writing a redundant transaction record.
      if (delta.isZero()) {
        console.log(`[WALLET RECONCILE] userId=${userId} already in sync at $${currentBalance}`);
        return;
      }

      const updatedWallet = await tx.virtualWallet.update({
        where: { id: wallet.id },
        data: { balance: totalCompleted },
      });

      await tx.virtualWalletTransaction.create({
        data: {
          walletId: wallet.id,
          type: delta.greaterThan(0) ? 'CREDIT' : 'DEBIT',
          amount: delta.abs(),
          balanceAfter: updatedWallet.balance,
          description: `Reconciliation against completed withdrawals (total: $${totalCompleted})`,
          referenceId: referenceWithdrawalId,
        },
      });

      console.log(
        `[WALLET RECONCILE] userId=${userId} balance $${currentBalance} -> $${totalCompleted} (delta $${delta})`
      );
    });
  }
}