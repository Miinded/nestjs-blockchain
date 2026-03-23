import { TestingModule } from '@nestjs/testing';
import { AuthBlockchainModule, AuthBlockchainAsyncConfig, AuthBlockchainSyncConfig } from './auth-blockchain.module';
import { BLOCKCHAIN_MODULE_OPTIONS, BLOCKCHAIN_USER_SERVICE } from './constants';
import { BlockchainAuthController } from './controllers/blockchain-auth.controller';
import { MyPassportAuthBlockchainStrategy } from './strategy/my-passport-auth-blockchain.strategy';
import { BlockchainJwtStrategy } from './strategy/blockchain-jwt.strategy';
import { IBlockchainAuth } from './interface/IBlockchainAuth.interface';
import { SignatureType } from '@miinded/nestjs-web3-signature';

class MockUserService implements IBlockchainAuth {
  async getOneUserByWallet(wallet: string) {
    return { id: '1', username: 'test', wallet };
  }
  async nonce(_signatureType: SignatureType, _networkId: number, _wallet: string, _uri: string, _message: string) {
    return { nonce: 'test-nonce', issuedAt: '2023-01-01' };
  }
  async get<T>(): Promise<T> {
    return { nonce: 'test-nonce', issuedAt: '2023-01-01' } as T;
  }
}

describe('AuthBlockchainModule', () => {
  let testModule: TestingModule | undefined;

  const mockConfig: AuthBlockchainAsyncConfig = {
    useFactory: () => ({
      domains: ['localhost'],
      token: {
        secret: 'test-secret',
      },
      refreshToken: {
        secret: 'test-refresh-secret',
      },
      chainIds: [1],
      providers: {
        DEFAULT: {
          blockchainAddress: 'http://localhost:8545',
          privateKey: '0xbe6383dad004f233317e46ddb46ad31b16064d14447a95cc1d8c8d4bc61c3728',
        },
      },
    }),
    userService: MockUserService,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    if (testModule) {
      await testModule.close();
    }
  });

  it('should be defined', () => {
    expect(AuthBlockchainModule).toBeDefined();
  });

  it('should register sync module with providers', async () => {
    const syncConfig: AuthBlockchainSyncConfig = {
      domains: ['localhost'],
      token: {
        secret: 'test-secret',
      },
      refreshToken: {
        secret: 'test-refresh-secret',
      },
      chainIds: [1],
      userService: MockUserService,
    };

    const dynamicModule = AuthBlockchainModule.register(syncConfig);

    expect(dynamicModule.module).toBe(AuthBlockchainModule);
    expect(dynamicModule.global).toBe(true);
    expect(dynamicModule.controllers).toContain(BlockchainAuthController);
    expect(dynamicModule.providers).toBeDefined();
    expect(dynamicModule.exports).toBeDefined();
  });

  it('should register async module with providers', async () => {
    const dynamicModule = AuthBlockchainModule.registerAsync(mockConfig);

    expect(dynamicModule.module).toBe(AuthBlockchainModule);
    expect(dynamicModule.global).toBe(true);
    expect(dynamicModule.controllers).toContain(BlockchainAuthController);
    expect(dynamicModule.providers).toBeDefined();
    expect(dynamicModule.exports).toBeDefined();
  });

  it('should have correct module options provider in core module', async () => {
    const dynamicModule = AuthBlockchainModule.registerAsync(mockConfig);
    type Provider = { provide: unknown; useFactory?: unknown };
    type DynModule = { providers?: Provider[] };
    const coreModule = (dynamicModule.imports as DynModule[])?.find(
      (m) => m.providers?.some((p) => p.provide === BLOCKCHAIN_MODULE_OPTIONS),
    );
    expect(coreModule).toBeDefined();
    const optionsProvider = coreModule!.providers?.find((p) => p.provide === BLOCKCHAIN_MODULE_OPTIONS);
    expect(optionsProvider).toBeDefined();
    expect(optionsProvider!.useFactory).toBe(mockConfig.useFactory);
  });

  it('should have user service provider', async () => {
    const dynamicModule = AuthBlockchainModule.registerAsync(mockConfig);
    type P = { provide: unknown };
    const userServiceProvider = dynamicModule.providers?.find((p) => (p as P).provide === BLOCKCHAIN_USER_SERVICE);
    expect(userServiceProvider).toBeDefined();
  });

  it('should have MyPassportAuthBlockchainStrategy provider', async () => {
    const dynamicModule = AuthBlockchainModule.registerAsync(mockConfig);
    type P = { provide: unknown };
    const strategyProvider = dynamicModule.providers?.find(
      (p) => (p as P).provide === MyPassportAuthBlockchainStrategy,
    );
    expect(strategyProvider).toBeDefined();
  });

  it('should have BlockchainJwtStrategy provider', async () => {
    const dynamicModule = AuthBlockchainModule.registerAsync(mockConfig);
    type P = { provide: unknown };
    const jwtStrategyProvider = dynamicModule.providers?.find((p) => (p as P).provide === BlockchainJwtStrategy);
    expect(jwtStrategyProvider).toBeDefined();
  });

  it('should throw error when signature manager not found', async () => {
    const configWithoutProviders: AuthBlockchainAsyncConfig = {
      useFactory: () => ({
        domains: ['localhost'],
        token: { secret: 'test-secret' },
        refreshToken: { secret: 'test-refresh-secret' },
        chainIds: [1],
      }),
      userService: MockUserService,
    };

    const dynamicModule = AuthBlockchainModule.registerAsync(configWithoutProviders);
    expect(dynamicModule).toBeDefined();
  });

  it('should handle empty chainIds', async () => {
    const configWithEmptyChainIds: AuthBlockchainAsyncConfig = {
      useFactory: () => ({
        domains: ['localhost'],
        token: { secret: 'test-secret' },
        refreshToken: { secret: 'test-refresh-secret' },
        chainIds: [],
      }),
      userService: MockUserService,
    };

    const dynamicModule = AuthBlockchainModule.registerAsync(configWithEmptyChainIds);
    expect(dynamicModule).toBeDefined();
  });

  it('should handle undefined chainIds', async () => {
    const configWithoutChainIds: AuthBlockchainAsyncConfig = {
      useFactory: () => ({
        domains: ['localhost'],
        token: { secret: 'test-secret' },
        refreshToken: { secret: 'test-refresh-secret' },
      }),
      userService: MockUserService,
    };

    const dynamicModule = AuthBlockchainModule.registerAsync(configWithoutChainIds);
    expect(dynamicModule).toBeDefined();
  });
});
