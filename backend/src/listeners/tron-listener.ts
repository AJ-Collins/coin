import axios from 'axios';
import { prisma } from '../prisma.js';
import { creditDeposit } from '../services/depositService.js';
import { Coin } from '@prisma/client';

// TronGrid free tier — get a key at https://www.trongrid.io (no CC required)
const TRONGRID_BASE = 'https://api.trongrid.io';
const TRONGRID_KEY  = process.env.TRONGRID_API_KEY || '';

async function getUsdRate(): Promise<number> {
  try {
    const { data } = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=tron&vs_currencies=usd',
      { timeout: 8_000 },
    );
    return data?.tron?.usd ?? 0.12;
  } catch {
    return 0.12;
  }
}

async function checkAddress(address: string, userId: string) {
  const headers: Record<string, string> = TRONGRID_KEY
    ? { 'TRON-PRO-API-KEY': TRONGRID_KEY }
    : {};

  const { data } = await axios.get(
    `${TRONGRID_BASE}/v1/accounts/${address}/transactions`,
    {
      params: { limit: 20, only_confirmed: true, only_to: true },
      headers,
      timeout: 10_000,
    },
  );

  const txs: any[] = data.data ?? [];

  for (const tx of txs) {
    if (tx.ret?.[0]?.contractRet !== 'SUCCESS') continue;

    const contract = tx.raw_data?.contract?.[0];
    if (!contract || contract.type !== 'TransferContract') continue;

    const value = contract.parameter?.value;
    if (!value) continue;

    // only_to=true should handle this, but double-check
    if (value.to_address !== address) continue;

    const amountTRX = value.amount / 1e6; // sun → TRX
    if (amountTRX <= 0) continue;

    const txHash: string = tx.txID;
    const usdRate  = await getUsdRate();
    const usdValue = amountTRX * usdRate;

    const deposit = await creditDeposit(
      txHash,
      userId,
      'TRX' as Coin,
      'tron_mainnet',
      amountTRX,
      usdValue,
    );

    if (deposit) {
      console.log(
        `[TRX] ✅ Credited ${amountTRX} TRX ($${usdValue.toFixed(2)}) → user ${userId} | tx: ${txHash}`,
      );
    }
  }
}

async function poll() {
  const addresses = await prisma.depositAddress.findMany({
    where: { network: 'tron_mainnet' },
    select: { address: true, userId: true },
  });

  if (addresses.length === 0) return;

  for (let i = 0; i < addresses.length; i += 3) {
    const chunk = addresses.slice(i, i + 3);
    await Promise.allSettled(chunk.map(a => checkAddress(a.address, a.userId)));
    if (i + 3 < addresses.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
}

export function startTronListener(intervalMs = 15_000) {
  console.log('[TRX] Listener started');

  const run = async () => {
    try { await poll(); }
    catch (err: any) { console.error('[TRX] Poll error:', err.message); }
  };

  run();
  setInterval(run, intervalMs);
}