import { PassportAuthBlockchainStrategy } from './passport-auth-blockchain.strategy';
import { SignatureManager, SignatureType, ISignature } from '@miinded/nestjs-web3-signature';
import { IBlockchainAuth } from '../interface/IBlockchainAuth.interface';
import { NonceCheckerService } from '../service/nonce-checker.service';
import { UnauthorizedException } from '@nestjs/common';

const VALID_WALLET = '0xEB014f8c8B418Db6b45774c326A0E64C78914dC0';

class MockUserService implements IBlockchainAuth {
  private shouldThrowError: boolean = false;

  setShouldThrowError(value: boolean) {
    this.shouldThrowError = value;
  }

  async getOneUserByWallet(wallet: string) {
    if (this.shouldThrowError) {
      throw new UnauthorizedException('User not found');
    }
    return { id: '1', username: 'test', wallet };
  }
  async nonce() {
    return { nonce: 'test-nonce', issuedAt: '2023-01-01' };
  }
  async get<T>(): Promise<T> {
    return null as T;
  }
}

class MockNonceCheckerService extends NonceCheckerService {
  private shouldThrow: boolean = false;

  constructor() {
    super({} as SignatureManager, {} as IBlockchainAuth);
  }

  setShouldThrow(value: boolean) {
    this.shouldThrow = value;
  }

  async signIsValid(_networkId: string, _domains: string[], _wallet: string, _nonce: string, _signature: string) {
    if (this.shouldThrow) {
      throw new Error('Invalid signature');
    }
    return {} as never;
  }
}

class MockSignatureService implements ISignature<unknown> {
  createSignature(_message: unknown): string {
    return '0xsignature';
  }
  async recoverSignature(_signature: string, _message: unknown): Promise<string> {
    return VALID_WALLET;
  }
  getPublicKey(): string {
    return VALID_WALLET;
  }
}

