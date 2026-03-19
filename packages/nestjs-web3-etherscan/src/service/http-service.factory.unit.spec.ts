import { Test, TestingModule } from '@nestjs/testing';
import { HttpServiceFactory } from './http-service.factory';

describe('HttpServiceFactory', () => {
  let factory: HttpServiceFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpServiceFactory],
    }).compile();

    factory = module.get<HttpServiceFactory>(HttpServiceFactory);
  });

  it('should be defined', () => {
    expect(factory).toBeDefined();
  });

  describe('createHttpService', () => {
    it('should create HttpService with valid config', () => {
      const apiUrl = 'https://api.etherscan.io';
      const apiKey = 'test-api-key';

      const result = factory.createHttpService(apiUrl, apiKey);

      expect(result).toBeDefined();
    });

    it('should throw error when apiUrl is empty', () => {
      const apiUrl = '';
      const apiKey = 'test-api-key';

      expect(() => factory.createHttpService(apiUrl, apiKey)).toThrow('Invalid Etherscan configuration');
    });

    it('should throw error when apiKey is empty', () => {
      const apiUrl = 'https://api.etherscan.io';
      const apiKey = '';

      expect(() => factory.createHttpService(apiUrl, apiKey)).toThrow('Invalid Etherscan configuration');
    });

    it('should throw error when both apiUrl and apiKey are empty', () => {
      const apiUrl = '';
      const apiKey = '';

      expect(() => factory.createHttpService(apiUrl, apiKey)).toThrow('Invalid Etherscan configuration');
    });
  });
});
