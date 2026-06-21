export type SupportedNetwork =
  | 'sepolia'
  | 'eth_mainnet'
  | 'bsc_testnet'
  | 'polygon_mainnet'
  | 'arbitrum_mainnet';

export const SUPPORTED_NETWORKS: SupportedNetwork[] = [
  'sepolia',
  'eth_mainnet',
  'bsc_testnet',
  'polygon_mainnet',
  'arbitrum_mainnet',
];

export function isSupportedNetwork(network: string): network is SupportedNetwork {
  return (SUPPORTED_NETWORKS as string[]).includes(network);
}

// Alchemy webhook ID per network. Only these 5 exist — everything else is intentionally absent.
export const NETWORK_WEBHOOK_MAP: Record<SupportedNetwork, string> = {
  sepolia:          process.env.ALCHEMY_WEBHOOK_ID_SEPOLIA!,
  eth_mainnet:      process.env.ALCHEMY_WEBHOOK_ID_ETH!,
  bsc_testnet:      process.env.ALCHEMY_WEBHOOK_ID_BSC!,
  polygon_mainnet:  process.env.ALCHEMY_WEBHOOK_ID_POLYGON!,
  arbitrum_mainnet: process.env.ALCHEMY_WEBHOOK_ID_ARBITRUM!,
};

// Alchemy's network name (as sent in webhook payloads) -> our internal key
export const ALCHEMY_NETWORK_MAP: Record<string, SupportedNetwork> = {
  'ETH_SEPOLIA':   'sepolia',
  'ETH_MAINNET':   'eth_mainnet',
  'BSC_TESTNET':   'bsc_testnet',
  'MATIC_MAINNET': 'polygon_mainnet',
  'ARB_MAINNET':   'arbitrum_mainnet',
};

// Native gas coin per network — used when activity.category is external/internal native transfer
export const NATIVE_COIN: Record<SupportedNetwork, 'ETH' | 'BNB'> = {
  sepolia:          'ETH',
  eth_mainnet:      'ETH',
  bsc_testnet:      'BNB',
  polygon_mainnet:  'ETH', // MATIC isn't priced here; only native ETH/BNB deposits are credited as native coin
  arbitrum_mainnet: 'ETH',
};

// Known ERC-20 contract addresses for stablecoins we accept, per network.
// CRITICAL: webhook handler must check activity.rawContract.address against this list —
// never trust activity.asset (a self-reported string) alone.
// All addresses below are checksummed mainnet/testnet addresses; verify against
// Alchemy/Etherscan docs before deploying to a new network.
export const STABLECOIN_CONTRACTS: Partial<
  Record<SupportedNetwork, Record<string, { symbol: 'USDT' | 'USDC'; decimals: number }>>
> = {
  eth_mainnet: {
    '0xdac17f958d2ee523a2206206994597c13d831ec': { symbol: 'USDT', decimals: 6 },
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': { symbol: 'USDC', decimals: 6 },
  },
  polygon_mainnet: {
    '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': { symbol: 'USDT', decimals: 6 },
    '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359': { symbol: 'USDC', decimals: 6 },
  },
  arbitrum_mainnet: {
    '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': { symbol: 'USDT', decimals: 6 },
    '0xaf88d065e77c8cc2239327c5edb3a432268e5831': { symbol: 'USDC', decimals: 6 },
  },
  bsc_testnet: {
    '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd': { symbol: 'USDT', decimals: 6 },
    '0x64544969Ed7EBf5f083679233325356EbE738930': { symbol: 'USDC', decimals: 6 },
  },
  sepolia: {
    '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0': { symbol: 'USDT', decimals: 6 },
    '0x6175c3e839f2A00616DAEd87498e369f3eaa4999': { symbol: 'USDC', decimals: 6 },
  },
};