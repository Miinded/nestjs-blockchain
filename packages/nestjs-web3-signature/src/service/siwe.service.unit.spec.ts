import { Test, TestingModule } from '@nestjs/testing';
import Web3 from 'web3';

import { SiweMessage } from 'siwe';
import { SiweService } from './siwe.service';
import OfflineProvider from './offline-provider.service';

// WARNING: This is a test private key. DO NOT use in production!
const privateKey = '0xbe6383dad004f233317e46ddb46ad31b16064d14447a95cc1d8c8d4bc61c3728';
const publicKey = '0xEB014f8c8B418Db6b45774c326A0E64C78914dC0';

const createSignatureInTest = (message: SiweMessage) => {
  const web3 = new Web3(new OfflineProvider());
  const signature = web3.eth.accounts.sign(message.prepareMessage(), privateKey);
  return signature.signature;
};

describe('SiweService', () => {
  let service: SiweService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        {
          provide: SiweService,
          useFactory: () => {
            const web3 = new Web3(new OfflineProvider());
            return new SiweService(web3, privateKey);
          },
        },
      ],
    }).compile();

    service = module.get<SiweService>(SiweService);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should use createSignature method with object', () => {
    const wallet = publicKey;
    const signatureMessage = createSignatureInTest(
      new SiweMessage({
        domain: 'localhost:3000',
        address: wallet,
        statement: "I don't understand",
        uri: 'http://localhost:3000',
        version: '1',
        chainId: 1,
        nonce: '0123456789',
        issuedAt: '2023-12-11T08:15:07.083Z',
      }),
    );

    const result = service.createSignature(
      new SiweMessage({
        domain: 'localhost:3000',
        address: wallet,
        statement: "I don't understand",
        uri: 'http://localhost:3000',
        version: '1',
        chainId: 1,
        nonce: '0123456789',
        issuedAt: '2023-12-11T08:15:07.083Z',
      }),
    );
    expect(result).toEqual(signatureMessage);
  });

  it('should throw when createSignature is called without privateKey', () => {
    const web3 = new Web3(new OfflineProvider());
    const svcNoKey = new SiweService(web3);
    const message = new SiweMessage({
      domain: 'localhost:3000',
      address: publicKey,
      statement: 'test',
      uri: 'http://localhost:3000',
      version: '1',
      chainId: 1,
      nonce: '0123456789',
      issuedAt: '2023-12-11T08:15:07.083Z',
    });
    expect(() => svcNoKey.createSignature(message)).toThrow('Private key is not defined');
  });

  it('should use recoverSignature method with object', async () => {
    const signature =
      '0x7b5353a56c376100f935ff7da6bb9307049828e47541dfcf7cb17ab75a98cefe384bb7dd2dc0ac8f5f374630f3aadc5c3ac8fefa5209a1e06cb8d11e129283861b';
    const wallet = publicKey;
    const result = await service.recoverSignature(
      signature,
      new SiweMessage({
        domain: 'localhost:3000',
        address: wallet,
        statement: "I don't understand",
        uri: 'http://localhost:3000',
        version: '1',
        chainId: 1,
        nonce: '0123456789',
        issuedAt: '2023-12-11T08:15:07.083Z',
      }),
    );

    expect(result).toBe(publicKey);
  });
});
