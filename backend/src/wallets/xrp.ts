import * as bip39 from 'bip39';
import { ethers } from 'ethers';
import { Wallet } from 'xrpl';

export function generateXRPAddress(hdAccountIndex: number, index = 0) {
  const seed = bip39.mnemonicToSeedSync(process.env.MASTER_MNEMONIC!);
  const masterNode = ethers.utils.HDNode.fromSeed(seed);
  const path = `m/44'/144'/${hdAccountIndex}'/0/${index}`;
  const node = masterNode.derivePath(path);
  const xrpWallet = Wallet.fromEntropy(
    Buffer.from(node.privateKey.slice(2), 'hex')
  );
  return {
    address: xrpWallet.classicAddress,
    path,
    secret: xrpWallet.seed,
  };
}