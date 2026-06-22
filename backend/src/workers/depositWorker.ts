import { Coin } from '@prisma/client';
import { Worker, Job } from 'bullmq';
import { redis } from '../lib/redis.js';
import { prisma } from '../prisma.js';
import { creditDeposit } from '../services/depositService.js';
import { getUsdRate } from '../services/priceService.js';
import {
  NATIVE_COIN,
  STABLECOIN_CONTRACTS,
  SupportedNetwork,
} from '../config/networks.js';
import { DEPOSIT_QUEUE_NAME, DepositActivityJob } from '../queues/depositQueue.js';

const MIN_CONFIRMATIONS: Record<SupportedNetwork, number> = {
  sepolia: 1,
  eth_mainnet: 12,
  bsc_testnet: 1,
  polygon_mainnet: 64,
  arbitrum_mainnet: 1,
  btc_mainnet: 2,
  btc_testnet: 2,
  solana_mainnet: 30,
  ton_mainnet: 3,
  tron_mainnet: 20,
  xrp_mainnet: 1,
  ltc_mainnet: 3,
  doge_mainnet: 3,
};

function resolveCoinForActivity(activity: any, network: SupportedNetwork) {
  const contractAddress: string | undefined = activity.rawContract?.address?.toLowerCase();

  if (!contractAddress) {
    return { coin: NATIVE_COIN[network], decimals: 18 };
  }

  const known = STABLECOIN_CONTRACTS[network]?.[contractAddress];
  if (!known) {
    console.warn(
      `[DepositWorker] Unrecognized contract ${contractAddress} on ${network} (asset: ${activity.asset})`
    );
    return null;
  }
  return { coin: known.symbol, decimals: known.decimals };
}

function resolveAmount(activity: any, expectedDecimals: number): number | null {
  const decodedValue: number | undefined = activity.value;
  const rawHexValue: string | undefined = activity.rawContract?.value;
  const reportedDecimals: number | undefined = activity.rawContract?.decimals;

  if (typeof decodedValue !== 'number' || decodedValue <= 0) return null;

  if (typeof reportedDecimals === 'number' && reportedDecimals !== expectedDecimals) {
    console.error(`[DepositWorker] Decimals mismatch: expected ${expectedDecimals}, got ${reportedDecimals}`);
    return null;
  }

  if (rawHexValue) {
    try {
      const raw = BigInt(rawHexValue);
      const recomputed = Number(raw) / 10 ** expectedDecimals;
      if (Math.abs(recomputed - decodedValue) / Math.max(decodedValue, 1e-9) > 0.0001) {
        console.error(`[DepositWorker] Value mismatch: decoded=${decodedValue} recomputed=${recomputed}`);
        return null;
      }
    } catch {
      // Unparseable rawContract.value — fall back to trusting decodedValue.
    }
  }

  return decodedValue;
}

async function processActivity(job: Job<DepositActivityJob>) {
  const { network, activity } = job.data;
  const internalNetwork = network as SupportedNetwork;

  if (activity.fromAddress === activity.toAddress) return;
  const toAddr: string | undefined = activity.toAddress?.toLowerCase();
  if (!toAddr) return;

  const depositAddress = await prisma.depositAddress.findFirst({
    where: { address: { equals: toAddr, mode: 'insensitive' }, network: internalNetwork },
  });
  if (!depositAddress) return;

  const confirmations: number = activity.confirmations ?? 0;
  const minRequired = MIN_CONFIRMATIONS[internalNetwork];
  if (confirmations < minRequired) {
    // Throwing here triggers BullMQ's retry/backoff instead of silently dropping —
    // by the time it retries (5s/10s/20s...) more confirmations will likely have landed.
    throw new Error(
      `tx ${activity.hash} has ${confirmations}/${minRequired} confirmations on ${internalNetwork} — retrying`
    );
  }

  const resolved = resolveCoinForActivity(activity, internalNetwork);
  if (!resolved) return; // unrecognized contract — not a transient failure, don't retry

  const value = resolveAmount(activity, resolved.decimals);
  if (value === null) return; // bad/inconsistent amount — don't retry, log already happened

  const txHash: string = activity.hash;
  if (!txHash) return;

  const usdRate = await getUsdRate(resolved.coin); // throws -> job retries automatically
  const usdValue = value * usdRate;

  console.log(
    `[DepositWorker] Deposit: ${value} ${resolved.coin} → user ${depositAddress.userId} | $${usdValue.toFixed(2)} | tx: ${txHash}`
  );

  const coinType = resolved.coin as Coin;
  const deposit = await creditDeposit(
    txHash,
    depositAddress.userId,
    coinType,
    internalNetwork,
    value,
    usdValue,
  );

  if (deposit) {
    console.log(`[DepositWorker] Credited $${usdValue.toFixed(2)} to user ${depositAddress.userId}`);
  } else {
    console.log(`[DepositWorker] tx ${txHash} already credited — skipped`);
  }
}

// Concurrency: how many activities this worker processes in parallel.
// Tune based on your DB connection pool size — don't set this higher than
// (pool size / number of worker processes), or you'll exhaust connections
// under load instead of actually scaling throughput.
const CONCURRENCY = Number(process.env.DEPOSIT_WORKER_CONCURRENCY || 10);

export const depositWorker = new Worker<DepositActivityJob>(
  DEPOSIT_QUEUE_NAME,
  processActivity,
  {
    connection: redis,
    concurrency: CONCURRENCY,
    limiter: {
      // Cap CoinGecko/DB pressure under a burst of webhook deliveries.
      max: 50,
      duration: 1000, // 50 jobs/sec max across this worker
    },
  }
);

depositWorker.on('completed', (job) => {
  console.log(`[DepositWorker] Job ${job.id} completed`);
});

depositWorker.on('failed', (job, err) => {
  console.error(`[DepositWorker] Job ${job?.id} failed after ${job?.attemptsMade} attempts:`, err.message);
  // After all retries are exhausted, this job sits in the failed set (removeOnFail age: 1 day).
  // Wire up alerting here (Slack/PagerDuty) so a permanently-stuck deposit doesn't go unnoticed.
});

process.on('SIGTERM', async () => {
  console.log('[DepositWorker] Shutting down gracefully...');
  await depositWorker.close();
  process.exit(0);
});