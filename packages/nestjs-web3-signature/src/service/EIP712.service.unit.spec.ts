import { Test, TestingModule } from '@nestjs/testing';
import Web3 from 'web3';
import { EIP712Service } from './EIP712.service';
import { signTypedData, SignTypedDataVersion } from '@metamask/eth-sig-util';
import OfflineProvider from './offline-provider.service';

// WARNING: This is a test private key. DO NOT use in production!
const privateKey = '0xbe6383dad004f233317e46ddb46ad31b16064d14447a95cc1d8c8d4bc61c3728';
const publicKey = '0xEB014f8c8B418Db6b45774c326A0E64C78914dC0';

const createSignatureInTest = (message: unknown, networkId: number, contractName: string, contractAddress: string) => {
  const messageTyped = {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      Content: [
        { name: 'message', type: 'string' },
        { name: 'owner', type: 'address' },
        { name: 'items', type: 'string[]' },
      ],
    },
    primaryType: 'Content',
    domain: {
      name: contractName,
      version: '1',
      chainId: networkId,
      verifyingContract: contractAddress,
    },
    message,
  };
  const pkBuffer = Buffer.from(privateKey.replace('0x', ''), 'hex');
  return signTypedData({
    privateKey: pkBuffer,
    data: messageTyped as any,
    version: SignTypedDataVersion.V4,
  });
};

describe('EIP712Service', () => {
  let service: EIP712Service;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        {
          provide: EIP712Service,
          useFactory: () => {
            const web3 = new Web3(new OfflineProvider());
            return new EIP712Service(web3, privateKey);
          },
        },
      ],
    }).compile();

    service = module.get<EIP712Service>(EIP712Service);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should use createSignature method with object', () => {
    const wallet = '0x1b4a2aeb47CbD6CF0868e6BF8Ed878C77Dba0149';
    const signature = createSignatureInTest(
      {
        message: 'I want to burn my items:',
        owner: wallet,
        items: ['1', ' 2', ' 3', '4'],
      },
      1,
      'cfx',
      '0x0001',
    );

    const typedMessage = service.generateTypedMessage(
      {
        Content: [
          { name: 'message', type: 'string' },
          { name: 'owner', type: 'address' },
          { name: 'items', type: 'string[]' },
        ],
      },
      'Content',
      {
        message: 'I want to burn my items:',
        owner: wallet,
        items: ['1', ' 2', ' 3', '4'],
      },
      1,
      'cfx',
      '0x0001',
    );

    const result = service.createSignature(typedMessage);
    expect(result).toEqual(signature);
  });

  it('should throw when createSignature is called without privateKey', () => {
    const web3 = new Web3(new OfflineProvider());
    const svcNoKey = new EIP712Service(web3);
    const typedMessage = svcNoKey.generateTypedMessage(
      { Content: [{ name: 'message', type: 'string' }] },
      'Content',
      { message: 'test' },
      1,
      'test',
      '0x0001',
    );
    expect(() => svcNoKey.createSignature(typedMessage)).toThrow('Private key is not defined');
  });

  it('should use recoverSignature method with object', async () => {
    const wallet = '0x1b4a2aeb47CbD6CF0868e6BF8Ed878C77Dba0149';
    const signature = createSignatureInTest(
      {
        message: 'I want to burn my items:',
        owner: wallet,
        items: ['1', ' 2', ' 3', '4'],
      },
      1,
      'cfx',
      '0x0001',
    );
    const message = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Content: [
          { name: 'message', type: 'string' },
          { name: 'owner', type: 'address' },
          { name: 'items', type: 'string[]' },
        ],
      },
      primaryType: 'Content',
      domain: {
        name: 'cfx',
        version: '1',
        chainId: 1,
        verifyingContract: '0x0001',
      },
      message: {
        message: 'I want to burn my items:',
        owner: wallet,
        items: ['1', ' 2', ' 3', '4'],
      },
    };
    const result = await service.recoverSignature(signature, message);
    expect(result).toBe(publicKey);
  });
});
