import { Request, Response } from 'express';
import { getOrCreateDepositAddress, fetchDepositHistory } from '../services/depositService.js';

// UI label -> internal network key. Only the 5 networks with real Alchemy webhooks.
const NETWORK_MAP: Record<string, string> = {
  // EVM — Alchemy webhook detection
  'Ethereum (Sepolia testnet)': 'sepolia',
  'Ethereum':                   'eth_mainnet',
  'BSC (testnet)':              'bsc_testnet',
  'Polygon':                    'polygon_mainnet',
  'Arbitrum One':               'arbitrum_mainnet',
  // BTC — mempool.space polling
  'Bitcoin':                    'btc_mainnet',
  'Bitcoin (testnet)':          'btc_testnet',
  // Non-EVM — polling listeners
  'Solana':                     'solana_mainnet',
  'TON':                        'ton_mainnet',
  'Tron':                       'tron_mainnet',
  // New chains
  'XRP Ledger':                 'xrp_mainnet',
  'Litecoin':                   'ltc_mainnet',
  'Dogecoin':                   'doge_mainnet',
};

export async function generateDepositAddress(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { coin, network } = req.body;
    if (!coin || !network) {
      return res.status(400).json({ message: 'coin and network are required' });
    }
    const internalNetwork = NETWORK_MAP[network];
    if (!internalNetwork) {
      return res.status(400).json({ message: `Unsupported network: ${network}` });
    }
    const result = await getOrCreateDepositAddress(userId, coin, internalNetwork);
    return res.json({
      address: result.address,
      coin: result.coin,
      network,
      reused: result.reused,
      expiresInSeconds: 3600,
    });
  } catch (err: any) {
    console.error('generateDepositAddress error:', err);
    const status = err.message.includes('Unsupported') || err.message.includes('not supported') ? 400 : 500;
    return res.status(status).json({ message: err.message });
  }
}

export async function getDepositHistory(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const deposits = await fetchDepositHistory(userId);
    return res.json(deposits);
  } catch (err) {
    console.error('getDepositHistory error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}