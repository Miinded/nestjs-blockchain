import { IBlockchainAuthWallet } from './IBlockchainAuthWallet.interface';
import { IBlockchainCacheService } from './IBlockchainCache.interface';
import { IBlockchainAuthRefresh } from './IBlockchainAuthRefresh.interface';

export type IBlockchainAuth = IBlockchainAuthWallet & IBlockchainCacheService & Partial<IBlockchainAuthRefresh>;
