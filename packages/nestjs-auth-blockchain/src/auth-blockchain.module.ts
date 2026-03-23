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
import { BlockchainRefreshTokenStrategy } from './strategy/blockchain-refresh-token.strategy';
import { NonceCheckerService } from './service/nonce-checker.service';
import { IBlockchainAuthRefresh } from './interface/IBlockchainAuthRefresh.interface';

export type AuthBlockchainSignature = AbstractProviderManager<ContractServiceOptions>;

export type JwtTransport = 'header' | 'cookie';

export type JwtTokenOptions = JwtModuleOptions & {
  transport?: JwtTransport;
  cookieName?: string;
};

export type JWTConfig = {
  token: JwtTokenOptions;
  refreshToken: JwtTokenOptions;
};

export type AuthBlockchainConfig = {
  providers?: AuthBlockchainSignature;
  chainIds?: number[];
  domains: string[];
} & JWTConfig;

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
          return new MyPassportAuthBlockchainStrategy(config.domains, chainIds, userService, nonceCheckerService);
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
          return new BlockchainJwtStrategy(config.token);
        },
        inject: [BLOCKCHAIN_MODULE_OPTIONS],
      },
      {
        provide: BlockchainRefreshTokenStrategy,
        useFactory: (config: AuthBlockchainConfig, userService: IBlockchainAuth) => {
          const refreshUserService = userService as IBlockchainAuthRefresh;
          return new BlockchainRefreshTokenStrategy(config.refreshToken, refreshUserService);
        },
        inject: [BLOCKCHAIN_MODULE_OPTIONS, BLOCKCHAIN_USER_SERVICE],
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
            return config.token;
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
