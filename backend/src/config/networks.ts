export const SUPPORTED_NETWORKS = [
  'eth_mainnet',
  'bsc_mainnet',
  'polygon_mainnet',
  'arbitrum_mainnet',
  'btc_mainnet',
  'solana_mainnet',
  'ton_mainnet',
  'tron_mainnet',
] as const;

export type SupportedNetwork = typeof SUPPORTED_NETWORKS[number];

export function isSupportedNetwork(n: string): n is SupportedNetwork {
  return (SUPPORTED_NETWORKS as readonly string[]).includes(n);
}

export const NATIVE_COIN: Record<SupportedNetwork, string> = {
  eth_mainnet:      'ETH',
  bsc_mainnet:      'BNB',
  polygon_mainnet:  'MATIC',
  arbitrum_mainnet: 'ETH',
  btc_mainnet:      'BTC',
  solana_mainnet:   'SOL',
  ton_mainnet:      'TON',
  tron_mainnet:     'TRX',
};

// Alchemy covers EVM chains only
export const ALCHEMY_NETWORK_MAP: Record<string, SupportedNetwork> = {
  'ETH_MAINNET':   'eth_mainnet',
  'BSC_MAINNET':   'bsc_mainnet',
  'MATIC_MAINNET': 'polygon_mainnet',
  'ARB_MAINNET':   'arbitrum_mainnet',
};

export const NETWORK_WEBHOOK_MAP: Partial<Record<SupportedNetwork, string>> = {
  eth_mainnet:      process.env.ALCHEMY_WEBHOOK_ETH_MAINNET,
  bsc_mainnet:      process.env.ALCHEMY_WEBHOOK_BSC_MAINNET,
  polygon_mainnet:  process.env.ALCHEMY_WEBHOOK_POLYGON,
  arbitrum_mainnet: process.env.ALCHEMY_WEBHOOK_ARBITRUM,
};

export const STABLECOIN_CONTRACTS: Partial<Record<SupportedNetwork, Record<string, { symbol: string; decimals: number }>>> = {
  eth_mainnet: {
    [process.env.ETH_USDT_CONTRACT?.toLowerCase() || '']: { symbol: 'USDT', decimals: 6 },
    [process.env.ETH_USDC_CONTRACT?.toLowerCase() || '']: { symbol: 'USDC', decimals: 6 },
  },
  bsc_mainnet: {
    // Note: BEP20 tokens on BSC natively use 18 decimals
    [process.env.BSC_USDT_CONTRACT?.toLowerCase() || '']: { symbol: 'USDT', decimals: 18 },
    [process.env.BSC_USDC_CONTRACT?.toLowerCase() || '']: { symbol: 'USDC', decimals: 18 },
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