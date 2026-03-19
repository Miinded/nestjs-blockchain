import { Controller, Get, INestApplication, Module, Injectable, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import * as crypto from 'crypto';

import { AuthBlockchainModule } from './auth-blockchain.module';
import { IBlockchainAuth } from './interface';
import Web3 from 'web3';
import { OfflineProvider, SignatureType, SiweMessage } from '@miinded/nestjs-web3-signature';

const RETURN_VALUE = 'test';

// WARNING: This is a test private key. DO NOT use in production!
const privateKey = '0xbe6383dad004f233317e46ddb46ad31b16064d14447a95cc1d8c8d4bc61c3728';

const createSignatureInTest = (message: SiweMessage) => {
  const web3 = new Web3(new OfflineProvider());
  const signature = web3.eth.accounts.sign(message.prepareMessage(), privateKey);
  return signature.signature;
};

@Controller()
class TestController {
  @UseGuards(AuthGuard('blockchain-jwt'))
  @Get('testa')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  test(@Request() req: any) {
    // console.log({
    //   user: req.user,
    // });
    return RETURN_VALUE;
  }

  @Get('testb')
  test2() {
    return RETURN_VALUE;
  }
}

@Injectable()
class MyBlockchainUserService implements IBlockchainAuth {
  async getOneUserByWallet(wallet: string): Promise<unknown> {
    return {
      wallet,
      ...{ id: 88, username: 'starker-xp' },
    };
  }

  async nonce(signatureType: SignatureType, networkId: number, wallet: string, uri: string, message: any) {
    const nonce = crypto.randomBytes(16).toString('hex');
    const issuedAt = new Date().toISOString();
    const result = {
      nonce,
      issuedAt,
      message,
      signatureType,
      uri,
    };
    await this.set(networkId, wallet, nonce, result);
    return result;
  }

  myCache: { [wallet: string]: unknown } = {};

  async get<T>(networkId: number, wallet: string, nonce: string): Promise<T> {
    return this.myCache[this._formatKey(networkId, wallet, nonce)] as T;
  }

  async set(networkId: number, wallet: string, nonce: string, value: unknown) {
    this.myCache[this._formatKey(networkId, wallet, nonce)] = value;
  }

  _formatKey(networkId: number, wallet: string, nonce: string) {
    return `blockchain-auth:${networkId}:${wallet}:${nonce}`;
  }
}

@Module({
  imports: [
    AuthBlockchainModule.registerAsync({
      userService: MyBlockchainUserService,
      useFactory: () => ({
        providers: {},
        secret: 'I Love JWT',
        domain: 'localhost',
        chainIds: [1],
      }),
    }),
  ],
  providers: [MyBlockchainUserService],
  controllers: [TestController],
})
class TestModule {}

describe('BlockchainMiddleware - Siwe', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    app = (
      await Test.createTestingModule({
        imports: [TestModule],
      }).compile()
    ).createNestApplication({});
    await app.init();
    server = app.getHttpServer();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it(`with valid signature`, async () => {
    // const nonce = crypto.randomBytes(16).toString('hex');
    const wallet = '0xEB014f8c8B418Db6b45774c326A0E64C78914dC0';
    const uri = 'http://localhost';

    const result1 = await request(server).post('/signature/nonce').send({
      wallet,
      networkId: 1,
      signatureType: SignatureType.SIWE,
      uri,
    });
    const { nonce, issuedAt } = result1.body.payload;

    const message = new SiweMessage({
      domain: 'localhost',
      address: wallet,
      statement: 'Sign in with Ethereum to the app.',
      uri,
      version: '1',
      chainId: 1,
      nonce,
      issuedAt,
    });

    const signature = createSignatureInTest(message);

    const result2 = await request(server)
      .post('/signature/login')
      .set('Content-Type', 'application/json')
      .set('wallet', wallet)
      .set('networkId', '1')
      .set('signature', signature)
      .set('nonce', nonce);
    const { access_token } = result2.body;
    await request(server).get('/testa').expect(401);
    await request(server).get('/testa').set('Authorization', `Bearer ${access_token}`).expect(200, RETURN_VALUE);
  });

  afterAll(async () => {
    await request(server).get('/testb').expect(200, RETURN_VALUE);
    server.closeAllConnections();
    await app.close();
  });
});
