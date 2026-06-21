import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import { prisma } from '../prisma';
import { markDepositSwept } from '../services/depositService';

const RPC_MAP: Record<string, string | undefined> = {
  sepolia:          process.env.SEPOLIA_RPC,
  eth_mainnet:      process.env.ETH_MAINNET_RPC,
  bsc_testnet:      process.env.BSC_TESTNET_RPC,
  polygon_mainnet:  process.env.POLYGON_MAINNET_RPC,
  arbitrum_mainnet: process.env.ARBITRUM_MAINNET_RPC,
};

const HOT_WALLET = process.env.HOT_WALLET_ADDRESS
  ? ethers.utils.getAddress(process.env.HOT_WALLET_ADDRESS)
  : null;

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
];

// Fill in real token contract addresses per network/coin
const TOKEN_CONTRACTS: Record<string, Record<string, string>> = {
  sepolia: {
    USDT: process.env.SEPOLIA_USDT_CONTRACT || '',
    USDC: process.env.SEPOLIA_USDC_CONTRACT || '',
  },
  bsc_testnet: {
    USDT: process.env.BSC_TESTNET_USDT_CONTRACT || '',
    USDC: process.env.BSC_TESTNET_USDC_CONTRACT || '',
  },
  polygon_mainnet: {
    USDT: process.env.POLYGON_USDT_CONTRACT || '',
    USDC: process.env.POLYGON_USDC_CONTRACT || '',
  },
  arbitrum_mainnet: {
    USDT: process.env.ARBITRUM_USDT_CONTRACT || '',
    USDC: process.env.ARBITRUM_USDC_CONTRACT || '',
  },
};

function getPrivateKeyForPath(derivationPath: string) {
  const seed = bip39.mnemonicToSeedSync(process.env.MASTER_MNEMONIC!);
  return ethers.utils.HDNode.fromSeed(seed).derivePath(derivationPath).privateKey;
}

async function sweepERC20(network: string, coin: string) {
  if (!HOT_WALLET) {
    console.log(`[sweeper/${network}/${coin}] HOT_WALLET_ADDRESS not set — skipping`);
    return;
  }
  const hotWalletPK = process.env.HOT_WALLET_PRIVATE_KEY;
  if (!hotWalletPK) {
    console.log(`[sweeper/${network}/${coin}] HOT_WALLET_PRIVATE_KEY not set — skipping`);
    return;
  }

  const contractAddress = TOKEN_CONTRACTS[network]?.[coin];
  if (!contractAddress) return;

  const rpcUrl = RPC_MAP[network];
  if (!rpcUrl) return;

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const tokenContract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
  const decimals = await tokenContract.decimals();

  const pending = await prisma.deposit.findMany({
    where: { network, coin: coin as any, status: 'CREDITED', sweptTx: null },
    include: { depositAddress: { select: { address: true, derivationPath: true } } },
  });

  if (pending.length === 0) return;
  console.log(`[sweeper/${network}/${coin}] ${pending.length} token sweep(s) pending`);

  const gasWallet = new ethers.Wallet(hotWalletPK, provider);

  for (const deposit of pending) {
    try {
      const address = deposit.depositAddress.address;
      const tokenBalance = await tokenContract.balanceOf(address);
      if (tokenBalance.eq(0)) continue;

      const humanAmount = parseFloat(ethers.utils.formatUnits(tokenBalance, decimals));
      console.log(`  ↳ Sweeping ${humanAmount} ${coin} from ${address}`);

      const gasPrice = await provider.getGasPrice();
      const gasNeeded = gasPrice.mul(65000);

      const fundTx = await gasWallet.sendTransaction({ to: address, value: gasNeeded });
      await fundTx.wait(1);

      const depositWallet = new ethers.Wallet(getPrivateKeyForPath(deposit.depositAddress.derivationPath), provider);
      const tokenWithSigner = tokenContract.connect(depositWallet);

      const transferTx = await tokenWithSigner.transfer(HOT_WALLET, tokenBalance, {
        gasLimit: 65000,
        gasPrice,
      });
      await transferTx.wait(1);

      await markDepositSwept(deposit.id, transferTx.hash);

      console.log(`  ✅ Token sweep complete: ${transferTx.hash}`);
    } catch (err: any) {
      console.error(`  ✗ Token sweep failed ${deposit.id}:`, err.message);
    }
  }
}

export async function startERC20Sweeper(network: string, coin: string, intervalMs = 120_000) {
  console.log(`🧹 ERC20 Sweeper started: ${coin} on ${network}`);
  const run = async () => {
    try { await sweepERC20(network, coin); }
    catch (err: any) { console.error(`[sweeper/${network}/${coin}]`, err.message); }
  };
  await run();
  setInterval(run, intervalMs);
}