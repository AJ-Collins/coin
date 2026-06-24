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
import { getConfig } from '../utils/configLoader.js';
import { markDepositSwept } from '../services/depositService.js';

// Solana base fee is 5000 lamports per signature; add a small buffer for
// priority fees in case the network is busy (still well under 0.0001 SOL).
const TX_FEE_LAMPORTS = 10_000;

function getKeypairForPath(derivationPath: string, mnemonic: string): Keypair {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const { key } = derivePath(derivationPath, seed.toString('hex'));
  return Keypair.fromSeed(key);
}

async function sweepSOL(connection: Connection) {
  const HOT_WALLET_SOL = await getConfig('HOT_WALLET_SOL_ADDRESS');
  const MIN_SWEEP_SOL  = parseFloat(await getConfig('MIN_SWEEP_SOL') ?? '0.005');
  const mnemonic       = await getConfig('MASTER_MNEMONIC');

  if (!HOT_WALLET_SOL || !mnemonic) {
    console.log('[sol-sweeper] Missing SOL wallet config — skipping');
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

      // mnemonic now passed in — no longer reads process.env
      const keypair = getKeypairForPath(derivationPath, mnemonic);

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
  console.log('🧹 SOL Sweeper started');

  const run = async () => {
    try {
      // RPC fetched fresh each run so the admin can update it without restart
      const rpc = await getConfig('HELIUS_RPC_URL') ?? 'https://api.mainnet-beta.solana.com';
      const connection = new Connection(rpc, 'confirmed');
      await sweepSOL(connection);
    } catch (err: any) {
      console.error('[sol-sweeper]', err.message);
    }
  };

  run();
  setInterval(run, intervalMs);
}