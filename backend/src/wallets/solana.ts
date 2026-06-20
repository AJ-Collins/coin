import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { Keypair } from '@solana/web3.js';

export function generateSolanaAddress(hdAccountIndex: number, index = 0) {
  const seed = bip39.mnemonicToSeedSync(process.env.MASTER_MNEMONIC!);
  const path = `m/44'/501'/${hdAccountIndex}'/0'`;
  const { key } = derivePath(path, seed.toString('hex'));
  const keypair = Keypair.fromSeed(key);
  return {
    address: keypair.publicKey.toBase58(),
    path,
    privateKey: Buffer.from(keypair.secretKey).toString('hex'),
  };
}