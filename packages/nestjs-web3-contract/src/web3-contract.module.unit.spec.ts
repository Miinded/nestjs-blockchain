import { Controller, Get, INestApplication, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { Web3ContractModule, WEB3_CONTRACT_MANAGER, ContractRegistry, ContractConfig } from './web3-contract.module';
import { BaseContractService } from './service/base-contract.service';

const RETURN_VALUE = 'test';

const ERC20_ABI = [
  { type: 'function', name: 'totalSupply', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
] as const;

@Controller()
class TestController {
  @Get('testa')
  test() {
    return RETURN_VALUE;
  }
}

@Module({
  imports: [Web3ContractModule.registerAsync({ useFactory: () => ({}) })],
  controllers: [TestController],
})
class TestModule {}

@Module({
  imports: [
    Web3ContractModule.registerAsync({
      useFactory: () => {
        return {};
      },
    }),
  ],
  controllers: [TestController],
})
class TestModuleWithConfig {}

describe('Web3ContractModule', () => {
  let app: INestApplication;
  let server: any;

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it(`Test without config`, async () => {
    app = (
      await Test.createTestingModule({
        imports: [TestModule],
      }).compile()
    ).createNestApplication({});
    await app.init();
    server = app.getHttpServer();
    await request(server).get('/testa').expect(200, RETURN_VALUE);
  });

  it(`Test with empty config`, async () => {
    app = (
      await Test.createTestingModule({
        imports: [TestModuleWithConfig],
      }).compile()
    ).createNestApplication({});
    await app.init();
    server = app.getHttpServer();
    await request(server).get('/testa').expect(200, RETURN_VALUE);
  });

  it('should register ERC20 contract via HTTP provider', async () => {
    app = (
      await Test.createTestingModule({
        imports: [
          Web3ContractModule.registerAsync({
            useFactory: () => ({
              ETH: {
                blockchainAddress: 'https://eth.llamarpc.com',
                contracts: [
                  {
                    name: 'USDT',
                    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
                    contractType: 'ERC20',
                    abi: ERC20_ABI,
                  },
                ],
              },
            }),
          }),
        ],
      }).compile()
    ).createNestApplication({});
    await app.init();

    const manager = app.get<ContractRegistry>(WEB3_CONTRACT_MANAGER);
    expect(manager).toBeDefined();
    expect(manager['ETH']).toBeDefined();
    expect(manager['ETH'].get('USDT')).toBeDefined();
  });

  it('should register ERC721 contract', async () => {
    app = (
      await Test.createTestingModule({
        imports: [
          Web3ContractModule.registerAsync({
            useFactory: () => ({
              ETH: {
                blockchainAddress: 'https://eth.llamarpc.com',
                contracts: [
                  {
                    name: 'NFT',
                    contractAddress: '0x0000000000000000000000000000000000000001',
                    contractType: 'ERC721',
                    abi: ERC20_ABI,
                  },
                ],
              },
            }),
          }),
        ],
      }).compile()
    ).createNestApplication({});
    await app.init();

    const manager = app.get<ContractRegistry>(WEB3_CONTRACT_MANAGER);
    expect(manager['ETH'].get('NFT')).toBeDefined();
  });

  it('should register ERC1155 contract', async () => {
    app = (
      await Test.createTestingModule({
        imports: [
          Web3ContractModule.registerAsync({
            useFactory: () => ({
              ETH: {
                blockchainAddress: 'https://eth.llamarpc.com',
                contracts: [
                  {
                    name: 'MULTI',
                    contractAddress: '0x0000000000000000000000000000000000000001',
                    contractType: 'ERC1155',
                    abi: ERC20_ABI,
                  },
                ],
              },
            }),
          }),
        ],
      }).compile()
    ).createNestApplication({});
    await app.init();

    const manager = app.get<ContractRegistry>(WEB3_CONTRACT_MANAGER);
    expect(manager['ETH'].get('MULTI')).toBeDefined();
  });

  it('should register custom contract', async () => {
    const customService = new (class extends BaseContractService {})();
    app = (
      await Test.createTestingModule({
        imports: [
          Web3ContractModule.registerAsync({
            useFactory: () => ({
              ETH: {
                blockchainAddress: 'https://eth.llamarpc.com',
                contracts: [
                  {
                    name: 'CUSTOM',
                    contractAddress: '0x0000000000000000000000000000000000000001',
                    contractType: 'custom',
                    abi: ERC20_ABI,
                    contractCustom: customService,
                  } as ContractConfig,
                ],
              },
            }),
          }),
        ],
      }).compile()
    ).createNestApplication({});
    await app.init();

    const manager = app.get<ContractRegistry>(WEB3_CONTRACT_MANAGER);
    expect(manager['ETH'].get('CUSTOM')).toBe(customService);
  });

  it('should throw when abi is missing', async () => {
    await expect(
      Test.createTestingModule({
        imports: [
          Web3ContractModule.registerAsync({
            useFactory: () => ({
              ETH: {
                blockchainAddress: 'https://eth.llamarpc.com',
                contracts: [
                  {
                    name: 'NO_ABI',
                    contractAddress: '0x0000000000000000000000000000000000000001',
                    contractType: 'ERC20',
                  },
                ],
              },
            }),
          }),
        ],
      }).compile(),
    ).rejects.toThrow('Abi missing');
  });

  it('should use register (sync) method', async () => {
    app = (
      await Test.createTestingModule({
        imports: [
          Web3ContractModule.register({
            ETH: {
              blockchainAddress: 'https://eth.llamarpc.com',
              contracts: [],
            },
          }),
        ],
      }).compile()
    ).createNestApplication({});
    await app.init();

    const manager = app.get<ContractRegistry>(WEB3_CONTRACT_MANAGER);
    expect(manager).toBeDefined();
    expect(manager['ETH']).toBeDefined();
  });

  it('should use WSS provider', async () => {
    app = (
      await Test.createTestingModule({
        imports: [
          Web3ContractModule.registerAsync({
            useFactory: () => ({
              ETH: {
                blockchainAddress: 'wss://eth.llamarpc.com',
                contracts: [],
              },
            }),
          }),
        ],
      }).compile()
    ).createNestApplication({});
    await app.init();

    const manager = app.get<ContractRegistry>(WEB3_CONTRACT_MANAGER);
    expect(manager['ETH']).toBeDefined();
  });

  it('should skip blockchain with no config', async () => {
    app = (
      await Test.createTestingModule({
        imports: [
          Web3ContractModule.registerAsync({
            useFactory: () => ({
              ETH: undefined as any,
            }),
          }),
        ],
      }).compile()
    ).createNestApplication({});
    await app.init();

    const manager = app.get<ContractRegistry>(WEB3_CONTRACT_MANAGER);
    expect(manager['ETH']).toBeDefined();
  });

  afterEach(async () => {
    if (app) await app.close();
  });
});