describe('PassportAuthBlockchainStrategy', () => {
  let strategy: PassportAuthBlockchainStrategy;
  let mockUserService: MockUserService;
  let mockNonceCheckerService: MockNonceCheckerService;
  let mockSignatureManager: SignatureManager;
  let mockSignatureService: MockSignatureService;

  beforeEach(() => {
    mockUserService = new MockUserService();
    mockSignatureService = new MockSignatureService();
    mockNonceCheckerService = new MockNonceCheckerService();
    mockSignatureManager = new SignatureManager();
    mockSignatureManager.register(SignatureType.SIWE, mockSignatureService);
    mockSignatureManager.register(SignatureType.SIMPLE, mockSignatureService);
    mockSignatureManager.register(SignatureType.ADVANCED, mockSignatureService);

    strategy = new PassportAuthBlockchainStrategy(['localhost'], [1], mockUserService, mockNonceCheckerService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should have correct domains', () => {
    expect(strategy.domains).toEqual(['localhost']);
  });

  it('should have correct chainIds', () => {
    expect(strategy.chainIds).toEqual([1]);
  });

  it('should have userService', () => {
    expect(strategy.userService).toBeDefined();
  });

  it('should have nonceCheckerService', () => {
    expect(strategy.nonceCheckerService).toBeDefined();
  });

  describe('authenticate', () => {
    it('should call success when validateUser resolves', (done) => {
      const request = {
        headers: {
          networkid: '1',
          wallet: VALID_WALLET,
          signature: '0xsignature',
          nonce: 'test-nonce',
        },
        user: undefined as unknown,
      };

      (strategy as any).success = (user: unknown) => {
        expect(user).toBeDefined();
        done();
      };
      (strategy as any).fail = () => done.fail('should not fail');

      strategy.authenticate(request);
    });

    it('should call fail with 400 when TypeError is thrown', (done) => {
      const request = {
        headers: {},
      };

      (strategy as any).success = () => done.fail('should not succeed');
      (strategy as any).fail = (_err: unknown, status: number) => {
        expect(status).toBe(400);
        done();
      };

      strategy.authenticate(request);
    });

    it('should call fail with response.statusCode when error has response.statusCode', (done) => {
      const statusError = { response: { statusCode: 403, message: 'Forbidden' } };
      jest.spyOn(strategy, 'validateUser').mockRejectedValueOnce(statusError);

      const request = { headers: {} };

      (strategy as any).success = () => done.fail('should not succeed');
      (strategy as any).fail = (_err: unknown, status: number) => {
        expect(status).toBe(403);
        done();
      };

      strategy.authenticate(request);
    });

    it('should call fail with 400 for generic non-typed error', (done) => {
      const genericError = new Error('generic failure');
      jest.spyOn(strategy, 'validateUser').mockRejectedValueOnce(genericError);

      const request = { headers: {} };

      (strategy as any).success = () => done.fail('should not succeed');
      (strategy as any).fail = (_err: unknown, status: number) => {
        expect(status).toBe(400);
        done();
      };

      strategy.authenticate(request);
    });
  });

  describe('validateUser', () => {
    it('should throw TypeError when networkId is missing', async () => {
      const request = {
        headers: {
          wallet: VALID_WALLET,
          signature: '0xsignature',
          nonce: 'test-nonce',
        },
      };

      await expect(strategy.validateUser(request)).rejects.toThrow(TypeError);
    });

    it('should throw TypeError when signature is missing', async () => {
      const request = {
        headers: {
          networkid: '1',
          wallet: VALID_WALLET,
          nonce: 'test-nonce',
        },
      };

      await expect(strategy.validateUser(request)).rejects.toThrow(TypeError);
    });

    it('should throw TypeError when wallet is missing', async () => {
      const request = {
        headers: {
          networkid: '1',
          signature: '0xsignature',
          nonce: 'test-nonce',
        },
      };

      await expect(strategy.validateUser(request)).rejects.toThrow(TypeError);
    });

    it('should throw TypeError when nonce is missing', async () => {
      const request = {
        headers: {
          networkid: '1',
          wallet: VALID_WALLET,
          signature: '0xsignature',
        },
      };

      await expect(strategy.validateUser(request)).rejects.toThrow(TypeError);
    });

    it('should throw UnauthorizedException when chainId is not allowed', async () => {
      const strategyWithChainIds = new PassportAuthBlockchainStrategy(
        ['localhost'],
        [1, 2],
        mockUserService,
        mockNonceCheckerService,
      );

      const request = {
        headers: {
          networkid: '999',
          wallet: VALID_WALLET,
          signature: '0xsignature',
          nonce: 'test-nonce',
        },
      };

      await expect(strategyWithChainIds.validateUser(request)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when signature is invalid', async () => {
      mockNonceCheckerService.setShouldThrow(true);

      const request = {
        headers: {
          networkid: '1',
          wallet: VALID_WALLET,
          signature: '0xsignature',
          nonce: 'test-nonce',
        },
      };

      await expect(strategy.validateUser(request)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserService.setShouldThrowError(true);

      const request = {
        headers: {
          networkid: '1',
          wallet: VALID_WALLET,
          signature: '0xsignature',
          nonce: 'test-nonce',
        },
      };

      await expect(strategy.validateUser(request)).rejects.toThrow('User not found');
    });

    it('should validate successfully and return user', async () => {
      const request = {
        headers: {
          networkid: '1',
          wallet: VALID_WALLET,
          signature: '0xsignature',
          nonce: 'test-nonce',
        },
      };

      const result = await strategy.validateUser(request);
      expect(result).toBeDefined();
      expect((result as { id: string }).id).toBe('1');
    });

    it('should allow any chainId when chainIds array is empty', async () => {
      const strategyNoChainIds = new PassportAuthBlockchainStrategy(
        ['localhost'],
        [],
        mockUserService,
        mockNonceCheckerService,
      );

      const request = {
        headers: {
          networkid: '999',
          wallet: VALID_WALLET,
          signature: '0xsignature',
          nonce: 'test-nonce',
        },
      };

      const result = await strategyNoChainIds.validateUser(request);
      expect(result).toBeDefined();
    });
  });
});
