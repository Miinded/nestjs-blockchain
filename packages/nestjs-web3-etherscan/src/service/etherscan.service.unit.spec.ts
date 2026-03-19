import { Test, TestingModule } from '@nestjs/testing';
import { EtherscanService } from './etherscan.service';
import { of, throwError } from 'rxjs';

describe('EtherscanService', () => {
  let service: EtherscanService;

  const mockHttpService = {
    get: jest.fn(),
    axiosRef: {
      defaults: {
        baseURL: 'https://api.etherscan.io',
      },
    },
  };

  const blockchainAddress = 'https://eth.llamarpc.com';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: EtherscanService,
          useFactory: () => {
            return new EtherscanService(mockHttpService as any, blockchainAddress);
          },
        },
      ],
    }).compile();

    service = module.get<EtherscanService>(EtherscanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWeb3', () => {
    it('should return Web3 instance', async () => {
      const web3 = await service.getWeb3();
      expect(web3).toBeDefined();
    });

    it('should return same Web3 instance on multiple calls', async () => {
      const web3_1 = await service.getWeb3();
      const web3_2 = await service.getWeb3();
      expect(web3_1).toBe(web3_2);
    });
  });

  describe('listLogs', () => {
    it('should return logs on success', async () => {
      const mockResponse = {
        data: {
          result: [
            {
              address: '0x123',
              topics: ['0xtopic'],
              data: '0xdata',
              blockHash: '0xhash',
              blockNumber: '0x1',
              timeStamp: '1234567890',
              gasPrice: '1000000000',
              gasUsed: '21000',
              transactionHash: '0xtxhash',
              transactionIndex: '0x0',
              logIndex: '0x0',
            },
          ],
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse as any));

      const result = await service.listLogs('0x123', 0, 'latest', '0xtopic');

      expect(result).toHaveLength(1);
      expect(result![0]!.address).toBe('0x123');
    });

    it('should return empty array on error', async () => {
      mockHttpService.get.mockReturnValue(throwError(() => new Error('Network error')));

      const result = await service.listLogs('0x123', 0, 'latest', '0xtopic');

      expect(result).toEqual([]);
    });
  });

  describe('decodeLog', () => {
    it('should decode log data', async () => {
      const inputs = [{ name: 'value', type: 'uint256' }];
      const data = '0x0000000000000000000000000000000000000000000000000000000000000001';
      const topics = ['0xtopic', '0xvalue'];

      const result = await service.decodeLog(inputs, data, topics);
      expect(result).toBeDefined();
    });
  });

  describe('getAbi', () => {
    it('should return ABI on success', async () => {
      const mockAbi = [{ name: 'transfer', type: 'function', inputs: [] }];
      const mockResponse = {
        data: {
          result: JSON.stringify(mockAbi),
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse as any));

      const result = await service.getAbi('0x123');

      expect(result).toEqual(mockAbi);
    });

    it('should return empty array on error', async () => {
      mockHttpService.get.mockReturnValue(throwError(() => new Error('Network error')));

      const result = await service.getAbi('0x123');

      expect(result).toEqual([]);
    });
  });

  describe('listTransactions', () => {
    it('should return transactions on success', async () => {
      const mockResponse = {
        data: {
          result: [
            {
              hash: '0xtxhash',
              nonce: '0',
              blockHash: '0xblockhash',
              blockNumber: '1',
              timeStamp: '1234567890',
              transactionIndex: '0',
              from: '0xfrom',
              to: '0xto',
              value: '1000000000000000000',
              gas: '21000',
              gasPrice: '1000000000',
              gasUsed: '21000',
              cumulativeGasUsed: '42000',
              isError: '0',
              txreceipt_status: '1',
              input: '0x',
              contractAddress: '',
              confirmations: '12',
              methodId: '0x',
              functionName: '',
            },
          ],
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse as any));

      const result = await service.listTransactions('0x123', 0, 'latest', 'DESC');

      expect(result).toHaveLength(1);
      expect(result![0]!.hash).toBe('0xtxhash');
    });

    it('should return undefined on error', async () => {
      mockHttpService.get.mockReturnValue(throwError(() => new Error('Network error')));

      const result = await service.listTransactions('0x123', 0, 'latest', 'DESC');

      expect(result).toBeUndefined();
    });
  });

  describe('getCurrentBlock', () => {
    it('should return current block number', async () => {
      const mockResponse = {
        data: {
          result: '0x10', // 16 in hex
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse as any));

      const result = await service.getCurrentBlock();

      expect(result).toBe(16);
    });

    it('should return safe block number when safe is true', async () => {
      const mockResponse = {
        data: {
          result: '0x20', // 32 in hex
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse as any));

      const result = await service.getCurrentBlock(true);

      expect(result).toBe('20'); // 32 - 12 = 20
    });

    it('should return undefined on error', async () => {
      mockHttpService.get.mockReturnValue(throwError(() => new Error('Network error')));

      const result = await service.getCurrentBlock();

      expect(result).toBeUndefined();
    });
  });

  describe('getCurrencyPrice', () => {
    it('should return price on success', async () => {
      const mockResponse = {
        data: {
          result: {
            ethbtc: '0.05',
            ethbtc_timestamp: '1234567890',
            ethusd: '2000.00',
            ethusd_timestamp: '1234567890',
          },
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse as any));

      const result = await service.getCurrencyPrice();

      expect(result).toEqual({
        ethbtc: '0.05',
        ethbtc_timestamp: '1234567890',
        ethusd: '2000.00',
        ethusd_timestamp: '1234567890',
      });
    });

    it('should return undefined on error', async () => {
      mockHttpService.get.mockReturnValue(throwError(() => new Error('Network error')));

      const result = await service.getCurrencyPrice();

      expect(result).toBeUndefined();
    });
  });
});
