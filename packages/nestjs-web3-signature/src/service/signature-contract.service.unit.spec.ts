import Web3 from 'web3';
import { SignatureContractService } from './signature-contract.service';
import OfflineProvider from './offline-provider.service';

const privateKey = '0xbe6383dad004f233317e46ddb46ad31b16064d14447a95cc1d8c8d4bc61c3728';
const publicKey = '0xEB014f8c8B418Db6b45774c326A0E64C78914dC0';

describe('SignatureContractService', () => {
  let service: SignatureContractService;
  let serviceWithoutKey: SignatureContractService;
  let web3: Web3;

  beforeAll(() => {
    web3 = new Web3(new OfflineProvider());
    service = new SignatureContractService(web3, privateKey);
    serviceWithoutKey = new SignatureContractService(web3);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSignature', () => {
    it('should throw when private key is not defined', () => {
      expect(() => serviceWithoutKey.createSignature({ wallet: 'test' })).toThrow('Private key is not defined');
    });

    it('should throw when sha3 returns null', () => {
      const mockWeb3 = { utils: { sha3: jest.fn().mockReturnValue(null) }, eth: { accounts: {} } } as any;
      const svc = new SignatureContractService(mockWeb3, privateKey);
      expect(() => svc.createSignature('test')).toThrow('Invalid hex message.');
    });

    it('should create a signature from object', () => {
      const result = service.createSignature({ wallet: '0x1b4a2aeb47CbD6CF0868e6BF8Ed878C77Dba0149', nonce: 'abc' });
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^0x/);
    });

    it('should create a signature from string', () => {
      const result = service.createSignature('hello world');
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^0x/);
    });
  });

  describe('recoverSignature', () => {
    it('should throw when sha3 returns null', async () => {
      const mockWeb3 = { utils: { sha3: jest.fn().mockReturnValue(null) }, eth: { accounts: {} } } as any;
      const svc = new SignatureContractService(mockWeb3, privateKey);
      await expect(svc.recoverSignature('0xsig', 'test')).rejects.toThrow('Invalid message hash.');
    });

    it('should recover address from object signature', async () => {
      const message = { wallet: '0x1b4a2aeb47CbD6CF0868e6BF8Ed878C77Dba0149', nonce: 'abc' };
      const signature = service.createSignature(message);
      const result = await service.recoverSignature(signature, message);
      expect(result).toBe(publicKey);
    });

    it('should recover address from string signature', async () => {
      const message = 'hello world';
      const signature = service.createSignature(message);
      const result = await service.recoverSignature(signature, message);
      expect(result).toBe(publicKey);
    });
  });

  describe('getPublicKey', () => {
    it('should throw when private key is not defined', () => {
      expect(() => serviceWithoutKey.getPublicKey()).toThrow('Private key is not defined');
    });

    it('should return the public key', () => {
      const result = service.getPublicKey();
      expect(result).toBe(publicKey);
    });
  });
});
