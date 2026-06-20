import { prisma } from '../prisma';
import { Coin } from '@prisma/client';
import { generateEVMAddress } from '../wallets/evm';
import { generateBTCAddress } from '../wallets/bitcoin';
import { generateXRPAddress } from '../wallets/xrp';
import { generateTronAddress } from '../wallets/tron';
import { generateSolanaAddress } from '../wallets/solana';
import { generateLitecoinAddress } from '../wallets/litecoin';
import { generateDogecoinAddress } from '../wallets/dogecoin';
import { generateTONAddress } from '../wallets/ton';

type GeneratorType = 'evm' | 'btc' | 'xrp' | 'tron' | 'solana' | 'ltc' | 'doge' | 'ton';

const NETWORK_TYPE: Record<string, GeneratorType> = {
  sepolia:          'evm',
  eth_mainnet:      'evm',
  bsc_testnet:      'evm',
  bsc_mainnet:      'evm',
  polygon_mainnet:  'evm',
  arbitrum_mainnet: 'evm',
  optimism_mainnet: 'evm',
  base_mainnet:     'evm',
  btc_testnet:      'btc',
  btc_mainnet:      'btc',
  xrp_testnet:      'xrp',
  xrp_mainnet:      'xrp',
  tron_mainnet:     'tron',
  solana_mainnet:   'solana',
  litecoin_mainnet: 'ltc',
  dogecoin_mainnet: 'doge',
  ton_mainnet:      'ton',
};

const VALID_NETWORKS: Record<string, string[]> = {
  ETH:  ['sepolia', 'eth_mainnet', 'arbitrum_mainnet', 'optimism_mainnet', 'base_mainnet'],
  USDT: ['sepolia', 'bsc_testnet', 'tron_mainnet', 'polygon_mainnet', 'arbitrum_mainnet', 'optimism_mainnet'],
  USDC: ['sepolia', 'bsc_testnet', 'tron_mainnet', 'polygon_mainnet', 'arbitrum_mainnet', 'base_mainnet'],
  BNB:  ['bsc_testnet', 'bsc_mainnet'],
  BTC:  ['btc_testnet', 'btc_mainnet'],
  XRP:  ['xrp_testnet', 'xrp_mainnet'],
  SOL:  ['solana_mainnet'],
  TRX:  ['tron_mainnet'],
  TON:  ['ton_mainnet'],
  LTC:  ['litecoin_mainnet'],
  DOGE: ['dogecoin_mainnet'],
};

async function runGenerator(
  generatorType: GeneratorType,
  index: number
): Promise<{ address: string; path: string }> {
  switch (generatorType) {
    case 'evm':    return generateEVMAddress(index);
    case 'btc':    return generateBTCAddress(index);
    case 'xrp':    return generateXRPAddress(index);
    case 'tron':   return generateTronAddress(index);
    case 'solana': return generateSolanaAddress(index);
    case 'ltc':    return generateLitecoinAddress(index);
    case 'doge':   return generateDogecoinAddress(index);
    case 'ton':    return generateTONAddress(index);
  }
}

export async function getOrCreateDepositAddress(userId: string, coin: string, network: string) {
  const coinUpper = coin.toUpperCase() as Coin;

  if (!VALID_NETWORKS[coinUpper]) {
    throw new Error(`Unsupported coin: ${coin}`);
  }
  if (!VALID_NETWORKS[coinUpper].includes(network)) {
    throw new Error(`${coin} not supported on ${network}`);
  }

  const generatorType = NETWORK_TYPE[network];
  if (!generatorType) {
    throw new Error(`No address generator configured for network: ${network}`);
  }

  // Return existing address if already generated
  const existing = await prisma.depositAddress.findUnique({
    where: { userId_coin_network: { userId, coin: coinUpper, network } },
  });
  if (existing) {
    return { address: existing.address, coin: coinUpper, network, reused: true };
  }

  // Fetch HD index for deterministic derivation
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { hdAccountIndex: true },
  });
  if (!user) throw new Error('User not found');

  const result = await runGenerator(generatorType, user.hdAccountIndex);

  await prisma.depositAddress.create({
    data: {
      userId,
      coin: coinUpper,
      network,
      address: result.address,
      derivationPath: result.path,
    },
  });

  return { address: result.address, coin: coinUpper, network, reused: false };
}

export async function creditDeposit(
  txHash: string,
  userId: string,
  coin: Coin,
  network: string,
  amountCrypto: number,
  usdValue: number
) {
  // Idempotent — skip if already recorded
  const existing = await prisma.deposit.findUnique({ where: { txHash } });
  if (existing) return null;

  const depositAddress = await prisma.depositAddress.findUnique({
    where: { userId_coin_network: { userId, coin, network } },
  });
  if (!depositAddress) throw new Error('Deposit address not found');

  const [deposit] = await prisma.$transaction([
    prisma.deposit.create({
      data: {
        userId,
        depositAddressId: depositAddress.id,
        coin,
        network,
        txHash,
        amount: amountCrypto,
        usdValueAtCredit: usdValue,
        status: 'CREDITED',
        creditedAt: new Date(),
      },
    }),
    prisma.account.update({
      where: { userId_type: { userId, type: 'REAL' } },
      data: { balance: { increment: usdValue } },
    }),
  ]);

  return deposit;
}

export async function markDepositSwept(depositId: string, sweptTx: string) {
  return prisma.deposit.update({
    where: { id: depositId },
    data: { status: 'SWEPT', sweptTx, sweptAt: new Date() },
  });
}

export async function fetchDepositHistory(userId: string) {
  return prisma.deposit.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      coin: true,
      network: true,
      amount: true,
      usdValueAtCredit: true,
      status: true,
      txHash: true,
      createdAt: true,
    },
  });
}