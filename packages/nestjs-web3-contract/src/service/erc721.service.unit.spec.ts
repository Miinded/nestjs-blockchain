import { Test, TestingModule } from '@nestjs/testing';
import { ERC721Service } from './erc721.service';
import Web3 from 'web3';

describe('ERC721Service', () => {
  let service: ERC721Service;
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
          call: jest.fn().mockResolvedValue(BigInt(5)),
        }),
        ownerOf: jest.fn().mockReturnValue({
          call: jest.fn().mockResolvedValue('0xowner'),
        }),
        name: jest.fn().mockReturnValue({
          call: jest.fn().mockResolvedValue('Test NFT'),
        }),
        symbol: jest.fn().mockReturnValue({
          call: jest.fn().mockResolvedValue('TNFT'),
        }),
        baseURI: jest.fn().mockReturnValue({
          call: jest.fn().mockResolvedValue('https://api.test.com/'),
        }),
        totalSupply: jest.fn().mockReturnValue({
          call: jest.fn().mockResolvedValue(BigInt(10000)),
        }),
        tokenURI: jest.fn().mockReturnValue({
          call: jest.fn().mockResolvedValue('https://api.test.com/token/1'),
        }),
        getApproved: jest.fn().mockReturnValue({
          call: jest.fn().mockResolvedValue('0xapproved'),
        }),
        isApprovedForAll: jest.fn().mockReturnValue({
          call: jest.fn().mockResolvedValue(true),
        }),
        supportsInterface: jest.fn().mockReturnValue({
          call: jest.fn().mockResolvedValue(true),
        }),
        safeTransferFrom: jest.fn().mockReturnValue({
          send: jest.fn().mockResolvedValue(true),
          estimateGas: jest.fn().mockResolvedValue(BigInt(21000)),
        }),
        transferFrom: jest.fn().mockReturnValue({
          send: jest.fn().mockResolvedValue(true),
          estimateGas: jest.fn().mockResolvedValue(BigInt(21000)),
        }),
        approve: jest.fn().mockReturnValue({
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
      providers: [ERC721Service],
    }).compile();

    service = module.get<ERC721Service>(ERC721Service);
    service.setWeb3(mockWeb3);
    service.setContract(mockContract);

    // Mock resolveAddress to return the address as-is
    jest.spyOn(service as any, 'resolveAddress').mockImplementation(async (address: unknown) => address as string);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('balanceOf', () => {
    it('should return balance of address', async () => {
      const result = await service.balanceOf('0x1234567890abcdef');
      expect(result).toBe(BigInt(5));
    });
  });

  describe('ownerOf', () => {
    it('should return owner of token', async () => {
      const result = await service.ownerOf(1);
      expect(result).toBe('0xowner');
    });
  });

  describe('name', () => {
    it('should return token name', async () => {
      const result = await service.name();
      expect(result).toBe('Test NFT');
    });
  });

  describe('symbol', () => {
    it('should return token symbol', async () => {
      const result = await service.symbol();
      expect(result).toBe('TNFT');
    });
  });

  describe('baseURI', () => {
    it('should return base URI', async () => {
      const result = await service.baseURI();
      expect(result).toBe('https://api.test.com/');
    });
  });

  describe('totalSupply', () => {
    it('should return total supply', async () => {
      const result = await service.totalSupply();
      expect(result).toBe(BigInt(10000));
    });
  });

  describe('tokenURI', () => {
    it('should return token URI', async () => {
      const result = await service.tokenURI(1);
      expect(result).toBe('https://api.test.com/token/1');
    });
  });

  describe('getApproved', () => {
    it('should return approved address', async () => {
      const result = await service.getApproved(1);
      expect(result).toBe('0xapproved');
    });
  });

  describe('isApprovedForAll', () => {
    it('should return approval status', async () => {
      const result = await service.isApprovedForAll('0xowner', '0xoperator');
      expect(result).toBe(true);
    });
  });

  describe('supportsInterface', () => {
    it('should return interface support status', async () => {
      const result = await service.supportsInterface('0xinterfaceid');
      expect(result).toBe(true);
    });
  });

  describe('safeTransferFrom', () => {
    it('should safely transfer token', async () => {
      const privateKey = '0xprivatekey';
      await service.safeTransferFrom(privateKey, '0xfrom', '0xto', 1);
    });
  });

  describe('transferFrom', () => {
    it('should transfer token', async () => {
      const privateKey = '0xprivatekey';
      const result = await service.transferFrom(privateKey, '0xfrom', '0xto', 1);
      expect(result).toBe(true);
    });
  });

  describe('approve', () => {
    it('should approve address', async () => {
      const privateKey = '0xprivatekey';
      const result = await service.approve(privateKey, '0xapproved', 1);
      expect(result).toBe(true);
    });
  });

  describe('setApprovalForAll', () => {
    it('should set approval for all', async () => {
      const privateKey = '0xprivatekey';
      await service.setApprovalForAll(privateKey, '0xoperator', true);
    });
  });
});
