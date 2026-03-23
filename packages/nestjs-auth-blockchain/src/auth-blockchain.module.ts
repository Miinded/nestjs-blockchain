import { ClassProvider, DynamicModule, Module, Provider, Type, ModuleMetadata } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MyPassportAuthBlockchainStrategy } from './strategy/my-passport-auth-blockchain.strategy';
import { BlockchainAuthController } from './controllers/blockchain-auth.controller';
import { IBlockchainAuth } from './interface/IBlockchainAuth.interface';
import {
  Web3SignatureModule,
  WEB3_SIGNATURE_REGISTRY,
  SignatureRegistry,
  DEFAULT_SIGNATURE_MANAGER,
  Web3SignatureConfig,
  ContractServiceOptions,
} from '@miinded/nestjs-web3-signature';
import { AbstractProviderManager } from '@miinded/nestjs-blockchain-core';
import { BLOCKCHAIN_MODULE_OPTIONS, BLOCKCHAIN_USER_SERVICE } from './constants';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { BlockchainJwtStrategy } from './strategy/blockchain-jwt.strategy';
import { NonceCheckerService } from './service/nonce-checker.service';

export type AuthBlockchainSignature = AbstractProviderManager<ContractServiceOptions>;

export type AuthBlockchainConfig = {
  providers?: AuthBlockchainSignature;
  chainIds?: number[];
  // Legacy support - domain can be string or array
  domain?: string | string[];
  domains?: string[];
  secret?: string;
  token?: {
    secret: string;
    signOptions?: {
      expiresIn?: string;
    };
  };
  refreshToken?: {
    secret: string;
    signOptions?: {
      expiresIn?: string;
    };
  };
};

export type AuthBlockchainAsyncConfig = {
  isGlobal?: boolean;
  name?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory: (...args: any[]) => Promise<AuthBlockchainConfig> | AuthBlockchainConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inject?: any[];
  userService: Type<IBlockchainAuth>;
} & Pick<ModuleMetadata, 'imports'>;

export type AuthBlockchainSyncConfig = {
  isGlobal?: boolean;
  userService: Type<IBlockchainAuth>;
} & AuthBlockchainConfig;

@Module({})
class AuthBlockchainCoreModule {}

@Module({})
export class AuthBlockchainModule {
  static register(options: AuthBlockchainSyncConfig): DynamicModule {
    const { isGlobal, userService, ...config } = options;
    return AuthBlockchainModule.registerAsync({
      useFactory: () => config,
      userService,
      isGlobal,
    });
  }

  static registerAsync(options: AuthBlockchainAsyncConfig): DynamicModule {
    const coreModule = AuthBlockchainModule.createCoreModule(options);

    const providers: Provider[] = [
      {
        provide: NonceCheckerService,
        useFactory: (signatureRegistry: SignatureRegistry, userService: IBlockchainAuth) => {
          const signatureManager = signatureRegistry['DEFAULT'];
          if (!signatureManager) {
            throw new Error('Signature manager not found');
          }
          return new NonceCheckerService(signatureManager, userService);
        },
        inject: [WEB3_SIGNATURE_REGISTRY, BLOCKCHAIN_USER_SERVICE],
      },
      {
        provide: MyPassportAuthBlockchainStrategy,
        useFactory: (
          config: AuthBlockchainConfig,
          userService: IBlockchainAuth,
          nonceCheckerService: NonceCheckerService,
        ) => {
          const chainIds = config?.chainIds || [];
          // Support legacy domains/domain and new format
          const domains = config.domains || (config.domain ? (Array.isArray(config.domain) ? config.domain : [config.domain]) : []);
          return new MyPassportAuthBlockchainStrategy(domains, chainIds, userService, nonceCheckerService);
        },
        inject: [BLOCKCHAIN_MODULE_OPTIONS, BLOCKCHAIN_USER_SERVICE, NonceCheckerService],
      },
      {
        provide: BLOCKCHAIN_USER_SERVICE,
        useClass: options.userService,
      } as ClassProvider<IBlockchainAuth>,
      {
        provide: BlockchainJwtStrategy,
        useFactory: (config: AuthBlockchainConfig) => {
          // Support legacy token.secret and new secret
          const secret = config.token?.secret || config.secret || '';
          return new BlockchainJwtStrategy(secret);
        },
        inject: [BLOCKCHAIN_MODULE_OPTIONS],
      },
    ];

    return {
      module: AuthBlockchainModule,
      global: options?.isGlobal ?? true,
      controllers: [BlockchainAuthController],
      imports: [
        ...(options?.imports || []),
        coreModule,
        PassportModule,
        Web3SignatureModule.registerAsync({
          isGlobal: false,
          imports: [coreModule],
          useFactory: (config: AuthBlockchainConfig) => {
            const configuration: Web3SignatureConfig = { ...DEFAULT_SIGNATURE_MANAGER };
            if (config.providers) {
              for (const provider of Object.keys(config.providers)) {
                const providerConfig = config.providers[provider] ?? {};
                configuration[provider] = {
                  blockchainAddress: providerConfig.blockchainAddress,
                  privateKey: providerConfig.privateKey,
                };
              }
            }
            return configuration;
          },
          inject: [BLOCKCHAIN_MODULE_OPTIONS],
        }),
        JwtModule.registerAsync({
          global: true,
          imports: [coreModule],
          useFactory: (config: AuthBlockchainConfig) => {
            // Support legacy token config and new secret
            const secret = config.token?.secret || config.secret || '';
            const expiresIn = config.token?.signOptions?.expiresIn || '2d';
            return {
              secret,
              signOptions: { expiresIn },
            } as JwtModuleOptions;
          },
          inject: [BLOCKCHAIN_MODULE_OPTIONS],
        }),
      ],
      providers,
      exports: [...providers],
    };
  }

  private static createCoreModule(options: AuthBlockchainAsyncConfig): DynamicModule {
    return {
      module: AuthBlockchainCoreModule,
      providers: [
        {
          provide: BLOCKCHAIN_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ],
      exports: [BLOCKCHAIN_MODULE_OPTIONS],
    };
  }
}
