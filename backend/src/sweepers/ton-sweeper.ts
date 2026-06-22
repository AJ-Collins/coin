import { TonClient, WalletContractV4, internal, toNano, fromNano } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import * as bip39 from 'bip39';
import { ethers } from 'ethers';
import { prisma } from '../prisma.js';
import { markDepositSwept } from '../services/depositService.js';

const TON_ENDPOINT  = process.env.TONCENTER_API_URL
  ? `${process.env.TONCENTER_API_URL}/jsonRPC`
  : 'https://toncenter.com/api/v2/jsonRPC';
const TON_API_KEY    = process.env.TONCENTER_API_KEY;
const HOT_WALLET_TON = process.env.HOT_WALLET_TON_ADDRESS!;
const MIN_SWEEP_TON  = parseFloat(process.env.MIN_SWEEP_TON || '0.05');
const TX_FEE_TON     = 0.015; // reserve for gas (typical TON transfer costs ~0.005–0.01)

// Derive a TON keypair from the master mnemonic via the same HD path used
// in src/wallets/ton.ts — must stay in sync with the generator.
async function getKeypairForPath(derivationPath: string) {
  const seed = bip39.mnemonicToSeedSync(process.env.MASTER_MNEMONIC!);
  const masterNode = ethers.utils.HDNode.fromSeed(seed);
  const node = masterNode.derivePath(derivationPath);

  // Convert the 32-byte HD private key into a TON-compatible keypair via
  // the same entropy-to-mnemonic trick used in the address generator
  const privateKeyBytes = Buffer.from(node.privateKey.slice(2), 'hex');
  const tonMnemonic = bip39.entropyToMnemonic(privateKeyBytes.slice(0, 16)).split(' ');
  return mnemonicToPrivateKey(tonMnemonic);
}

async function sweepTON(client: TonClient) {
  if (!HOT_WALLET_TON) {
    console.log('[ton-sweeper] HOT_WALLET_TON_ADDRESS not set — skipping');
    return;
  }

  const pending = await prisma.deposit.findMany({
    where: { network: 'ton_mainnet', coin: 'TON', status: 'CREDITED', sweptTx: null },
    include: { depositAddress: { select: { address: true, derivationPath: true } } },
  });

  if (pending.length === 0) return;
  console.log(`[ton-sweeper] ${pending.length} deposit(s) to sweep`);

  for (const deposit of pending) {
    try {
      const { address, derivationPath } = deposit.depositAddress;

      const keyPair  = await getKeypairForPath(derivationPath);
      const wallet   = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
      const contract = client.open(wallet);

      const balanceNano = await contract.getBalance();
      const balanceTON  = parseFloat(fromNano(balanceNano));

      if (balanceTON < MIN_SWEEP_TON) {
        console.log(`  ↳ ${address} balance ${balanceTON.toFixed(4)} TON too low — skip`);
        continue;
      }

      const sendAmount = balanceTON - TX_FEE_TON;
      if (sendAmount <= 0) continue;

      const seqno = await contract.getSeqno();

      await contract.sendTransfer({
        secretKey: keyPair.secretKey,
        seqno,
        messages: [
          internal({
            to:     HOT_WALLET_TON,
            value:  toNano(sendAmount.toFixed(9)),
            bounce: false,           // non-bounceable — hot wallet may not be a smart contract
          }),
        ],
      });

      // TON doesn't synchronously return a txid from sendTransfer.
      // Store a deterministic reference: address + seqno uniquely identifies the send.
      const txRef = `ton:${address}:seqno:${seqno}`;
      await markDepositSwept(deposit.id, txRef);
      console.log(`  ✅ TON swept: ${sendAmount.toFixed(4)} TON → ${HOT_WALLET_TON} | ref: ${txRef}`);

    } catch (err: any) {
      console.error(`  ✗ TON sweep failed for deposit ${deposit.id}:`, err.message);
    }
  }
}

export function startTONSweeper(intervalMs = 120_000) {
  const client = new TonClient({
    endpoint: TON_ENDPOINT,
    apiKey:   TON_API_KEY,
  });
  console.log('🧹 TON Sweeper started');

  const run = async () => {
    try { await sweepTON(client); }
    catch (err: any) { console.error('[ton-sweeper]', err.message); }
  };

  run();
  setInterval(run, intervalMs);
}