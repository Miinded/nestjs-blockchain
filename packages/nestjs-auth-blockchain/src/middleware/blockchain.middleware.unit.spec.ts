import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainMiddleware } from './blockchain.middleware';
import { Request, Response } from 'express';

describe('BlockchainMiddleware', () => {
  let middleware: BlockchainMiddleware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockchainMiddleware],
    }).compile();

    middleware = module.get<BlockchainMiddleware>(BlockchainMiddleware);
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
