import Web3 from 'web3';
import { SignatureManager } from './signature.manager';
import { SignatureType } from './signature.interface';
import OfflineProvider from './offline-provider.service';

const privateKey = '0xbe6383dad004f233317e46ddb46ad31b16064d14447a95cc1d8c8d4bc61c3728';
const btcPrivateKey = 'L1aasbkGDmEFv6BCmKnJR38DLi2xBnj9gExkvXNtEL4NdMUiUVAi';

describe('SignatureManager', () => {
  let web3: Web3;

  beforeAll(() => {
    web3 = new Web3(new OfflineProvider());
  });

  describe('init', () => {
    it('should create an empty manager', () => {
      const manager = SignatureManager.init();
      expect(manager).toBeDefined();
    });
  });

  describe('register and get', () => {
    it('should register and retrieve a service', () => {
      const manager = SignatureManager.init();
      const mockService = {
        createSignature: jest.fn(),
        recoverSignature: jest.fn(),
        getPublicKey: jest.fn(),
      };
      manager.register(SignatureType.SIMPLE, mockService);
      const retrieved = manager.get(SignatureType.SIMPLE);
      expect(retrieved).toBe(mockService);
    });

    it('should throw when getting unregistered service', () => {
      const manager = SignatureManager.init();
      expect(() => manager.get(SignatureType.BIP322)).toThrow(
        `No signature service registered for type: ${SignatureType.BIP322}`,
      );
    });
  });

  describe('fromConfig', () => {
    it('should create manager with all services registered', () => {
      const manager = SignatureManager.fromConfig(web3, privateKey, btcPrivateKey);
      expect(manager.get(SignatureType.SIMPLE)).toBeDefined();
      expect(manager.get(SignatureType.ADVANCED)).toBeDefined();
      expect(manager.get(SignatureType.SIWE)).toBeDefined();
      expect(manager.get(SignatureType.BIP322)).toBeDefined();
      expect(manager.get(SignatureType.CONTRACT)).toBeDefined();
    });

    it('should create manager without private keys', () => {
      const manager = SignatureManager.fromConfig(web3);
      expect(manager.get(SignatureType.SIMPLE)).toBeDefined();
      expect(manager.get(SignatureType.ADVANCED)).toBeDefined();
    });
  });
});
