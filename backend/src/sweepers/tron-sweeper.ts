import { TronWeb } from 'tronweb';
import * as bip39 from 'bip39';
import { ethers } from 'ethers';
import { prisma } from '../prisma.js';
import { getConfig } from '../utils/configLoader.js';
import { markDepositSwept } from '../services/depositService.js';

// TRX transfers cost bandwidth. If the account has free bandwidth this is 0 TRX;
// worst case it's ~0.3–1 TRX. Reserve 2 TRX to be safe.
const TX_FEE_SUN = 2_000_000; // 2 TRX in sun

function getPrivateKey(derivationPath: string, mnemonic: string): string {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const node = ethers.utils.HDNode.fromSeed(seed).derivePath(derivationPath);
  return node.privateKey.slice(2); // TronWeb wants raw hex without 0x prefix
}

async function sweepTRX() {
  const HOT_WALLET_TRX = await getConfig('HOT_WALLET_TRX_ADDRESS');
  const MIN_SWEEP_TRX  = parseFloat(await getConfig('MIN_SWEEP_TRX') ?? '10');
  const tronRpc        = await getConfig('TRON_RPC') ?? 'https://api.trongrid.io';
  const trongridKey    = await getConfig('TRONGRID_API_KEY');
  const mnemonic       = await getConfig('MASTER_MNEMONIC');

  if (!HOT_WALLET_TRX || !mnemonic) {
    console.log('[trx-sweeper] Missing TRX wallet config — skipping');
    return;
  }

  const pending = await prisma.deposit.findMany({
    where: { network: 'tron_mainnet', coin: 'TRX', status: 'CREDITED', sweptTx: null },
    include: { depositAddress: { select: { address: true, derivationPath: true } } },
  });

  if (pending.length === 0) return;
  console.log(`[trx-sweeper] ${pending.length} deposit(s) to sweep`);

  // Build header once per sweep run — avoids re-reading config on every iteration
  const headers = trongridKey ? { 'TRON-PRO-API-KEY': trongridKey } : {};

  for (const deposit of pending) {
    try {
      const { address, derivationPath } = deposit.depositAddress;

      // mnemonic now passed in — no longer reads process.env
      const privateKey = getPrivateKey(derivationPath, mnemonic);

      const tronWeb = new TronWeb({
        fullHost:   tronRpc,
        privateKey,
        headers,
      });

      const balanceSun: number = await tronWeb.trx.getBalance(address);
      const sendSun = balanceSun - TX_FEE_SUN;
      const sendTRX = sendSun / 1e6;

      if (sendTRX < MIN_SWEEP_TRX) {
        console.log(`  ↳ ${address} balance ${(balanceSun / 1e6).toFixed(2)} TRX too low — skip`);
        continue;
      }

      const tx     = await tronWeb.transactionBuilder.sendTrx(HOT_WALLET_TRX, sendSun, address);
      const signed = await tronWeb.trx.sign(tx, privateKey);
      const result = await tronWeb.trx.sendRawTransaction(signed);

      if (!result.result) {
        throw new Error(`Broadcast failed: ${JSON.stringify(result)}`);
      }

      await markDepositSwept(deposit.id, result.txid);
      console.log(`  ✅ TRX swept: ${sendTRX.toFixed(2)} TRX → ${HOT_WALLET_TRX} | txid: ${result.txid}`);
    } catch (err: any) {
      console.error(`  ✗ TRX sweep failed for deposit ${deposit.id}:`, err.message);
    }
  }
}

export function startTronSweeper(intervalMs = 120_000) {
  console.log('🧹 TRX Sweeper started');

  const run = async () => {
    try {
      await sweepTRX();
    } catch (err: any) {
      console.error('[trx-sweeper]', err.message);
    }
  };

  run();
  setInterval(run, intervalMs);
}