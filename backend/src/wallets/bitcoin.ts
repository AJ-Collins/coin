import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';

const bip32 = BIP32Factory(ecc);
const TESTNET = bitcoin.networks.testnet;

export function generateBTCAddress(hdAccountIndex: number, index = 0) {
  const seed = bip39.mnemonicToSeedSync(process.env.MASTER_MNEMONIC!);
  const root = bip32.fromSeed(seed, TESTNET);
  const path = `m/84'/1'/${hdAccountIndex}'/0/${index}`;
  const child = root.derivePath(path);
  const { address } = bitcoin.payments.p2wpkh({
    pubkey: child.publicKey,
    network: TESTNET,
  });
  return {
    address: address!,
    path,
    privateKeyWIF: child.toWIF(),
  };
}