import { SignatureManager, SignatureType, ISignature } from '@miinded/nestjs-web3-signature';
import { NonceCheckerService } from './nonce-checker.service';
import { IBlockchainAuth } from '../interface/IBlockchainAuth.interface';

const VALID_WALLET = '0xEB014f8c8B418Db6b45774c326A0E64C78914dC0';
const VALID_WALLET_LOWER = VALID_WALLET.toLowerCase();

class MockSignatureService implements ISignature<unknown> {
  private recoverResult: string = VALID_WALLET;

  setRecoverResult(value: string) {
    this.recoverResult = value;
  }

  createSignature(_message: unknown): string {
    return '0xsignature';
  }

  async recoverSignature(_signature: string, _message: unknown): Promise<string> {
    return this.recoverResult;
  }

  getPublicKey(): string {
    return VALID_WALLET;
  }
}

type NonceEntry = {
  nonce: string;
  issuedAt: string;
  domain: string;
  uri: string;
  message: any;
  signatureType: SignatureType;
};

class MockUserService implements IBlockchainAuth {
  private cache: Map<string, NonceEntry> = new Map();

  setCache(networkId: number, wallet: string, nonce: string, value: NonceEntry) {
    this.cache.set(`${networkId}:${wallet}:${nonce}`, value);
  }

  async getOneUserByWallet(wallet: string) {
    return { id: '1', username: 'test', wallet };
  }

  async nonce() {
    return { nonce: 'test-nonce', issuedAt: '2023-01-01' };
  }

  async get<T>(networkId: number, wallet: string, nonce: string): Promise<T> {
    return this.cache.get(`${networkId}:${wallet}:${nonce}`) as T;
  }
}

