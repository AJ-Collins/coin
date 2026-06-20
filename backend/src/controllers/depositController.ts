import { Request, Response } from 'express';
import { getOrCreateDepositAddress, fetchDepositHistory } from '../services/depositService';

const NETWORK_MAP: Record<string, string> = {
  "ERC20 (Ethereum)":   "sepolia",
  "BEP20 (BSC)":        "bsc_testnet",
  "Native Bitcoin":     "btc_testnet",
  "Lightning Network":  "btc_testnet",
  "Ripple Network":     "xrp_testnet",
  "TRC20 (Tron)":       "tron_mainnet",
  "Polygon":            "polygon_mainnet",
  "Arbitrum":           "arbitrum_mainnet",
  "Arbitrum One":       "arbitrum_mainnet",
  "Optimism":           "optimism_mainnet",
  "Base Network":       "base_mainnet",
  "Solana":             "solana_mainnet",
  "TON Network":        "ton_mainnet",
  "Cardano":            "cardano_mainnet",
  "Avalanche C-Chain":  "avalanche_mainnet",
  "Litecoin":           "litecoin_mainnet",
  "Dogecoin":           "dogecoin_mainnet",
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
      network,           // return the UI label back to frontend
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