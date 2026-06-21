import axios from 'axios';
import {
  SupportedNetwork,
  NETWORK_WEBHOOK_MAP,
  isSupportedNetwork,
} from '../config/networks';

const ALCHEMY_AUTH_TOKEN = process.env.ALCHEMY_AUTH_TOKEN!;

export function isEVMNetwork(network: string): network is SupportedNetwork {
  return isSupportedNetwork(network);
}

export async function registerAddressWithAlchemy(
  address: string | string[],
  network: string
) {
  if (!isSupportedNetwork(network)) {
    console.warn(`[Alchemy] Network not supported: ${network} — skipping registration`);
    return;
  }

  const webhookId = NETWORK_WEBHOOK_MAP[network];
  if (!webhookId) {
    console.warn(`[Alchemy] No webhook ID configured for network: ${network} — skipping`);
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
          'X-Alchemy-Token': ALCHEMY_AUTH_TOKEN,
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