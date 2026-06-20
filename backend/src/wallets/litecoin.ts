import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';

const bip32 = BIP32Factory(ecc);

const LITECOIN_MAINNET: bitcoin.Network = {
  messagePrefix: '\x19Litecoin Signed Message:\n',
  bech32: 'ltc',
  bip32: { public: 0x019da462, private: 0x019d9cfe },
  pubKeyHash: 0x30,
  scriptHash: 0x32,
  wif: 0xb0,
};

export function generateLitecoinAddress(hdAccountIndex: number, index = 0) {
  const seed = bip39.mnemonicToSeedSync(process.env.MASTER_MNEMONIC!);
  const root = bip32.fromSeed(seed, LITECOIN_MAINNET);
  const path = `m/44'/2'/${hdAccountIndex}'/0/${index}`;
  const child = root.derivePath(path);
  const { address } = bitcoin.payments.p2pkh({
    pubkey: child.publicKey,
    network: LITECOIN_MAINNET,
  });
  return {
    address: address!,
    path,
    privateKeyWIF: child.toWIF(),
  };
}