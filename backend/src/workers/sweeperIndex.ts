// Run this as its OWN process (not inside your main API server, and not
// inside the deposit-worker process):
//   node dist/workers/sweeperIndex.js
//
// This process holds HOT_WALLET_PRIVATE_KEY and MASTER_MNEMONIC in memory
// and signs/broadcasts real transactions. Keeping it isolated from the
// internet-facing API process limits blast radius if that process is ever
// compromised — same reasoning as why deposit-worker is its own process.

import { startEVMSweeper } from '../sweepers/evm-sweeper';
import { startERC20Sweeper } from '../sweepers/erc20-sweeper';
import { SUPPORTED_NETWORKS } from '../config/networks';

// Coins to sweep as ERC20 tokens, per network — must match TOKEN_CONTRACTS
// in erc20Sweeper.ts. If a contract address isn't configured for a given
// network/coin pair, that sweeper just no-ops on every tick (see the
// `if (!contractAddress) return;` guard already in erc20Sweeper.ts), so
// listing a few extra harmless pairs here is safe.
const ERC20_NETWORKS: Record<string, string[]> = {
  sepolia:          ['USDT', 'USDC'],
  bsc_testnet:      ['USDT', 'USDC'],
  polygon_mainnet:  ['USDT', 'USDC'],
  arbitrum_mainnet: ['USDT', 'USDC'],
};

const SWEEP_INTERVAL_MS = Number(process.env.SWEEP_INTERVAL_MS || 120_000);

console.log('[SweeperWorker] Starting sweepers for networks:', SUPPORTED_NETWORKS);

for (const network of SUPPORTED_NETWORKS) {
  // Native coin sweep (ETH/BNB) — every supported network has exactly one.
  startEVMSweeper(network, SWEEP_INTERVAL_MS);

  // Token sweeps — one sweeper per (network, coin) pair.
  const coins = ERC20_NETWORKS[network] ?? [];
  for (const coin of coins) {
    startERC20Sweeper(network, coin, SWEEP_INTERVAL_MS);
  }
}

console.log('[SweeperWorker] All sweepers started.');

process.on('SIGTERM', () => {
  console.log('[SweeperWorker] Shutting down gracefully...');
  // Note: startEVMSweeper/startERC20Sweeper currently use setInterval with
  // no returned handle, so there's nothing to clearInterval() here yet.
  // In-flight sweeps (broadcast but unconfirmed txs) will just be picked
  // up again on next process start since sweptTx is still null — safe,
  // not duplicate-unsafe, because nothing marks SWEPT until confirmed.
  process.exit(0);
});