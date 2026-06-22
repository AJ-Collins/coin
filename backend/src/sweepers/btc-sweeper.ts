import * as bitcoin from 'bitcoinjs-lib';
import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import axios from 'axios';
import { ECPairFactory } from 'ecpair';
import { prisma } from '../prisma.js';
import { markDepositSwept } from '../services/depositService.js';

const bip32 = BIP32Factory(ecc);
const ECPair = ECPairFactory(ecc);

const NETWORK_CONFIG: Record<string, { btcNetwork: bitcoin.Network; api: string }> = {
  btc_mainnet: { btcNetwork: bitcoin.networks.bitcoin, api: 'https://mempool.space/api' },
  btc_testnet: { btcNetwork: bitcoin.networks.testnet, api: 'https://mempool.space/testnet/api' },
};

const HOT_WALLET_BTC = process.env.HOT_WALLET_BTC_ADDRESS!;

// Below this in satoshis after fees, the output is uneconomical to sweep
const DUST_LIMIT_SATS = 546n;

interface UTXO {
  txid: string;
  vout: number;
  value: bigint;       // satoshis
  confirmed: boolean;
}

function deriveKeyPair(derivationPath: string, btcNetwork: bitcoin.Network) {
  const seed = bip39.mnemonicToSeedSync(process.env.MASTER_MNEMONIC!);
  const root = bip32.fromSeed(seed, btcNetwork);
  const child = root.derivePath(derivationPath);

  // ECPair is what PSBT.signInput() needs for P2WPKH
  return ECPair.fromWIF(child.toWIF(), btcNetwork);
}

async function getFeeRateSatVbyte(api: string): Promise<number> {
  try {
    const { data } = await axios.get(`${api}/v1/fees/recommended`, { timeout: 8_000 });
    // fastestFee: confirmed in next block. Use halfHourFee if you want slightly cheaper.
    return Math.max(data.fastestFee ?? 10, 2); // floor at 2 sat/vbyte
  } catch {
    return 10; // safe fallback
  }
}

async function getUTXOs(address: string, api: string): Promise<UTXO[]> {
  const { data } = await axios.get(`${api}/address/${address}/utxo`, { timeout: 10_000 });
  return (data as any[]).map(u => ({
    txid: u.txid,
    vout: u.vout,
    value: BigInt(u.value),
    confirmed: !!u.status?.confirmed,
  }));
}

async function broadcastTx(txHex: string, api: string): Promise<string> {
  const { data } = await axios.post(`${api}/tx`, txHex, {
    headers: { 'Content-Type': 'text/plain' },
    timeout: 15_000,
  });
  return data as string; // returns txid
}

// Estimate vbytes for a P2WPKH-to-P2WPKH transaction:
//   overhead: 10 vbytes
//   per input (P2WPKH): 41 non-witness + (1+1+73+1+33)/4 witness ≈ 68 vbytes
//   per output (P2WPKH): 31 vbytes
function estimateVbytes(inputCount: number, outputCount = 1): number {
  return 10 + inputCount * 68 + outputCount * 31;
}

async function sweepBTC(network: string) {
  if (!HOT_WALLET_BTC) {
    console.log(`[btc-sweeper/${network}] HOT_WALLET_BTC_ADDRESS not set — skipping`);
    return;
  }

  const { btcNetwork, api } = NETWORK_CONFIG[network];

  const pending = await prisma.deposit.findMany({
    where: { network, coin: 'BTC', status: 'CREDITED', sweptTx: null },
    include: { depositAddress: { select: { address: true, derivationPath: true } } },
  });

  if (pending.length === 0) return;
  console.log(`[btc-sweeper/${network}] ${pending.length} deposit(s) to sweep`);

  const feeRate = await getFeeRateSatVbyte(api);

  for (const deposit of pending) {
    try {
      const { address, derivationPath } = deposit.depositAddress;
      const allUTXOs = await getUTXOs(address, api);
      const utxos = allUTXOs.filter(u => u.confirmed);

      if (utxos.length === 0) {
        console.log(`  ↳ ${address} — no confirmed UTXOs`);
        continue;
      }

      const totalSats = utxos.reduce((sum, u) => sum + u.value, 0n);
      const vbytes = estimateVbytes(utxos.length, 1);
      const feeSats = BigInt(vbytes) * BigInt(feeRate);
      const sendSats = totalSats - feeSats;

      if (sendSats < DUST_LIMIT_SATS) {
        console.log(
          `  ↳ ${address} — ${totalSats} sat total, ${feeSats} sat fee → ${sendSats} sat remaining is dust, skipping`,
        );
        continue;
      }

      const keyPair = deriveKeyPair(derivationPath, btcNetwork);
      const psbt = new bitcoin.Psbt({ network: btcNetwork });

      // ── CRITICAL: P2WPKH inputs MUST use witnessUtxo, not nonWitnessUtxo ──
      // nonWitnessUtxo (raw previous tx) is for legacy P2PKH. Using it for
      // SegWit will cause most nodes to reject the transaction. witnessUtxo
      // provides just the output being spent (value + scriptPubKey), which
      // is all that's needed to sign a P2WPKH input.
      const p2wpkh = bitcoin.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network: btcNetwork,
      });

      for (const utxo of utxos) {
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          witnessUtxo: {
            script: p2wpkh.output!,
            value: utxo.value,
          },
        });
      }

      psbt.addOutput({ address: HOT_WALLET_BTC, value: sendSats });

      // Sign all inputs with the same key (all UTXOs belong to this one address)
      for (let i = 0; i < utxos.length; i++) {
        psbt.signInput(i, keyPair);
        
        const isValid = psbt.validateSignaturesOfInput(i, (pubkey, msghash, signature) => {
          return keyPair.verify(msghash, signature);
        });

        if (!isValid) {
          throw new Error(`Signature validation failed for input ${i}`);
        }
      }

      psbt.finalizeAllInputs();
      const txHex = psbt.extractTransaction().toHex();
      const txid = await broadcastTx(txHex, api);

      await markDepositSwept(deposit.id, txid);
      console.log(
        `  ✅ BTC swept: ${sendSats} sat (${(Number(sendSats) / 1e8).toFixed(8)} BTC) → ${HOT_WALLET_BTC} | txid: ${txid}`,
      );
    } catch (err: any) {
      console.error(`  ✗ BTC sweep failed for deposit ${deposit.id}:`, err.message);
    }
  }
}

export function startBTCSweeper(network: string, intervalMs = 120_000) {
  if (!NETWORK_CONFIG[network]) throw new Error(`Unknown BTC network: ${network}`);
  console.log(`🧹 BTC Sweeper started: ${network}`);

  const run = async () => {
    try { await sweepBTC(network); }
    catch (err: any) { console.error(`[btc-sweeper/${network}]`, err.message); }
  };

  run();
  setInterval(run, intervalMs);
}