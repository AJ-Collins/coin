import * as bip39 from 'bip39';
import { ethers } from 'ethers';
import { TronWeb } from 'tronweb';

export function generateTronAddress(hdAccountIndex: number, index = 0) {
  const seed = bip39.mnemonicToSeedSync(process.env.MASTER_MNEMONIC!);
  const masterNode = ethers.utils.HDNode.fromSeed(seed);
  const path = `m/44'/195'/${hdAccountIndex}'/0/${index}`;
  const node = masterNode.derivePath(path);

  const address = TronWeb.address.fromPrivateKey(node.privateKey.slice(2));
  if (!address) throw new Error(`Failed to generate Tron address for index ${hdAccountIndex}`);

  return {
    address,
    path,
    privateKey: node.privateKey,
  };
}