describe('NonceCheckerService', () => {
  let service: NonceCheckerService;
  let mockSignatureService: MockSignatureService;
  let mockUserService: MockUserService;
  let signatureManager: SignatureManager;

  beforeEach(() => {
    mockSignatureService = new MockSignatureService();
    mockUserService = new MockUserService();
    signatureManager = new SignatureManager();
    signatureManager.register(SignatureType.SIMPLE, mockSignatureService);
    signatureManager.register(SignatureType.ADVANCED, mockSignatureService);
    signatureManager.register(SignatureType.SIWE, mockSignatureService);
    signatureManager.register(SignatureType.BIP322, mockSignatureService);

    service = new NonceCheckerService(signatureManager, mockUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIsValid', () => {
    it('should throw when nonce is not found (token expired)', async () => {
      await expect(service.signIsValid('1', ['localhost'], VALID_WALLET, 'unknown-nonce', '0xsig')).rejects.toThrow(
        'Token expired',
      );
    });

    it('should throw when domain is not in allowed list', async () => {
      mockUserService.setCache(1, VALID_WALLET, 'nonce1', {
        nonce: 'nonce1',
        issuedAt: '2023-01-01',
        domain: 'evil.com',
        uri: 'http://localhost',
        message: { message: 'Sign in', wallet: VALID_WALLET },
        signatureType: SignatureType.SIMPLE,
      });

      await expect(service.signIsValid('1', ['localhost'], VALID_WALLET, 'nonce1', '0xsig')).rejects.toThrow(
        'Domain not allowed',
      );
    });

    it('should throw when message is falsy', async () => {
      mockUserService.setCache(1, VALID_WALLET, 'nonce1', {
        nonce: 'nonce1',
        issuedAt: '2023-01-01',
        domain: 'localhost',
        uri: 'http://localhost',
        message: null,
        signatureType: SignatureType.SIMPLE,
      });

      await expect(service.signIsValid('1', ['localhost'], VALID_WALLET, 'nonce1', '0xsig')).rejects.toThrow(
        'Invalid signature',
      );
    });

    it('should throw for unsupported signature type', async () => {
      mockUserService.setCache(1, VALID_WALLET, 'nonce1', {
        nonce: 'nonce1',
        issuedAt: '2023-01-01',
        domain: 'localhost',
        uri: 'http://localhost',
        message: 'some message',
        signatureType: 'UNSUPPORTED' as SignatureType,
      });

      await expect(service.signIsValid('1', ['localhost'], VALID_WALLET, 'nonce1', '0xsig')).rejects.toThrow(
        'No signature service registered for type: UNSUPPORTED',
      );
    });

    it('should throw when recovered wallet does not match', async () => {
      mockSignatureService.setRecoverResult('0xDIFFERENT_WALLET');
      mockUserService.setCache(1, VALID_WALLET, 'nonce1', {
        nonce: 'nonce1',
        issuedAt: '2023-01-01',
        domain: 'localhost',
        uri: 'http://localhost',
        message: { message: 'Sign in with Ethereum to the app.', wallet: VALID_WALLET },
        signatureType: SignatureType.SIMPLE,
      });

      await expect(service.signIsValid('1', ['localhost'], VALID_WALLET, 'nonce1', '0xsig')).rejects.toThrow(
        'Wallet not match',
      );
    });

    it('should return nonce validity for SIMPLE signature type', async () => {
      const entry: NonceEntry = {
        nonce: 'nonce1',
        issuedAt: '2023-01-01',
        domain: 'localhost',
        uri: 'http://localhost',
        message: { message: 'Sign in with Ethereum to the app.', wallet: VALID_WALLET },
        signatureType: SignatureType.SIMPLE,
      };
      mockUserService.setCache(1, VALID_WALLET, 'nonce1', entry);
      mockSignatureService.setRecoverResult(VALID_WALLET_LOWER);

      const result = await service.signIsValid('1', ['localhost'], VALID_WALLET, 'nonce1', '0xsig');
      expect(result).toEqual(entry);
    });

    it('should return nonce validity for ADVANCED signature type', async () => {
      const entry: NonceEntry = {
        nonce: 'nonce1',
        issuedAt: '2023-01-01',
        domain: 'localhost',
        uri: 'http://localhost',
        message: { message: 'Sign in with Ethereum to the app.', wallet: VALID_WALLET },
        signatureType: SignatureType.ADVANCED,
      };
      mockUserService.setCache(1, VALID_WALLET, 'nonce1', entry);
      mockSignatureService.setRecoverResult(VALID_WALLET_LOWER);

      const result = await service.signIsValid('1', ['localhost'], VALID_WALLET, 'nonce1', '0xsig');
      expect(result).toEqual(entry);
    });

    it('should return nonce validity for BIP322 signature type', async () => {
      const entry: NonceEntry = {
        nonce: 'nonce1',
        issuedAt: '2023-01-01',
        domain: 'localhost',
        uri: 'http://localhost',
        message: { message: 'Sign in with Bitcoin to the app.', address: VALID_WALLET },
        signatureType: SignatureType.BIP322,
      };
      mockUserService.setCache(1, VALID_WALLET, 'nonce1', entry);
      mockSignatureService.setRecoverResult(VALID_WALLET_LOWER);

      const result = await service.signIsValid('1', ['localhost'], VALID_WALLET, 'nonce1', '0xsig');
      expect(result).toEqual(entry);
    });

    it('should return nonce validity for SIWE signature type', async () => {
      const siweNonce = 'abcdefgh12345678';
      const entry: NonceEntry = {
        nonce: siweNonce,
        issuedAt: '2023-01-01T00:00:00.000Z',
        domain: 'localhost',
        uri: 'http://localhost',
        message: 'Sign in with Ethereum to the app.',
        signatureType: SignatureType.SIWE,
      };
      mockUserService.setCache(1, VALID_WALLET, siweNonce, entry);
      mockSignatureService.setRecoverResult(VALID_WALLET_LOWER);

      const result = await service.signIsValid('1', ['localhost'], VALID_WALLET, siweNonce, '0xsig');
      expect(result).toEqual(entry);
    });

    it('should accept wallet with different case in recover result', async () => {
      const entry: NonceEntry = {
        nonce: 'nonce1',
        issuedAt: '2023-01-01',
        domain: 'localhost',
        uri: 'http://localhost',
        message: { message: 'Sign in with Ethereum to the app.', wallet: VALID_WALLET },
        signatureType: SignatureType.SIMPLE,
      };
      mockUserService.setCache(1, VALID_WALLET, 'nonce1', entry);
      mockSignatureService.setRecoverResult(VALID_WALLET.toUpperCase());

      const result = await service.signIsValid('1', ['localhost'], VALID_WALLET, 'nonce1', '0xsig');
      expect(result).toEqual(entry);
    });
  });
});
