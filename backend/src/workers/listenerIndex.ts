import { startBTCListener }    from '../listeners/btc-listener.js';
import { startSolanaListener } from '../listeners/solana-listener.js';
import { startTONListener }    from '../listeners/ton-listener.js';
import { startTronListener }   from '../listeners/tron-listener.js';

// EVM chains are NOT listed here — they're detected by Alchemy webhooks
// (push-based), which is more reliable and faster than polling for EVM.
// These listeners cover only the chains Alchemy doesn't support.

startBTCListener('btc_mainnet', 60_000);
startBTCListener('btc_testnet', 60_000);
startSolanaListener(15_000);  // Helius free tier handles this rate fine
startTONListener(30_000);     // Toncenter free tier: ~1 req/s, so 3 addresses/poll
startTronListener(15_000);    // TronGrid free tier handles this rate fine

console.log('[ListenerWorker] All block listeners started.');

process.on('SIGTERM', () => {
  process.exit(0);
});