import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { Coin } from '@prisma/client';
import { generateEVMAddress } from '../wallets/evm';
import { registerAddressWithAlchemy, isEVMNetwork } from '../webhooks/alchemyWebhook';
import { SupportedNetwork, SUPPORTED_NETWORKS } from '../config/networks';

type GeneratorType = 'evm';

// Only EVM networks are supported right now — all 5 configured networks use the same generator.
const NETWORK_TYPE: Record<SupportedNetwork, GeneratorType> = {
  sepolia:          'evm',
  eth_mainnet:      'evm',
  bsc_testnet:      'evm',
  polygon_mainnet:  'evm',
  arbitrum_mainnet: 'evm',
};

const VALID_NETWORKS: Record<string, SupportedNetwork[]> = {
  ETH:  ['sepolia', 'eth_mainnet', 'arbitrum_mainnet'],
  USDT: ['sepolia', 'bsc_testnet', 'polygon_mainnet', 'arbitrum_mainnet'],
  USDC: ['sepolia', 'bsc_testnet', 'polygon_mainnet', 'arbitrum_mainnet'],
  BNB:  ['bsc_testnet'],
};

async function runGenerator(generatorType: GeneratorType, index: number) {
  switch (generatorType) {
    case 'evm': return generateEVMAddress(index);
  }
}

export async function getOrCreateDepositAddress(
  userId: string,
  coin: string,
  network: string
) {
  const coinUpper = coin.toUpperCase() as Coin;

  if (!SUPPORTED_NETWORKS.includes(network as SupportedNetwork)) {
    throw new Error(`Unsupported network: ${network}`);
  }
  const supportedNetwork = network as SupportedNetwork;

  if (!VALID_NETWORKS[coinUpper]) {
    throw new Error(`Unsupported coin: ${coin}`);
  }
  if (!VALID_NETWORKS[coinUpper].includes(supportedNetwork)) {
    throw new Error(`${coin} not supported on ${network}`);
  }

  const generatorType = NETWORK_TYPE[supportedNetwork];

  const existing = await prisma.depositAddress.findUnique({
    where: { userId_coin_network: { userId, coin: coinUpper, network } },
  });
  if (existing) {
    return { address: existing.address, coin: coinUpper, network, reused: true };
  }

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

  if (isEVMNetwork(network)) {
    registerAddressWithAlchemy(result.address, network).catch(err =>
      console.error(`[Alchemy] Background registration failed for ${result.address}:`, err.message)
    );
  }

  return { address: result.address, coin: coinUpper, network, reused: false };
}

/**
 * Fix #6: rely on the database's unique constraint on txHash as the real
 * idempotency guard, instead of a check-then-act read (which races under
 * concurrent webhook deliveries). Prisma error P2002 = unique violation.
 */
export async function creditDeposit(
  txHash: string,
  userId: string,
  coin: Coin,
  network: string,
  amountCrypto: number,
  usdValue: number
) {
  const depositAddress = await prisma.depositAddress.findUnique({
    where: { userId_coin_network: { userId, coin, network } },
  });
  if (!depositAddress) throw new Error('Deposit address not found');

  try {
    const [deposit] = await prisma.$transaction([
      prisma.deposit.create({
        data: {
          userId,
          depositAddressId: depositAddress.id,
          coin,
          network,
          txHash, // must have a @unique constraint in schema.prisma
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
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      // Another concurrent webhook delivery already inserted this txHash first.
      // This is the expected, race-safe outcome — not an error.
      console.log(`[creditDeposit] Duplicate txHash ${txHash} caught by unique constraint — skipping`);
      return null;
    }
    throw err;
  }
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
      id: true, coin: true, network: true, amount: true,
      usdValueAtCredit: true, status: true, txHash: true, createdAt: true,
    },
  });
}

export async function syncExistingAddressesWithAlchemy() {
  const addresses = await prisma.depositAddress.findMany({
    where: { network: { in: SUPPORTED_NETWORKS } },
    select: { address: true, network: true },
  });

  if (addresses.length === 0) {
    console.log('[Alchemy] No existing EVM addresses to sync');
    return;
  }

  console.log(`[Alchemy] Syncing ${addresses.length} existing addresses...`);

  const byNetwork: Record<string, string[]> = {};
  for (const a of addresses) {
    (byNetwork[a.network] ??= []).push(a.address);
  }

  for (const [network, addrs] of Object.entries(byNetwork)) {
    try {
      await registerAddressWithAlchemy(addrs, network);
      console.log(`[Alchemy] Synced ${addrs.length} addresses on ${network}`);
    } catch (err: any) {
      console.error(`[Alchemy] Sync failed for ${network}:`, err.message);
    }
  }
}