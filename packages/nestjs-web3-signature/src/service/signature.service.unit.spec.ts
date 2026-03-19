import { Test, TestingModule } from '@nestjs/testing';
import Web3 from 'web3';
import { SignatureService } from './signature.service';
import * as crypto from 'crypto';
import OfflineProvider from './offline-provider.service';

// WARNING: This is a test private key. DO NOT use in production!
const privateKey = '0xbe6383dad004f233317e46ddb46ad31b16064d14447a95cc1d8c8d4bc61c3728';
const publicKey = '0xEB014f8c8B418Db6b45774c326A0E64C78914dC0';

const createSignatureInTest = (message: unknown) => {
  const web3 = new Web3(new OfflineProvider());
  const hexMessage = web3.utils.sha3(JSON.stringify(message));
  if (!hexMessage) throw new Error('Invalid hex message');
  const signature = web3.eth.accounts.sign(hexMessage, privateKey);
  return signature.signature;
};

describe('SignatureService', () => {
  let service: SignatureService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        {
          provide: SignatureService,
          useFactory: () => {
            const web3 = new Web3(new OfflineProvider());
            return new SignatureService(web3, privateKey);
          },
        },
      ],
    }).compile();

    service = module.get<SignatureService>(SignatureService);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should use createSignature method with object', () => {
    const nonce = crypto.randomBytes(16).toString('hex');
    const wallet = '0x1b4a2aeb47CbD6CF0868e6BF8Ed878C77Dba0149';
    const signature = createSignatureInTest({
      wallet,
      nonce,
    });
    const result = service.createSignature({
      wallet,
      nonce,
    });
    expect(result).toEqual(signature);
  });

  it('should use recoverSignature method with object', async () => {
    const signature =
      '0xf034d6ef33865ff42e12a17f259660ec8bd2916709cf41a76e5f34e758a91ff6378ddac467ab1faa5ca1fe883b0386449998b90bf07a7d8e48e6a3b6cd54f4041c';
    const nonce = 'fb5f569b3dba9f307ba27a2a2e077aae';
    const wallet = '0x1b4a2aeb47CbD6CF0868e6BF8Ed878C77Dba0149';
    const result = await service.recoverSignature(signature, {
      wallet,
      nonce,
    });

    expect(result).toBe(publicKey);
  });

  it('should use createSignature method with string', () => {
    const message = 'My message';
    const signature = createSignatureInTest(message);
    const result = service.createSignature(message);
    expect(result).toEqual(signature);
  });

  it('should use recoverSignature method with string', async () => {
    const message = 'My message';
    const signature =
      '0x9dcfe07cc854e64f1440da86818fdc366f2d5daef99847bd347a84cf2e0c0c521391a5d7babc8076fa898018d6660b77168776cc169e1c539e1b90411db361561c';
    const result = await service.recoverSignature(signature, message);
    expect(result).toBe(publicKey);
  });

  describe('error handling', () => {
    let serviceWithoutKey: SignatureService;
    let web3Instance: Web3;

    beforeAll(() => {
      web3Instance = new Web3(new OfflineProvider());
      serviceWithoutKey = new SignatureService(web3Instance);
    });

    it('should throw when createSignature is called without privateKey', () => {
      expect(() => serviceWithoutKey.createSignature('test')).toThrow('Private key is not defined');
    });

    it('should throw when sha3 returns null on createSignature', () => {
      const mockWeb3 = { utils: { sha3: jest.fn().mockReturnValue(null) }, eth: { accounts: {} } } as any;
      const svc = new SignatureService(mockWeb3, '0xbe6383dad004f233317e46ddb46ad31b16064d14447a95cc1d8c8d4bc61c3728');
      expect(() => svc.createSignature('test')).toThrow('Invalid hex message.');
    });

    it('should throw when sha3 returns null on recoverSignature', async () => {
      const mockWeb3 = { utils: { sha3: jest.fn().mockReturnValue(null) }, eth: { accounts: {} } } as any;
      const svc = new SignatureService(mockWeb3, '0xbe6383dad004f233317e46ddb46ad31b16064d14447a95cc1d8c8d4bc61c3728');
      await expect(svc.recoverSignature('0xsig', 'test')).rejects.toThrow('Invalid message hash.');
    });
  });
});
