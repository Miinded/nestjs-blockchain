import { IBlockchainAuthWallet } from './IBlockchainAuthWallet.interface';
import { IBlockchainCacheService } from './IBlockchainCache.interface';

export type IBlockchainAuth = IBlockchainAuthWallet & IBlockchainCacheService;
