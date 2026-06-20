import * as bip39 from 'bip39';
import { ethers } from 'ethers';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { WalletContractV4 } from '@ton/ton';

export async function generateTONAddress(hdAccountIndex: number) {
  const seed = bip39.mnemonicToSeedSync(process.env.MASTER_MNEMONIC!);
  const masterNode = ethers.utils.HDNode.fromSeed(seed);
  const path = `m/44'/607'/${hdAccountIndex}'/0/0`;
  const node = masterNode.derivePath(path);

  // Convert derived private key bytes into a TON keypair
  const privateKeyBytes = Buffer.from(node.privateKey.slice(2), 'hex');
  const keyPair = await mnemonicToPrivateKey(
    bip39.entropyToMnemonic(privateKeyBytes.slice(0, 16)).split(' ')
  );

  const wallet = WalletContractV4.create({
    workchain: 0,
    publicKey: keyPair.publicKey,
  });

  return {
    address: wallet.address.toString({ bounceable: false }),
    path,
    privateKey: Buffer.from(keyPair.secretKey).toString('hex'),
  };
}