import { startEVMSweeper }  from '../sweepers/evm-sweeper.js';
import { startERC20Sweeper } from '../sweepers/erc20-sweeper.js';
import { startBTCSweeper }  from '../sweepers/btc-sweeper.js';
import { startSOLSweeper }  from '../sweepers/solana-sweeper.js';
import { startTONSweeper }  from '../sweepers/ton-sweeper.js';
import { startTronSweeper } from '../sweepers/tron-sweeper.js';

const ERC20_NETWORKS: Record<string, string[]> = {
  sepolia:          ['USDT', 'USDC'],
  bsc_testnet:      ['USDT', 'USDC'],
  polygon_mainnet:  ['USDT', 'USDC'],
  arbitrum_mainnet: ['USDT', 'USDC'],
};

const EVM_NETWORKS = [
  'sepolia', 'eth_mainnet', 'bsc_testnet', 'polygon_mainnet', 'arbitrum_mainnet',
];

const INTERVAL = Number(process.env.SWEEP_INTERVAL_MS || 120_000);

// EVM native (ETH/BNB/MATIC) + ERC20 (USDT/USDC)
for (const network of EVM_NETWORKS) {
  startEVMSweeper(network, INTERVAL);
  for (const coin of ERC20_NETWORKS[network] ?? []) {
    startERC20Sweeper(network, coin, INTERVAL);
  }
}

// BTC — mainnet + testnet run as separate sweeper instances
startBTCSweeper('btc_mainnet', INTERVAL);
startBTCSweeper('btc_testnet', INTERVAL);

// Non-EVM single-network chains
startSOLSweeper(INTERVAL);
startTONSweeper(INTERVAL);
startTronSweeper(INTERVAL);

console.log('[SweeperWorker] All sweepers started.');

process.on('SIGTERM', () => {
  console.log('[SweeperWorker] Shutting down gracefully...');
  process.exit(0);
});