import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { prisma } from '../prisma.js';
import { markDepositSwept } from '../services/depositService.js';

const RPC              = process.env.HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com';
const HOT_WALLET_SOL   = process.env.HOT_WALLET_SOL_ADDRESS!;
const MIN_SWEEP_SOL    = parseFloat(process.env.MIN_SWEEP_SOL || '0.005');

// Solana base fee is 5000 lamports per signature; add a small buffer for
// priority fees in case the network is busy (still well under 0.0001 SOL).
const TX_FEE_LAMPORTS = 10_000;

function getKeypairForPath(derivationPath: string): Keypair {
  const seed = bip39.mnemonicToSeedSync(process.env.MASTER_MNEMONIC!);
  const { key } = derivePath(derivationPath, seed.toString('hex'));
  return Keypair.fromSeed(key);
}

async function sweepSOL(connection: Connection) {
  if (!HOT_WALLET_SOL) {
    console.log('[sol-sweeper] HOT_WALLET_SOL_ADDRESS not set — skipping');
    return;
  }

  const pending = await prisma.deposit.findMany({
    where: { network: 'solana_mainnet', coin: 'SOL', status: 'CREDITED', sweptTx: null },
    include: { depositAddress: { select: { address: true, derivationPath: true } } },
  });

  if (pending.length === 0) return;
  console.log(`[sol-sweeper] ${pending.length} deposit(s) to sweep`);

  const hotPubkey = new PublicKey(HOT_WALLET_SOL);

  for (const deposit of pending) {
    try {
      const { address, derivationPath } = deposit.depositAddress;
      const pubkey          = new PublicKey(address);
      const balanceLamports = await connection.getBalance(pubkey, 'confirmed');
      const sendLamports    = balanceLamports - TX_FEE_LAMPORTS;

      if (sendLamports / LAMPORTS_PER_SOL < MIN_SWEEP_SOL) {
        console.log(
          `  ↳ ${address} balance ${(balanceLamports / LAMPORTS_PER_SOL).toFixed(6)} SOL too low — skip`,
        );
        continue;
      }

      const keypair = getKeypairForPath(derivationPath);

      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: pubkey,
          toPubkey:   hotPubkey,
          lamports:   sendLamports,
        }),
      );

      const sig = await sendAndConfirmTransaction(connection, tx, [keypair], {
        commitment: 'confirmed',
      });

      await markDepositSwept(deposit.id, sig);
      console.log(
        `  ✅ SOL swept: ${(sendLamports / LAMPORTS_PER_SOL).toFixed(6)} SOL → ${HOT_WALLET_SOL} | sig: ${sig}`,
      );
    } catch (err: any) {
      console.error(`  ✗ SOL sweep failed for deposit ${deposit.id}:`, err.message);
    }
  }
}

export function startSOLSweeper(intervalMs = 120_000) {
  const connection = new Connection(RPC, 'confirmed');
  console.log('🧹 SOL Sweeper started');

  const run = async () => {
    try { await sweepSOL(connection); }
    catch (err: any) { console.error('[sol-sweeper]', err.message); }
  };

  run();
  setInterval(run, intervalMs);
}