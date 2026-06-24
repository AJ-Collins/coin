import axios from 'axios';
import {
  SupportedNetwork,
  NETWORK_WEBHOOK_MAP,
  isSupportedNetwork,
} from '../config/networks.js';
import { getConfig } from '../utils/configLoader.js';

export function isEVMNetwork(network: string): network is SupportedNetwork {
  return isSupportedNetwork(network);
}

export async function registerAddressWithAlchemy(address: string | string[], network: string) {
  const authToken = await getConfig('ALCHEMY_AUTH_TOKEN');
  if (!authToken) {
    console.warn(`[Alchemy] ALCHEMY_AUTH_TOKEN not configured — skipping registration`);
    return;
  }

  const webhookKeyMap: Record<string, string> = {
    sepolia:          'ALCHEMY_WEBHOOK_SEPOLIA',
    eth_mainnet:      'ALCHEMY_WEBHOOK_ETH_MAINNET',
    bsc_testnet:      'ALCHEMY_WEBHOOK_BSC_TESTNET',
    polygon_mainnet:  'ALCHEMY_WEBHOOK_POLYGON',
    arbitrum_mainnet: 'ALCHEMY_WEBHOOK_ARBITRUM',
  };

  const webhookKey = webhookKeyMap[network];
  if (!webhookKey) {
    console.warn(`[Alchemy] No webhook key mapping for network: ${network}`);
    return;
  }

  const webhookId = await getConfig(webhookKey);
  if (!webhookId) {
    console.warn(`[Alchemy] ${webhookKey} not configured — skipping`);
    return;
  }

  const addresses = Array.isArray(address) ? address : [address];

  try {
    await axios.patch(
      'https://dashboard.alchemy.com/api/update-webhook-addresses',
      {
        webhook_id: webhookId,
        addresses_to_add: addresses,
        addresses_to_remove: [],
      },
      {
        headers: {
          'X-Alchemy-Token': authToken,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`[Alchemy] Registered ${addresses.length} address(es) on ${network}`);
  } catch (err: any) {
    console.error(
      `[Alchemy] Registration failed on ${network}:`,
      err?.response?.data || err.message
    );
    throw err;
  }
}