import { Test, TestingModule } from '@nestjs/testing';
import { ERC1155Service } from './erc1155.service';
import Web3 from 'web3';

describe('ERC1155Service', () => {
  let service: ERC1155Service;
  let mockWeb3: Web3;
  let mockContract: any;

  beforeEach(async () => {
    mockWeb3 = {
      eth: {
        accounts: {
          privateKeyToAccount: jest.fn().mockReturnValue({ address: '0xpublickey' }),
        },
        getGasPrice: jest.fn().mockResolvedValue(BigInt(1000000000)),
        getTransactionCount: jest.fn().mockResolvedValue(0),
      },
    } as any;

    mockContract = {
      options: {
        address: '0xcontractaddress',
      },
      methods: {
        balanceOf: jest.fn().mockReturnValue({
          call: jest.fn().mockResolvedValue(BigInt(10)),
        }),
        balanceOfBatch: jest.fn().mockReturnValue({
          call: jest.fn().mockResolvedValue([BigInt(10), BigInt(20)]),
        }),
        uri: jest.fn().mockReturnValue({
          call: jest.fn().mockResolvedValue('https://api.test.com/token/{id}'),
        }),
        isApprovedForAll: jest.fn().mockReturnValue({
          call: jest.fn().mockResolvedValue(true),
        }),
        safeTransferFrom: jest.fn().mockReturnValue({
          send: jest.fn().mockResolvedValue(true),
          estimateGas: jest.fn().mockResolvedValue(BigInt(21000)),
        }),
        safeBatchTransferFrom: jest.fn().mockReturnValue({
          send: jest.fn().mockResolvedValue(true),
          estimateGas: jest.fn().mockResolvedValue(BigInt(21000)),
        }),
        setURI: jest.fn().mockReturnValue({
          send: jest.fn().mockResolvedValue(true),
          estimateGas: jest.fn().mockResolvedValue(BigInt(21000)),
        }),
        setApprovalForAll: jest.fn().mockReturnValue({
          send: jest.fn().mockResolvedValue(true),
          estimateGas: jest.fn().mockResolvedValue(BigInt(21000)),
        }),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [ERC1155Service],
    }).compile();

    service = module.get<ERC1155Service>(ERC1155Service);
    service.setWeb3(mockWeb3);
    service.setContract(mockContract);

    // Mock resolveAddress to return the address as-is
    jest.spyOn(service as any, 'resolveAddress').mockImplementation(async (address: unknown) => address as string);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('balanceOf', () => {
    it('should return balance of account', async () => {
      const result = await service.balanceOf('0x1234567890abcdef', 1);
      expect(result).toBe(BigInt(10));
    });
  });

  describe('balanceOfBatch', () => {
    it('should return balances of accounts', async () => {
      const result = await service.balanceOfBatch(['0xaccount1', '0xaccount2'], [1, 2]);
      expect(result).toEqual([BigInt(10), BigInt(20)]);
    });
  });

  describe('uri', () => {
    it('should return token URI', async () => {
      const result = await service.uri(1);
      expect(result).toBe('https://api.test.com/token/{id}');
    });
  });

  describe('isApprovedForAll', () => {
    it('should return approval status', async () => {
      const result = await service.isApprovedForAll('0xaccount', '0xoperator');
      expect(result).toBe(true);
    });
  });

  describe('safeTransferFrom', () => {
    it('should safely transfer token', async () => {
      const privateKey = '0xprivatekey';
      await service.safeTransferFrom(privateKey, '0xfrom', '0xto', 1, 10, '0xdata');
    });
  });

  describe('safeBatchTransferFrom', () => {
    it('should safely batch transfer tokens', async () => {
      const privateKey = '0xprivatekey';
      await service.safeBatchTransferFrom(privateKey, '0xfrom', '0xto', [1, 2], [10, 20], '0xdata');
    });
  });

  describe('setURI', () => {
    it('should set URI', async () => {
      const privateKey = '0xprivatekey';
      await service.setURI(privateKey, 'https://new.uri.com/');
    });
  });

  describe('setApprovalForAll', () => {
    it('should set approval for all', async () => {
      const privateKey = '0xprivatekey';
      await service.setApprovalForAll(privateKey, '0xoperator', true);
    });
  });
});
