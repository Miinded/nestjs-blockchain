import {
  AbstractBlockchainManager,
  AbstractProviderManager,
  BlockchainProviderError,
  BlockchainErrorCategory,
} from './blockchain.types';

describe('blockchain.types', () => {
  describe('AbstractBlockchainManager', () => {
    it('should allow blockchain-keyed resources', () => {
      const manager: AbstractBlockchainManager<{ url: string }> = {
        ethereum: { url: 'https://eth.example.com' },
        polygon: { url: 'https://polygon.example.com' },
      };
      expect(manager.ethereum.url).toBe('https://eth.example.com');
      expect(manager.polygon.url).toBe('https://polygon.example.com');
    });
  });

  describe('AbstractProviderManager', () => {
    it('should allow provider-keyed resources', () => {
      const manager: AbstractProviderManager<{ apiKey: string }> = {
        infura: { apiKey: 'abc123' },
        alchemy: { apiKey: 'def456' },
      };
      expect(manager.infura.apiKey).toBe('abc123');
      expect(manager.alchemy.apiKey).toBe('def456');
    });
  });

  describe('BlockchainProviderError', () => {
    class TestBlockchainError extends BlockchainProviderError {
      readonly provider = 'test';
    }

    it('should create error with correct properties', () => {
      const originalError = new Error('Original error');
      const error = new TestBlockchainError('sendTransaction', 'permission', originalError);

      expect(error.operation).toBe('sendTransaction');
      expect(error.category).toBe('permission');
      expect(error.originalError).toBe(originalError);
      expect(error.message).toBe('Blockchain sendTransaction failed (permission)');
      expect(error.name).toBe('BlockchainProviderError');
      expect(error.provider).toBe('test');
    });

    it('should support all error categories', () => {
      const categories: BlockchainErrorCategory[] = [
        'not_found',
        'permission',
        'timeout',
        'rate_limit',
        'validation',
        'unavailable',
        'invalid_signature',
        'chain_not_allowed',
      ];

      categories.forEach((category) => {
        const error = new TestBlockchainError('test', category, null);
        expect(error.category).toBe(category);
      });
    });
  });
});
