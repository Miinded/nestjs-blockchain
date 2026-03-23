import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainAuthController } from './blockchain-auth.controller';
import { JwtService } from '@nestjs/jwt';
import { IBlockchainAuth } from '../interface/IBlockchainAuth.interface';
import { SignatureType } from '@miinded/nestjs-web3-signature';
import { HttpException } from '@nestjs/common';

class MockUserService implements IBlockchainAuth {
  async getOneUserByWallet(wallet: string) {
    return { id: '1', username: 'test', wallet };
  }
  async nonce(signatureType: SignatureType, networkId: number, wallet: string, uri: string, message: string) {
    return { nonce: 'test-nonce', issuedAt: '2023-01-01' };
  }
  async get<T>(): Promise<T> {
    return { nonce: 'test-nonce', issuedAt: '2023-01-01' } as T;
  }
}

describe('BlockchainAuthController', () => {
  let controller: BlockchainAuthController;
  let userService: MockUserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const mockUserService = new MockUserService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockchainAuthController],
      providers: [
        {
          provide: 'BlockchainUserService',
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
      ],
    }).compile();

    controller = module.get<BlockchainAuthController>(BlockchainAuthController);
    userService = module.get('BlockchainUserService');
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generateNonceSignature', () => {
    it('should generate nonce for SIMPLE signature type', async () => {
      const body = {
        networkId: 1,
        wallet: '0x1234567890abcdef',
        domain: 'localhost',
        uri: 'http://localhost:3000',
        signatureType: SignatureType.SIMPLE,
      };

      const result = await controller.generateNonceSignature(body);

      expect(result).toEqual({
        payload: {
          nonce: 'test-nonce',
          issuedAt: '2023-01-01',
        },
      });
    });

    it('should generate nonce for ADVANCED signature type', async () => {
      const body = {
        networkId: 1,
        wallet: '0x1234567890abcdef',
        domain: 'localhost',
        uri: 'http://localhost:3000',
        signatureType: SignatureType.ADVANCED,
      };

      const result = await controller.generateNonceSignature(body);

      expect(result).toEqual({
        payload: {
          nonce: 'test-nonce',
          issuedAt: '2023-01-01',
        },
      });
    });

    it('should generate nonce for SIWE signature type', async () => {
      const body = {
        networkId: 1,
        wallet: '0x1234567890abcdef',
        domain: 'localhost',
        uri: 'http://localhost:3000',
        signatureType: SignatureType.SIWE,
      };

      const result = await controller.generateNonceSignature(body);

      expect(result).toEqual({
        payload: {
          nonce: 'test-nonce',
          issuedAt: '2023-01-01',
        },
      });
    });

    it('should throw HttpException on error', async () => {
      const body = {
        networkId: 1,
        wallet: '0x1234567890abcdef',
        domain: 'localhost',
        uri: 'http://localhost:3000',
        signatureType: SignatureType.SIMPLE,
      };

      jest.spyOn(userService, 'nonce').mockRejectedValueOnce(new Error('Test error'));

      await expect(controller.generateNonceSignature(body)).rejects.toThrow(HttpException);
    });
  });

  describe('login', () => {
    it('should return access token and user', async () => {
      const mockRequest = {
        user: {
          id: '1',
          username: 'testuser',
          wallet: '0x1234567890abcdef',
        },
      };

      const result = await controller.login(mockRequest as any);

      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: mockRequest.user,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        userId: '1',
        username: 'testuser',
        wallet: '0x1234567890abcdef',
      });
    });
  });
});
