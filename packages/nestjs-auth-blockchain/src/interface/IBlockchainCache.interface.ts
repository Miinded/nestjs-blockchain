export interface IBlockchainCacheService {
  get<T>(networkId: number, wallet: string, nonce: string): Promise<T>;
}
