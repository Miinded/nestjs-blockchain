import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { HttpServiceFactory } from './service/http-service.factory';
import { EtherscanService } from './service/etherscan.service';
import { AbstractBlockchainManager } from '@miinded/nestjs-blockchain-core';

export type EtherscanApiOption = {
  apiUrl: string;
  apiKey: string;
  blockchainAddress: string;
};

export type Web3EtherscanAsyncConfig = {
  isGlobal?: boolean;
  useFactory: (...args: any[]) => Promise<Web3EtherscanConfig> | Web3EtherscanConfig;
  inject?: any[];
} & Pick<ModuleMetadata, 'imports'>;

export const WEB3_ETHERSCAN_MODULE_OPTIONS = 'Web3EtherscanModuleOptions';
export const WEB3_BLOCKCHAINS_MANAGER = 'Web3BlockchainsManager';
export const WEB3_ETHERSCAN_MANAGER = 'Web3EtherscanManager';
export const WEB3_ETHERSCAN_HTTP_MANAGER = 'Web3EtherscanHttpManager';

export const WEB3_ETHERSCAN_EVENT_MANAGER = 'Web3EtherscanEventManager';

export type Web3EtherscanConfig = AbstractBlockchainManager<EtherscanApiOption>;

export type HTTPManager = AbstractBlockchainManager<HttpService>;
export type EtherscanManager = AbstractBlockchainManager<EtherscanService>;

export type Web3EtherscanSyncConfig = {
  isGlobal?: boolean;
} & Web3EtherscanConfig;

@Module({})
export class Web3EtherscanModule {
  static register(options: Web3EtherscanSyncConfig): DynamicModule {
    const { isGlobal, ...config } = options;
    return Web3EtherscanModule.registerAsync({
      useFactory: () => config,
      isGlobal,
    });
  }

  static registerAsync(options: Web3EtherscanAsyncConfig): DynamicModule {
    const providers = [
      HttpServiceFactory,
      {
        provide: WEB3_ETHERSCAN_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
      {
        provide: WEB3_BLOCKCHAINS_MANAGER,
        useFactory: (configManager: Web3EtherscanConfig) => {
          return Object.keys(configManager);
        },
        inject: [WEB3_ETHERSCAN_MODULE_OPTIONS],
      },
      {
        provide: WEB3_ETHERSCAN_HTTP_MANAGER,
        useFactory: (httpFactory: HttpServiceFactory, etherscanManager: Web3EtherscanConfig) => {
          const manager: HTTPManager = {};
          for (const blockchain of Object.keys(etherscanManager)) {
            const config = etherscanManager[blockchain];
            if (!config) continue;
            const httpService = httpFactory.createHttpService(config.apiUrl, config.apiKey);
            manager[blockchain] = httpService;
          }
          return manager;
        },
        inject: [HttpServiceFactory, WEB3_ETHERSCAN_MODULE_OPTIONS],
      },
      {
        provide: WEB3_ETHERSCAN_MANAGER,
        useFactory: (httpManager: HTTPManager, configManager: Web3EtherscanConfig) => {
          const manager: EtherscanManager = {};
          for (const blockchain of Object.keys(httpManager)) {
            const httpService = httpManager[blockchain];
            const config = configManager[blockchain];
            if (httpService && config) {
              manager[blockchain] = new EtherscanService(httpService, config.blockchainAddress);
            }
          }
          return manager;
        },
        inject: [WEB3_ETHERSCAN_HTTP_MANAGER, WEB3_ETHERSCAN_MODULE_OPTIONS],
      },
    ];

    return {
      module: Web3EtherscanModule,
      global: options?.isGlobal ?? true,
      imports: [...(options?.imports || [])],
      providers,
      exports: [...providers],
    };
  }
}
