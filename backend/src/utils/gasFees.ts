import { Prisma } from '@prisma/client';

const GAS_FEES: Record<string, Record<string, number>> = {
  // network → flat USD fee
  erc20:        { base: 5.00 },
  arbitrum:     { base: 0.50 },
  bsc:          { base: 0.20 },
  polygon:      { base: 0.10 },
  tron:         { base: 1.00 },
  solana:       { base: 0.01 },
  bitcoin:      { base: 2.00 },
  bitcoin_segwit: { base: 1.20 },
  litecoin:     { base: 0.30 },
  dogecoin:     { base: 0.50 },
  xrp:          { base: 0.02 },
};

const DEFAULT_FEE = 1.00;

export function calculateGasFee(network: string): Prisma.Decimal {
  const fee = GAS_FEES[network.toLowerCase()]?.base ?? DEFAULT_FEE;
  return new Prisma.Decimal(fee);
}