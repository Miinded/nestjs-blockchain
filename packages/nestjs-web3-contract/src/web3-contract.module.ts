import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { ContractAbi } from 'web3-types';
import { Contract } from 'web3-eth-contract';
import Web3 from 'web3';
import { ERC20Service } from './service/erc20.service';
import { ERC721Service } from './service/erc721.service';
import { ERC1155Service } from './service/erc1155.service';
import { BaseContractService } from './service/base-contract.service';
import { ContractManager as Registry } from './service/contract.manager';
import { AbstractBlockchainManager } from '@miinded/nestjs-blockchain-core';

export const ercs = ['ERC20', 'ERC721', 'ERC1155'] as const;
export type Erc = (typeof ercs)[number];

export type ContractConfig = ContractConfigCreation | ContractConfigCustom;

export type ContractConfigCreation = {
  name: string;
  contractAddress: string;
  contractType: Erc | 'custom';
  abi?: ContractAbi;
};

export type ContractConfigCustom = Pick<ContractConfigCreation, 'name' | 'abi' | 'contractAddress'> & {
  contractType: 'custom';
  contractCustom: BaseContractService;
};

export type ContractOption = {
  blockchainAddress: string;
  contracts?: ContractConfig[];
};

export type Web3ContractAsyncConfig = {
  isGlobal?: boolean;
  useFactory: (...args: any[]) => Promise<Web3ContractConfig> | Web3ContractConfig;
  inject?: any[];
} & Pick<ModuleMetadata, 'imports'>;

export const WEB3_CONTRACT_MODULE_OPTIONS = 'Web3ContractModuleOptions';
export const WEB3_BLOCKCHAINS_MANAGER = 'Web3BlockchainsManager';
export const WEB3_CONTRACT_MANAGER = 'Web3ContractManager';

export type Web3ContractConfig = AbstractBlockchainManager<ContractOption>;

export type ContractRegistry = AbstractBlockchainManager<Registry>;

const getWeb3 = async (blockchainAddress: string) => {
  const url = new URL(blockchainAddress);
  if (url.protocol === 'wss:') {
    return new Web3(new Web3.providers.WebsocketProvider(blockchainAddress));
  }
  return new Web3(new Web3.providers.HttpProvider(blockchainAddress));
};

export type Web3ContractSyncConfig = {
  isGlobal?: boolean;
} & Web3ContractConfig;

@Module({})
export class Web3ContractModule {
  static register(options: Web3ContractSyncConfig): DynamicModule {
    const { isGlobal, ...config } = options;
    return Web3ContractModule.registerAsync({
      useFactory: () => config,
      isGlobal,
    });
  }

  static registerAsync(options: Web3ContractAsyncConfig): DynamicModule {
    const providers = [
      {
        provide: WEB3_CONTRACT_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
      {
        provide: WEB3_BLOCKCHAINS_MANAGER,
        useFactory: (configManager: Web3ContractConfig) => {
          return Object.keys(configManager);
        },
        inject: [WEB3_CONTRACT_MODULE_OPTIONS],
      },
      {
        provide: WEB3_CONTRACT_MANAGER,
        useFactory: async (configManager: Web3ContractConfig) => {
          const manager: ContractRegistry = {};
          for (const blockchain of Object.keys(configManager)) {
            manager[blockchain] = Registry.init();
            const blockchainConfig = configManager[blockchain];
            if (!blockchainConfig) continue;

            const web3 = await getWeb3(blockchainConfig.blockchainAddress);

            for (const contract of blockchainConfig.contracts ?? []) {
              if (!contract.abi) {
                throw new Error('Abi missing');
              }
              const contractInstance = new web3.eth.Contract(contract.abi, contract.contractAddress);
              let service: BaseContractService | null = null;
              switch (contract.contractType) {
                case 'ERC20':
                  service = new ERC20Service();
                  break;
                case 'ERC721':
                  service = new ERC721Service();
                  break;
                case 'ERC1155':
                  service = new ERC1155Service();
                  break;
                case 'custom':
                  service = (contract as ContractConfigCustom).contractCustom;
                  break;
              }
              if (!service) {
                continue;
              }
              service.setWeb3(web3);
              service.setContract(contractInstance as unknown as Contract<ContractAbi>);
              manager[blockchain].register(contract.name, service);
            }
          }
          return manager;
        },
        inject: [WEB3_CONTRACT_MODULE_OPTIONS],
      },
    ];

    return {
      module: Web3ContractModule,
      global: options?.isGlobal ?? true,
      imports: [...(options?.imports || [])],
      providers,
      exports: [...providers],
    };
  }
}
