import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainJwtMiddleware } from './blockchain-jwt.middleware';
import { Request, Response } from 'express';

describe('BlockchainJwtMiddleware', () => {
  let middleware: BlockchainJwtMiddleware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockchainJwtMiddleware],
    }).compile();

    middleware = module.get<BlockchainJwtMiddleware>(BlockchainJwtMiddleware);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should call next when user is authenticated', async () => {
    const mockReq = {} as Request;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;
    const mockNext = jest.fn();

    await middleware.use(mockReq, mockRes, mockNext);
  });

  it('should return 401 when user is not authenticated', async () => {
    const mockReq = {} as Request;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;
    const mockNext = jest.fn();

    await middleware.use(mockReq, mockRes, mockNext);
  });
});
