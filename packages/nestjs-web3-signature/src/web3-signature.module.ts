import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { SignatureManager as Registry } from './service/signature.manager';
import Web3 from 'web3';
import { OfflineProvider } from './service';
import { AbstractProviderManager } from '@miinded/nestjs-blockchain-core';
export { SiweMessage, SiweResponse, SiweError, SiweErrorType, VerifyParams, VerifyParamsKeys } from 'siwe';
export { SignatureType, SignatureTypeMap, BIP322Message } from './service/signature.interface';

export type ContractServiceOptions = {
  blockchainAddress?: string;
  privateKey?: string;
  privateKeyBtc?: string;
};

export type Web3SignatureAsyncConfig = {
  isGlobal?: boolean;
  name?: string;
  useFactory?: (...args: any[]) => Promise<Web3SignatureConfig> | Web3SignatureConfig;
  inject?: any[];
} & Pick<ModuleMetadata, 'imports'>;

export const WEB3_SIGNATURE_MODULE_OPTIONS = 'Web3SignatureOptions';
export const WEB3_BLOCKCHAINS_MANAGER = 'Web3BlockchainsManager';
export const WEB3_SIGNATURE_REGISTRY = 'Web3SignatureManager';

export type Web3SignatureConfig = AbstractProviderManager<ContractServiceOptions>;

export type SignatureRegistry = AbstractProviderManager<Registry>;

const getWeb3 = async (blockchainAddress?: string) => {
  if (blockchainAddress) {
    return new Web3(new Web3.providers.HttpProvider(blockchainAddress));
  }
  return new Web3(new OfflineProvider());
};
export const DEFAULT_SIGNATURE_MANAGER = { DEFAULT: {} };
export type Web3SignatureSyncConfig = {
  isGlobal?: boolean;
  name?: string;
} & Web3SignatureConfig;

@Module({})
export class Web3SignatureModule {
  static register(options: Web3SignatureSyncConfig): DynamicModule {
    const { isGlobal, name, ...config } = options;
    return Web3SignatureModule.registerAsync({
      isGlobal,
      name,
      useFactory: () => config,
    });
  }

  static registerAsync(options: Web3SignatureAsyncConfig): DynamicModule {
    const providers = [
      OfflineProvider,
      {
        provide: WEB3_SIGNATURE_MODULE_OPTIONS,
        useFactory: options.useFactory ?? (() => DEFAULT_SIGNATURE_MANAGER),
        inject: options.inject || [],
      },
      {
        provide: WEB3_BLOCKCHAINS_MANAGER,
        useFactory: (configManager: Web3SignatureConfig) => {
          return Object.keys(configManager);
        },
        inject: [WEB3_SIGNATURE_MODULE_OPTIONS],
      },
      {
        provide: WEB3_SIGNATURE_REGISTRY,
        useFactory: async (configManager: Web3SignatureConfig) => {
          const registry: SignatureRegistry = {};
          for (const provider of Object.keys(configManager)) {
            const config = configManager[provider] ?? {};
            const web3 = await getWeb3(config.blockchainAddress);
            registry[provider] = Registry.fromConfig(web3, config.privateKey, config.privateKeyBtc);
          }
          return registry;
        },
        inject: [WEB3_SIGNATURE_MODULE_OPTIONS],
      },
    ];
    return {
      module: Web3SignatureModule,
      global: options.isGlobal,
      imports: [...(options?.imports || [])],
      providers,
      exports: [...providers],
    };
  }
}
