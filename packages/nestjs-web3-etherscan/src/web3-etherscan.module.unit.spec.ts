import { Controller, Get, INestApplication, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { Web3EtherscanModule } from './web3-etherscan.module';

const RETURN_VALUE = 'test';

@Controller()
class TestController {
  @Get('testa')
  test() {
    return RETURN_VALUE;
  }
}

@Module({
  imports: [Web3EtherscanModule.registerAsync({ useFactory: () => ({}) })],
  controllers: [TestController],
})
class TestModule {}

@Module({
  imports: [
    Web3EtherscanModule.registerAsync({
      useFactory: () => {
        return {
          ETHERSCAN: {
            apiUrl: 'https://api.etherscan.io',
            apiKey: 'test-api-key',
            blockchainAddress: 'https://eth.llamarpc.com',
          },
        };
      },
    }),
  ],
  controllers: [TestController],
})
class TestModuleWithConfig {}

describe('Web3EtherscanModule', () => {
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

  it(`Test with config`, async () => {
    app = (
      await Test.createTestingModule({
        imports: [TestModuleWithConfig],
      }).compile()
    ).createNestApplication({});
    await app.init();
    server = app.getHttpServer();
    await request(server).get('/testa').expect(200, RETURN_VALUE);
  });

  it(`Test with register (sync)`, async () => {
    app = (
      await Test.createTestingModule({
        imports: [
          Web3EtherscanModule.register({
            ETHERSCAN: {
              apiUrl: 'https://api.etherscan.io',
              apiKey: 'test-api-key',
              blockchainAddress: 'https://eth.llamarpc.com',
            },
          }),
        ],
        controllers: [TestController],
      }).compile()
    ).createNestApplication({});
    await app.init();
    server = app.getHttpServer();
    await request(server).get('/testa').expect(200, RETURN_VALUE);
  });

  afterEach(async () => {
    await app.close();
  });
});
