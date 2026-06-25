import { prisma } from '../prisma.js';
import { EmailService } from './emailService.js';
import crypto from 'crypto';

export class WithdrawalSimulationService {
  /**
   * Calculates simulated block-confirmation time delays (in milliseconds)
   * based on the selected target blockchain network architecture.
   */
  private static getNetworkDelay(network: string): number {
    const net = network.toUpperCase();
    if (net.includes('TRC20') || net.includes('TRON') || net.includes('BEP20') || net.includes('BSC') || net.includes('SOL') || net.includes('POLYGON') || net.includes('MATIC')) {
      return 7000; // Fast chains: ~7 seconds
    }
    if (net.includes('ERC20') || net.includes('ETH') || net.includes('ETHEREUM')) {
      return 20000; // Moderate chains: ~20 seconds
    }
    if (net.includes('BTC') || net.includes('BITCOIN')) {
      return 45000; // Heavy proof-of-work chains: ~45 seconds
    }
    return 12000; // Fallback default baseline: 12 seconds
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
      return Number((Math.random() * 6.0 + 2.5).toFixed(2)); // $2.50 - $8.50
    }
    if (net === 'BITCOIN' || net === 'BTC') {
      return Number((Math.random() * 3.0 + 1.5).toFixed(2)); // $1.50 - $4.50
    }

    // 3. Moderate-Cost Layer 2s (Arbitrum, TON)
    if (net.includes('ARBITRUM') || net.includes('TON')) {
      return Number((Math.random() * 0.3 + 0.1).toFixed(2)); // $0.10 - $0.40
    }

    // 4. Low-Cost Networks (Tron, BSC, Polygon, Solana, XRP, Dogecoin, Litecoin)
    return Number((Math.random() * 0.04 + 0.01).toFixed(2)); // $0.01 - $0.05
  }

  /**
   * Generates a mock pseudo-random cryptographic blockchain transaction hash
   */
  private static generateMockTxHash(): string {
    return '0x' + crypto.randomBytes(32).toString('hex');
  }

  /**
   * Begins the non-blocking background worker simulation process.
   * Explicitly resolves the user's primary REAL account context to safely 
   * execute liquidity balance deductions factoring in network gas costs.
   */
  static simulateMarketerProcessing(withdrawalId: string, network: string) {
    const delay = this.getNetworkDelay(network);

    console.log(`[WITHDRAWAL SIMULATION] Marketer withdrawal ${withdrawalId} queued over network [${network}]. Completing in ${delay / 1000}s...`);

    // Execute out-of-band non-blocking asynchronous timer block
    setTimeout(async () => {
      try {
        // 1. Fetch current withdrawal request state data
        const withdrawal = await prisma.withdrawal.findUnique({
          where: { id: withdrawalId },
          include: { user: true },
        });

        if (!withdrawal || withdrawal.status !== 'PENDING') {
          console.warn(`[WITHDRAWAL ABORTED] Withdrawal ${withdrawalId} no longer exists or isn't pending.`);
          return;
        }

        // Dynamically locate the user's primary REAL account to ensure precise ledger mapping
        const targetAccount = await prisma.account.findFirst({
          where: { userId: withdrawal.userId, type: 'REAL' },
        });

        if (!targetAccount) {
          console.error(`[WITHDRAWAL FAILED] No REAL ledger balance context found for User ID: ${withdrawal.userId}`);
          return;
        }

        // FEE CALCULATION ENGINE
        // For a withdrawal, the user's platform balance is deducted by the GROSS amount,
        // but the destination address only receives the NET amount (Gross - Fee).
        const rawAmount = Number(withdrawal.amount);
        const networkFee = this.getSimulatedNetworkFee(network);
        const netAmountSent = Math.max(0, Number((rawAmount - networkFee).toFixed(2)));
        
        const txHash = this.generateMockTxHash();

        console.log(`[WITHDRAWAL SIMULATION] Requested: $${rawAmount} | ${network} Gas Fee: $${networkFee} | Net Sent to Wallet: $${netAmountSent}`);

        // 2. Execute atomic transactional balance deduction and status change updates
        await prisma.$transaction([
          // Update request to finalized state matching database schemas
          prisma.withdrawal.update({
            where: { id: withdrawalId },
            data: {
              status: 'COMPLETED',
              txHash: txHash,
            },
          }),
          
          // Securely deduct the FULL GROSS amount directly from the verified REAL account record
          prisma.account.update({
            where: { id: targetAccount.id },
            data: {
              balance: {
                decrement: rawAmount, 
              },
            },
          }),
          
          // Insert complete historical verification log track trace including gas economics
          prisma.auditLog.create({
            data: {
              userId: withdrawal.userId,
              action: 'WITHDRAWAL_SUCCESSFUL',
              metadata: JSON.stringify({
                withdrawalId: withdrawal.id,
                txHash: txHash,
                network: withdrawal.network || network,
                grossAmountDeducted: rawAmount,
                networkFeeBurned: networkFee,
                netAmountBroadcasted: netAmountSent,
                accountId: targetAccount.id,
                finalizedAt: new Date(),
              }),
            },
          }),
        ]);

        console.log(`[WITHDRAWAL SUCCESS] Marketer withdrawal ${withdrawalId} settled on-chain. Deducted $${rawAmount} from REAL account balance.`);

        // 3. Fire your email notification services
        if (withdrawal.user) {
          // Pass the NET amount so the user's email tells them exactly what hit their wallet
          // Note: Kept your existing method name `sendReferrerDepositAlert` but passed updated data
          await EmailService.sendReferrerDepositAlert(
            withdrawal.user,
            netAmountSent, 
            withdrawal.toAddress,
            txHash
          );
        }

      } catch (error) {
        console.error(`[WITHDRAWAL CRITICAL ERROR] Error processing marketer simulated settlement for ${withdrawalId}:`, error);
      }
    }, delay);
  }
}