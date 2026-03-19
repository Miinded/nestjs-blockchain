import { Test, TestingModule } from '@nestjs/testing';
import { ERC20Service } from './erc20.service';
import Web3 from 'web3';

describe('ERC20Service', () => {
  let service: ERC20Service;
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
        totalSupply: jest.fn().mockReturnValue({
          call: jest.fn().mockResolvedValue(BigInt(1000000)),
        }),
        balanceOf: jest.fn().mockReturnValue({
          call: jest.fn().mockResolvedValue(BigInt(500)),
        }),
        name: jest.fn().mockReturnValue({
          call: jest.fn().mockResolvedValue('Test Token'),
        }),
        symbol: jest.fn().mockReturnValue({
          call: jest.fn().mockResolvedValue('TT'),
        }),
        decimals: jest.fn().mockReturnValue({
          call: jest.fn().mockResolvedValue(BigInt(18)),
        }),
        allowance: jest.fn().mockReturnValue({
          call: jest.fn().mockResolvedValue(BigInt(100)),
        }),
        transfer: jest.fn().mockReturnValue({
          send: jest.fn().mockResolvedValue(true),
          estimateGas: jest.fn().mockResolvedValue(BigInt(21000)),
        }),
        approve: jest.fn().mockReturnValue({
          send: jest.fn().mockResolvedValue(true),
          estimateGas: jest.fn().mockResolvedValue(BigInt(21000)),
        }),
        transferFrom: jest.fn().mockReturnValue({
          send: jest.fn().mockResolvedValue(true),
          estimateGas: jest.fn().mockResolvedValue(BigInt(21000)),
        }),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [ERC20Service],
    }).compile();

    service = module.get<ERC20Service>(ERC20Service);
    service.setWeb3(mockWeb3);
    service.setContract(mockContract);

    // Mock resolveAddress to return the address as-is
    jest.spyOn(service as any, 'resolveAddress').mockImplementation(async (address: unknown) => address as string);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('totalSupply', () => {
    it('should return total supply', async () => {
      const result = await service.totalSupply();
      expect(result).toBe(BigInt(1000000));
    });
  });

  describe('balanceOf', () => {
    it('should return balance of address', async () => {
      const result = await service.balanceOf('0x1234567890abcdef');
      expect(result).toBe(BigInt(500));
    });
  });

  describe('name', () => {
    it('should return token name', async () => {
      const result = await service.name();
      expect(result).toBe('Test Token');
    });
  });

  describe('symbol', () => {
    it('should return token symbol', async () => {
      const result = await service.symbol();
      expect(result).toBe('TT');
    });
  });

  describe('decimals', () => {
    it('should return token decimals', async () => {
      const result = await service.decimals();
      expect(result).toBe(BigInt(18));
    });
  });

  describe('allowance', () => {
    it('should return allowance', async () => {
      const result = await service.allowance('0xowner', '0xspender');
      expect(result).toBe(BigInt(100));
    });
  });

  describe('transfer', () => {
    it('should transfer tokens', async () => {
      const privateKey = '0xprivatekey';
      const result = await service.transfer(privateKey, '0xrecipient', 100);
      expect(result).toBe(true);
    });
  });

  describe('approve', () => {
    it('should approve spender', async () => {
      const privateKey = '0xprivatekey';
      const result = await service.approve(privateKey, '0xspender', 100);
      expect(result).toBe(true);
    });
  });

  describe('transferFrom', () => {
    it('should transfer from', async () => {
      const privateKey = '0xprivatekey';
      const result = await service.transferFrom(privateKey, '0xsender', '0xrecipient', 100);
      expect(result).toBe(true);
    });
  });
});
