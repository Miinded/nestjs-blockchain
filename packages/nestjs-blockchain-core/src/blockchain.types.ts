/**
 * Generic manager type for blockchain-related resources.
 * Used to organize resources by blockchain network identifier.
 */
export type AbstractBlockchainManager<T> = { [blockchain: string]: T };

/**
 * Generic manager type for provider-related resources.
 * Used to organize resources by provider name.
 */
export type AbstractProviderManager<T> = { [provider: string]: T };

/**
 * Categories used to classify blockchain errors across all adapters.
 */
export type BlockchainErrorCategory =
  | 'not_found'
  | 'permission'
  | 'timeout'
  | 'rate_limit'
  | 'validation'
  | 'unavailable'
  | 'invalid_signature'
  | 'chain_not_allowed';

/**
 * Base error class for all blockchain provider errors.
 *
 * Each adapter extends this class with a provider-specific name
 * (e.g. `Web3ProviderError`, `EtherscanProviderError`).
 */
export abstract class BlockchainProviderError extends Error {
  /** Identifier of the blockchain backend (e.g. `'web3'`, `'etherscan'`). */
  abstract readonly provider: string;

  /**
   * @param operation - The adapter method that failed (e.g. `'sendTransaction'`)
   * @param category - Classified error category
   * @param originalError - The raw error thrown by the underlying SDK
   */
  constructor(
    public readonly operation: string,
    public readonly category: BlockchainErrorCategory,
    public readonly originalError: unknown,
  ) {
    super(`Blockchain ${operation} failed (${category})`);
    this.name = 'BlockchainProviderError';
  }
}
