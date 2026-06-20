import { ethers } from 'ethers';
import { prisma } from '../prisma';
import { creditDeposit } from '../services/depositService';
import { Coin } from '@prisma/client';

const RPC_MAP: Record<string, string> = {
  sepolia:     process.env.SEPOLIA_RPC!,
  bsc_testnet: process.env.BSC_TESTNET_RPC!,
};

// Fetch rate from an oracle or env — simplified here
async function getUsdRate(coin: string): Promise<number> {
  const rates: Record<string, number> = {
    ETH: 3500, BNB: 600, USDT: 1, USDC: 1,
  };
  return rates[coin] ?? 1;
}

async function processBlock(blockNumber: number, provider: ethers.providers.JsonRpcProvider, network: string) {
  const block = await provider.getBlockWithTransactions(blockNumber);
  if (!block) return;

  // Get all watched addresses for this network
  const watched = await prisma.depositAddress.findMany({
    where: { network },
    select: { userId: true, address: true, coin: true },
  });

  const watchMap = Object.fromEntries(watched.map(w => [w.address.toLowerCase(), w]));

  for (const tx of block.transactions) {
    const toAddr = tx.to?.toLowerCase();
    if (!toAddr || !watchMap[toAddr]) continue;

    const match = watchMap[toAddr];
    const amountETH = parseFloat(ethers.utils.formatEther(tx.value));
    if (amountETH === 0) continue;

    console.log(`[${network}] Deposit detected: ${amountETH} ${match.coin} → user ${match.userId} | tx: ${tx.hash}`);

    try {
      await provider.waitForTransaction(tx.hash, 1);
      const usdRate = await getUsdRate(match.coin);
      const usdValue = amountETH * usdRate;

      const deposit = await creditDeposit(tx.hash, match.userId, match.coin as Coin, network, amountETH, usdValue);
      if (deposit) {
        console.log(`✅ Credited $${usdValue.toFixed(2)} USD to user ${match.userId}`);
      }
    } catch (err: any) {
      console.error(`[${network}] Credit error:`, err.message);
    }
  }
}

export async function startEVMListener(network: string) {
  const rpcUrl = RPC_MAP[network];
  if (!rpcUrl) throw new Error(`No RPC for: ${network}`);

  console.log(`[${network}] Starting EVM listener...`);
  let lastBlock = 0;
  let usingPolling = false;
  let lastEventTime = Date.now();

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

  provider.on('block', async (blockNumber: number) => {
    lastEventTime = Date.now();
    if (usingPolling) return;
    lastBlock = blockNumber;
    try { await processBlock(blockNumber, provider, network); }
    catch (err: any) { console.error(`[${network}] Block error:`, err.message); }
  });

  setInterval(async () => {
    if (Date.now() - lastEventTime > 30_000 && !usingPolling) {
      console.log(`[${network}] Switching to polling fallback`);
      usingPolling = true;
    }
    if (!usingPolling) return;

    try {
      const current = await provider.getBlockNumber();
      if (current <= lastBlock) return;
      const to = Math.min(current, lastBlock + 5);
      for (let b = lastBlock + 1; b <= to; b++) {
        await processBlock(b, provider, network);
      }
      lastBlock = to;
    } catch (err: any) {
      console.error(`[${network}] Polling error:`, err.message);
    }
  }, 15_000);

  console.log(`[${network}] ✅ Listener ready`);
}