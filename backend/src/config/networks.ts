export const SUPPORTED_NETWORKS = [
  'sepolia',
  'eth_mainnet',
  'bsc_testnet',
  'polygon_mainnet',
  'arbitrum_mainnet',
  'btc_mainnet',
  'btc_testnet',
  'solana_mainnet',
  'ton_mainnet',
  'tron_mainnet',
  'xrp_mainnet',
  'ltc_mainnet',
  'doge_mainnet',
] as const;

export type SupportedNetwork = typeof SUPPORTED_NETWORKS[number];

export function isSupportedNetwork(n: string): n is SupportedNetwork {
  return (SUPPORTED_NETWORKS as readonly string[]).includes(n);
}

export const NATIVE_COIN: Record<SupportedNetwork, string> = {
  sepolia:          'ETH',
  eth_mainnet:      'ETH',
  bsc_testnet:      'BNB',
  polygon_mainnet:  'MATIC',
  arbitrum_mainnet: 'ETH',
  btc_mainnet:      'BTC',
  btc_testnet:      'BTC',
  solana_mainnet:   'SOL',
  ton_mainnet:      'TON',
  tron_mainnet:     'TRX',
  xrp_mainnet:      'XRP',
  ltc_mainnet:      'LTC',
  doge_mainnet:     'DOGE',
};

// Alchemy covers EVM chains only
export const ALCHEMY_NETWORK_MAP: Record<string, SupportedNetwork> = {
  'ETH_SEPOLIA':   'sepolia',
  'ETH_MAINNET':   'eth_mainnet',
  'BSC_TESTNET':   'bsc_testnet',
  'MATIC_MAINNET': 'polygon_mainnet',
  'ARB_MAINNET':   'arbitrum_mainnet',
};

export const NETWORK_WEBHOOK_MAP: Partial<Record<SupportedNetwork, string>> = {
  sepolia:          process.env.ALCHEMY_WEBHOOK_SEPOLIA,
  eth_mainnet:      process.env.ALCHEMY_WEBHOOK_ETH_MAINNET,
  bsc_testnet:      process.env.ALCHEMY_WEBHOOK_BSC_TESTNET,
  polygon_mainnet:  process.env.ALCHEMY_WEBHOOK_POLYGON,
  arbitrum_mainnet: process.env.ALCHEMY_WEBHOOK_ARBITRUM,
};

export const STABLECOIN_CONTRACTS: Partial<Record<SupportedNetwork, Record<string, { symbol: string; decimals: number }>>> = {
  sepolia: {
    [process.env.SEPOLIA_USDT_CONTRACT?.toLowerCase() || '']: { symbol: 'USDT', decimals: 6 },
    [process.env.SEPOLIA_USDC_CONTRACT?.toLowerCase() || '']: { symbol: 'USDC', decimals: 6 },
  },
  bsc_testnet: {
    [process.env.BSC_TESTNET_USDT_CONTRACT?.toLowerCase() || '']: { symbol: 'USDT', decimals: 18 },
    [process.env.BSC_TESTNET_USDC_CONTRACT?.toLowerCase() || '']: { symbol: 'USDC', decimals: 18 },
  },
  polygon_mainnet: {
    [process.env.POLYGON_USDT_CONTRACT?.toLowerCase() || '']: { symbol: 'USDT', decimals: 6 },
    [process.env.POLYGON_USDC_CONTRACT?.toLowerCase() || '']: { symbol: 'USDC', decimals: 6 },
  },
  arbitrum_mainnet: {
    [process.env.ARBITRUM_USDT_CONTRACT?.toLowerCase() || '']: { symbol: 'USDT', decimals: 6 },
    [process.env.ARBITRUM_USDC_CONTRACT?.toLowerCase() || '']: { symbol: 'USDC', decimals: 6 },
  },
};