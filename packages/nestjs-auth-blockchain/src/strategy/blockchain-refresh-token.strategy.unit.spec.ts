import { BlockchainRefreshTokenStrategy } from './blockchain-refresh-token.strategy';
import { IBlockchainAuthRefresh } from '../interface/IBlockchainAuthRefresh.interface';
import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JwtTokenOptions } from '../auth-blockchain.module';

describe('BlockchainRefreshTokenStrategy', () => {
  let strategy: BlockchainRefreshTokenStrategy;
  let mockUserService: jest.Mocked<IBlockchainAuthRefresh>;

  const createTokenOptions = (overrides: Partial<JwtTokenOptions> = {}): JwtTokenOptions => ({
    secret: 'refresh-secret',
    ...overrides,
  });

  beforeEach(() => {
    mockUserService = {
      getOneUserByUserId: jest.fn(),
      refreshTokenIsValid: jest.fn(),
      invalidateRefreshToken: jest.fn(),
      generateTokens: jest.fn(),
    } as unknown as jest.Mocked<IBlockchainAuthRefresh>;

    strategy = new BlockchainRefreshTokenStrategy(createTokenOptions(), mockUserService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should generate new tokens when refresh token is valid', async () => {
      const mockRequest = {
        get: jest.fn().mockReturnValue('Bearer refresh-token-123'),
        cookies: {},
      } as unknown as Request;
      const payload = { userId: 'user-123', wallet: '0x1234' };
      const user = { id: 'user-123', wallet: '0x1234' };
      const newTokens = { accessToken: 'new-access', refreshAccessToken: 'new-refresh' };

      mockUserService.refreshTokenIsValid.mockResolvedValue(true);
      mockUserService.getOneUserByUserId.mockResolvedValue(user);
      mockUserService.generateTokens.mockResolvedValue(newTokens);

      const result = await strategy.validate(mockRequest, payload);
      expect(result).toEqual(newTokens);
      expect(mockUserService.refreshTokenIsValid).toHaveBeenCalledWith('user-123', 'refresh-token-123');
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      const mockRequest = {
        get: jest.fn().mockReturnValue('Bearer refresh-token-123'),
        cookies: {},
      } as unknown as Request;
      const payload = { userId: 'user-123' };
      mockUserService.refreshTokenIsValid.mockResolvedValue(false);

      await expect(strategy.validate(mockRequest, payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when no refresh token in header', async () => {
      const mockReqNoToken = {
        get: jest.fn().mockReturnValue(undefined),
        cookies: {},
      } as unknown as Request;
      const payload = { userId: 'user-123' };

      await expect(strategy.validate(mockReqNoToken, payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const mockRequest = {
        get: jest.fn().mockReturnValue('Bearer refresh-token-123'),
        cookies: {},
      } as unknown as Request;
      const payload = { userId: 'user-123' };
      mockUserService.refreshTokenIsValid.mockResolvedValue(true);
      mockUserService.getOneUserByUserId.mockResolvedValue(null);

      await expect(strategy.validate(mockRequest, payload)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('transport options', () => {
    it('should create strategy with header transport by default', () => {
      const strategyWithDefaults = new BlockchainRefreshTokenStrategy(createTokenOptions(), mockUserService);
      expect(strategyWithDefaults).toBeDefined();
    });

    it('should create strategy with cookie transport', () => {
      const strategyWithCookie = new BlockchainRefreshTokenStrategy(
        createTokenOptions({ transport: 'cookie', cookieName: 'my_refresh_token' }),
        mockUserService,
      );
      expect(strategyWithCookie).toBeDefined();
    });
  });
});
