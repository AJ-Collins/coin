import * as bip39 from 'bip39';
import { ethers } from 'ethers';

export function generateEVMAddress(hdAccountIndex: number, index = 0) {
  const seed = bip39.mnemonicToSeedSync(process.env.MASTER_MNEMONIC!);
  const masterNode = ethers.utils.HDNode.fromSeed(seed);
  const path = `m/44'/60'/${hdAccountIndex}'/0/${index}`;
  const node = masterNode.derivePath(path);
  return {
    address: node.address,
    path,
    privateKey: node.privateKey, // never expose, server-side sweep only
  };
}