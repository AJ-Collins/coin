import WAValidator from 'multicoin-address-validator';

export class AddressValidator {
  /**
   * Validates crypto addresses using the multicoin-address-validator library,
   * dynamically mapping stablecoins (USDT/USDC) to their target network chains.
   */
  static validate(address: string, coin: string, network: string): boolean {
    const asset = coin.toUpperCase().trim();
    const net = network.toLowerCase().trim();

    // Clean up common typos
    const normalizedAsset = asset === 'EHT' ? 'ETH' : asset;

    // 1. Direct Native Chains
    if (normalizedAsset === 'BTC') {
      return WAValidator.validate(address, 'bitcoin');
    }

    if (normalizedAsset === 'ETH') {
      return WAValidator.validate(address, 'ethereum');
    }

    // 2. Multi-Chain Stablecoins (USDT & USDC)
    // We map the validation to the underlying blockchain architecture being used.
    if (normalizedAsset === 'USDT' || normalizedAsset === 'USDC') {
      
      // TRON Network (TRC-20)
      if (net.includes('trc20') || net.includes('tron')) {
        return WAValidator.validate(address, 'tron');
      }

      // Solana Network (SPL)
      if (net.includes('solana') || net.includes('spl')) {
        return WAValidator.validate(address, 'solana');
      }

      // EVM Networks (ERC-20, BSC, Polygon, Arbitrum, Optimism)
      if (
        net.includes('erc20') || 
        net.includes('ethereum') || 
        net.includes('bsc') || 
        net.includes('binance') || 
        net.includes('polygon') || 
        net.includes('arbitrum') || 
        net.includes('optimism')
      ) {
        return WAValidator.validate(address, 'ethereum');
      }
    }

    // Fail-safe protection for unhandled asset/network combos
    console.warn(`[AddressValidator] Unsupported coin/network pair: ${coin} on ${network}`);
    return false;
  }
}