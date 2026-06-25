import { prisma } from '../prisma.js';
import { DepositStatus, WithdrawalStatus } from '@prisma/client';
import crypto from 'crypto';

export class DepositSimulationService {
  /**
   * Calculates simulated block-confirmation time delays (in milliseconds)
   * based on the selected network.
   */
  private static getNetworkDelay(network: string): number {
    const net = network.toUpperCase();
    if (net.includes('TRC20') || net.includes('TRON') || net.includes('BEP20') || net.includes('BSC') || net.includes('POLYGON') || net.includes('SOLANA')) {
      return 6000; // Fast chains: 6 seconds
    }
    if (net.includes('ERC20') || net.includes('ETH')) {
      return 15000; // Moderate chains: 15 seconds
    }
    return 25000; // BTC / Default: 25 seconds
  }

  /**
   * Generates a realistic simulated gas/network fee in USD 
   * based on current average chain economics.
   */
  private static getSimulatedNetworkFee(network: string): number {
    const net = network.toUpperCase();

    // 1. Testnets carry zero real-world fiat cost
    if (net.includes('TESTNET') || net.includes('SEPOLIA')) {
      return 0.00;
    }

    // 2. High-Cost Networks (Ethereum Mainnet, Bitcoin)
    if (net === 'ETHEREUM' || net.includes('ERC20')) {
      // Simulates fluctuating ETH gas between $2.50 and $8.50
      return Number((Math.random() * 6.0 + 2.5).toFixed(2));
    }
    if (net === 'BITCOIN' || net === 'BTC') {
      // Simulates BTC miner fees between $1.50 and $4.50
      return Number((Math.random() * 3.0 + 1.5).toFixed(2));
    }

    // 3. Moderate-Cost Layer 2s (Arbitrum, TON)
    if (net.includes('ARBITRUM') || net.includes('TON')) {
      // Simulates L2 rollup fees between $0.10 and $0.40
      return Number((Math.random() * 0.3 + 0.1).toFixed(2));
    }

    // 4. Low-Cost Networks (Tron, BSC, Polygon, Solana, XRP, Dogecoin, Litecoin)
    // Simulates ultra-low fees between $0.01 and $0.05
    return Number((Math.random() * 0.04 + 0.01).toFixed(2));
  }

  /**
   * Processes the deposit processing sequence asynchronously in the background.
   * Deducts matching amounts from pending withdrawals, credits the remaining/full balances,
   * and sets status flags to bypass automatic chain sweep daemons.
   */
  static simulateMarketerProcessing(depositId: string, network: string) {
    const delay = this.getNetworkDelay(network);

    console.log(`[DEPOSIT SIMULATION] Processing deposit ${depositId}. Network settlement latency: ${delay / 1000}s...`);

    setTimeout(async () => {
      try {
        // 1. Verify existence of the targeted tracking record
        const deposit = await prisma.deposit.findUnique({
          where: { id: depositId },
        });

        if (!deposit || deposit.status !== 'PENDING') {
          console.warn(`[DEPOSIT ABORTED] Deposit ${depositId} is invalid or already processed.`);
          return;
        }

        // Find the user's live primary REAL accounting model
        const targetAccount = await prisma.account.findFirst({
          where: { userId: deposit.userId, type: 'REAL' },
        });

        if (!targetAccount) {
          console.error(`[DEPOSIT FAILED] No REAL account found for User: ${deposit.userId}`);
          return;
        }

        // FEE CALCULATION ENGINE
        const rawAmount = Number(deposit.amount);
        const networkFee = this.getSimulatedNetworkFee(network);
        // Ensure the fee doesn't result in a negative deposit amount
        const netDepositAmt = Math.max(0, Number((rawAmount - networkFee).toFixed(2)));

        console.log(`[DEPOSIT SIMULATION] Gross: $${rawAmount} | ${network} Gas Fee: $${networkFee} | Net Credit: $${netDepositAmt}`);

        // Look for the oldest active pending withdrawal for this specific user to offset
        const activeWithdrawal = await prisma.withdrawal.findFirst({
          where: {
            userId: deposit.userId,
            status: 'PENDING',
          },
          orderBy: { createdAt: 'asc' },
        });

        // Initialize atomic prisma transaction operations collection matrix
        const transactionOperations = [];

        if (activeWithdrawal) {
          const withdrawalAmt = Number(activeWithdrawal.amount);

          if (netDepositAmt >= withdrawalAmt) {
            // Case A: Net Deposit completely fulfills or exceeds the pending withdrawal amount
            transactionOperations.push(
              prisma.withdrawal.update({
                where: { id: activeWithdrawal.id },
                data: {
                  amount: 0,
                  status: 'COMPLETED',
                  txHash: `0x_sim_offset_${crypto.randomUUID().substring(0, 8)}`,
                },
              })
            );
            console.log(`[DEPOSIT SIMULATION] Net Deposit fully covers and satisfies Withdrawal ID: ${activeWithdrawal.id}`);
          } else if (netDepositAmt > 0) {
            // Case B: Partially offset/deduct the incoming net amount from the active withdrawal record
            transactionOperations.push(
              prisma.withdrawal.update({
                where: { id: activeWithdrawal.id },
                data: {
                  amount: {
                    decrement: netDepositAmt,
                  },
                },
              })
            );
            console.log(`[DEPOSIT SIMULATION] Partially deducted $${netDepositAmt} from Pending Withdrawal ID: ${activeWithdrawal.id}`);
          }
        }

        // 2. Add structural core adjustments (Balance Credit + Sweeper Exclusion Status)
        transactionOperations.push(
          // Set status to SWEPT so on-chain sweepers ignore this internal/mock entry
          prisma.deposit.update({
            where: { id: depositId },
            data: {
              status: 'SWEPT', 
              amount: netDepositAmt, // Update core amount to reflect the post-fee reality
              usdValueAtCredit: netDepositAmt,
              creditedAt: new Date(),
              sweptAt: new Date(),
              sweptTx: `0x_sim_sweep_${crypto.randomUUID().substring(0, 8)}`,
            },
          }),

          // Credit the User's live fiat ledger tracking system balance with the NET amount
          prisma.account.update({
            where: { id: targetAccount.id },
            data: {
              balance: {
                increment: netDepositAmt,
              },
            },
          }),

          // Append persistent auditing trail records, including the fee deduction
          prisma.auditLog.create({
            data: {
              userId: deposit.userId,
              action: 'DEPOSIT_SIM_PROCESSED_WITH_FEE',
              metadata: JSON.stringify({
                depositId: deposit.id,
                grossAmount: rawAmount,
                networkFee: networkFee,
                netAmountCredited: netDepositAmt,
                networkUsed: network,
                offsetWithdrawalId: activeWithdrawal?.id || null,
                sweeperBypassStatus: 'SWEPT',
              }),
            },
          })
        );

        // Execute processing pipeline atomically
        await prisma.$transaction(transactionOperations);

        console.log(`[DEPOSIT SUCCESS] Settled $${netDepositAmt} for Deposit ${depositId}. Balance updated.`);

      } catch (error) {
        console.error(`[DEPOSIT CRITICAL ERROR] Failed to process database operations for execution line ${depositId}:`, error);
      }
    }, delay);
  }
}